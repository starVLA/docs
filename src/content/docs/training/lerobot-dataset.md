---
title: Use Your Own LeRobot Dataset
description: Train StarVLA with your own LeRobot-format dataset.
---

This guide walks you through the complete process of training StarVLA on your own robotics data, from data conversion to model training.

## Overview

The workflow consists of five main steps:

1. **Convert Data to LeRobot Format** - Transform your raw data into the standardized LeRobot format
2. **Create Robot Type Config** - Define how your robot's data modalities are structured
3. **Create Data Mix** - Register your dataset in the mixture registry
4. **Create Training Config** - Configure the training parameters
5. **Run Training** - Launch the training script

## Step 1: Convert Data to LeRobot Format

StarVLA uses the LeRobot dataset format for VLA training. You need to convert your robotics data to this format first.

### LeRobot Data Structure

A LeRobot dataset requires the following features:

- **`observation.state`**: Robot state (joint positions, end-effector pose, etc.)
- **`action`**: Robot actions (joint commands, delta positions, etc.)
- **`observation.images.*`**: Camera images (stored as video)
- **`language_instruction`** or **`task`**: Task description text

### Conversion Example

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# Define your dataset features
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # e.g., 6 joints + 1 gripper
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # height, width, channels
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# Create dataset
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# Add frames from your data
# Assume your raw data is organized by episode (one complete demonstration),
# each containing multiple frames.
# e.g.: episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # `task` is a required field used internally by LeRobot for grouping
            # episodes by task; its content is usually the same as language_instruction
            "task": frame["instruction"],
        })
    dataset.save_episode()

# Finalize the dataset
dataset.finalize()
```

:::tip
For detailed LeRobot conversion instructions, refer to the [LeRobot documentation](https://github.com/huggingface/lerobot).
:::

### Dataset Directory Structure

After conversion, your dataset should have this structure:

```
your_dataset_name/
├── meta/
│   ├── info.json
│   ├── episodes.jsonl
│   ├── stats.json
│   └── tasks.json
├── data/
│   └── chunk-000/
│       └── episode_000000.parquet
└── videos/
    └── chunk-000/
        └── observation.images.image/
            └── episode_000000.mp4
```

### Modality JSON File

Create a `modality.json` file in your training directory to define the mapping between LeRobot keys and StarVLA keys. Think of it as a "translation table" — it translates the raw column names in your dataset into StarVLA's unified internal names, so different datasets can be processed by the same code simply by providing their own `modality.json`:

```json
{
    "state": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "action": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "video": {
        "camera_1": {"original_key": "observation.images.camera_1"},
        "camera_2": {"original_key": "observation.images.camera_2"}
    },
    "annotation": {
        "human.action.task_description": {"original_key": "language_instruction"}
    }
}
```

StarVLA provides `modality.json` files for all built-in benchmarks. You can find them in each benchmark's example directory (e.g., `examples/LIBERO/train_files/modality.json`, `examples/SimplerEnv/train_files/modality.json`).

## Step 2: Create Robot Type Config

The Robot Type Config defines how StarVLA reads and processes your data. Create a new config class in `starVLA/dataloader/gr00t_lerobot/data_config.py`.

### Config Structure

```python
class MyRobotDataConfig:
    # Define the keys for each modality
    video_keys = [
        "video.camera_1",      # Maps to observation.images.camera_1
        "video.camera_2",      # Maps to observation.images.camera_2
    ]
    state_keys = [
        "state.arm_joint",
        "state.gripper_joint",
    ]
    action_keys = [
        "action.arm_joint",
        "action.gripper_joint",
    ]
    language_keys = ["annotation.human.action.task_description"]

    # Index configuration
    observation_indices = [0]        # Which timesteps to use for observation
    action_indices = list(range(8))  # Action horizon (predict 8 future steps)

    def modality_config(self):
        """Define modality configurations for data loading."""
        from starVLA.dataloader.gr00t_lerobot.datasets import ModalityConfig

        return {
            "video": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.video_keys,
            ),
            "state": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.state_keys,
            ),
            "action": ModalityConfig(
                delta_indices=self.action_indices,
                modality_keys=self.action_keys,
            ),
            "language": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.language_keys,
            ),
        }

    def transform(self):
        """Define data transformations."""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # State transforms
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # Action transforms
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

Note the mapping relationship implemented by Modality in the DataConfig. For example, if a dataset contains state and action with all degrees of freedom including arm, gripper, body, and wheel, Modality can slice out the meaning of each index range (via the `start` and `end` keys), and then reassemble and organize them in the DataConfig.

**Concrete example**: Suppose your robot has a 7-DOF arm + 1 gripper, and the raw state is an 8-dimensional vector `[j0, j1, j2, j3, j4, j5, j6, gripper]`. In `modality.json`, you split it as: `"arm_joint": {"start": 0, "end": 7}` for the first 7 dims (joint angles) and `"gripper_joint": {"start": 7, "end": 8}` for the 8th dim (gripper state). This lets StarVLA know which dimensions are arm joints and which are gripper, enabling different normalization strategies for each.

### Register the Config

Add your config to the `ROBOT_TYPE_CONFIG_MAP` at the bottom of `data_config.py`:

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... existing configs ...
    "my_robot": MyRobotDataConfig(),
}
```

### Normalization Modes

Available normalization modes for `StateActionTransform`:

| Mode | Description |
|------|-------------|
| `min_max` | Normalize to [-1, 1] using min/max statistics |
| `q99` | Normalize using 1st and 99th percentiles (robust to outliers) |
| `binary` | Map to {-1, 1} for binary actions (e.g., gripper open/close) |
| `rotation_6d` | Convert rotation to 6D representation |
| `axis_angle` | Convert rotation to axis-angle representation |

:::tip
In a common StarVLA setting, we use absolute Joint Position as the representation for State or Action. In this case, it is generally recommended to use `min_max` for Arm and `binary` for Gripper.
:::

## Step 3: Create Data Mix

Register your dataset in `starVLA/dataloader/gr00t_lerobot/mixtures.py`:

```python
DATASET_NAMED_MIXTURES = {
    # ... existing mixtures ...

    # Single dataset
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (dataset_folder_name, sampling_weight, robot_type_config)
    ],

    # Multiple datasets with different weights
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # Half sampling weight
        ("my_dataset_task3", 2.0, "my_robot"),  # Double sampling weight
    ],
}
```

### Data Directory Structure

Your data should be organized as:

```
playground/Datasets/MY_DATA_ROOT/
├── my_dataset_task1/
│   ├── meta/
│   ├── data/
│   └── videos/
├── my_dataset_task2/
│   ├── meta/
│   ├── data/
│   └── videos/
└── my_dataset_task3/
    ├── meta/
    ├── data/
    └── videos/
```

## Step 4: Create Training Config

Create a YAML config file (e.g., `examples/MyRobot/train_files/starvla_my_robot.yaml`):

```yaml
# ===== Run Configuration =====
run_id: my_robot_training           # Experiment name; checkpoints saved under run_root_dir/run_id/
run_root_dir: results/Checkpoints   # Root directory for checkpoint output
seed: 42
trackers: [jsonl, wandb]            # Logging: jsonl (local) + wandb (online)
wandb_entity: your_wandb_entity     # Your wandb username or team
wandb_project: my_robot_project
is_debug: false                     # Set true to use minimal data for quick debugging

# ===== Model Framework Configuration =====
framework:
  name: QwenOFT                     # Choose: QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # VLM base model path
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # VLM hidden dimension (2048 for Qwen3-VL-4B)
  dino:
    dino_backbone: dinov2_vits14    # Optional extra vision encoder for spatial features

  action_model:
    action_model_type: DiT-B        # Action model type (DiT-B only for GR00T/PI frameworks)
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # Action dimension = your robot's joint count (e.g., 7 joints × 2 arms = 14)
    state_dim: 14                   # State dimension, usually same as action_dim
    future_action_window_size: 15   # How many future steps the model predicts (action chunk length - 1)
    action_horizon: 16              # Total action sequence length = future + 1 (current step)
    past_action_window_size: 0      # Historical action window (0 = no history)
    repeated_diffusion_steps: 8     # Diffusion sampling repeats during training (GR00T/PI only)
    num_inference_timesteps: 4      # Diffusion steps at inference (fewer = faster, less precise)
    num_target_vision_tokens: 32    # Number of compressed vision tokens from VLM
    # DiT Transformer internals (usually no need to modify):
    diffusion_model_cfg:
      cross_attention_dim: 2048     # Must match VLM's hidden_dim
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== Dataset Configuration =====
datasets:
  # VLM data (optional, only needed for co-training)
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # Dataset name registered in qwen_data_config.py
    per_device_batch_size: 4

  # VLA data (robot manipulation data, required)
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # Dataset root directory
    data_mix: my_dataset            # Mixture name registered in mixtures.py
    action_type: abs_qpos           # Action type: abs_qpos = absolute joint position (target angle values)
    default_image_resolution: [3, 224, 224]  # [channels, height, width]
    per_device_batch_size: 16
    load_all_data_for_training: true # Load all training data into memory at startup (faster training, but uses more RAM)
    obs: ["image_0"]                # Which cameras to use (image_0 = first camera in DataConfig's video_keys list)
    image_size: [224,224]
    video_backend: torchvision_av   # Video decode backend (torchvision_av or decord)

# ===== Trainer Configuration =====
trainer:
  epochs: 100
  max_train_steps: 100000           # Max training steps (stops here regardless of epochs)
  num_warmup_steps: 5000            # Learning rate warmup steps
  save_interval: 5000               # Save checkpoint every N steps
  eval_interval: 100                # Evaluate on validation set every N steps

  # Per-module learning rates: different components can use different rates
  learning_rate:
    base: 1e-05                     # Default LR (used for modules not specified below)
    qwen_vl_interface: 1.0e-05      # VLM backbone LR
    action_model: 1.0e-04           # Action head LR (higher since training from scratch)

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # Minimum LR for cosine decay

  freeze_modules: ''                # Module paths to freeze (empty = all trainable)
  loss_scale:
    vla: 1.0                        # VLA loss weight
    vlm: 0.1                        # VLM loss weight (for co-training)
  repeated_diffusion_steps: 4       # Diffusion sampling repeats at train time (overrides action_model value)
  max_grad_norm: 1.0                # Gradient clipping threshold
  gradient_accumulation_steps: 1    # Increase if running out of GPU memory

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[About action_dim and state_dim]
These values depend on your robot hardware. Examples:
- Single arm with 7 joints + 1 gripper → `action_dim: 8`, `state_dim: 8`
- Dual arm with 7 joints each → `action_dim: 14`, `state_dim: 14`
- BEHAVIOR R1Pro humanoid → `action_dim: 23`, `state_dim: 23`

Must match the total dimension of action/state keys defined in your DataConfig.
:::

| Framework | Action Head | Best For |
|-----------|-------------|----------|
| `QwenOFT` | MLP | Fast inference, simple tasks |
| `QwenGR00T` | Flow-matching DiT | Complex manipulation, high precision |
| `QwenFast` | Discrete tokens | Token-based action prediction |
| `QwenPI` | Diffusion | Multimodal action distributions |

You can also choose community-supported models, which share the BaseFramework and can be adapted simply by modifying the config.

## Step 5: Run Training

Create a training script (e.g., `examples/MyRobot/train_files/run_train.sh`):

```bash
#!/bin/bash

# ========== Required parameter ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # Training config file (required)

# ========== Optional overrides (CLI takes priority over YAML values) ==========
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# Create output directory
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# Launch training
# --config_yaml is the only required argument; all other --xxx flags are optional CLI overrides.
# If you've already configured everything in your YAML file, you can omit the override flags below.
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  --framework.name ${Framework_name} \
  --framework.qwenvl.base_vlm ${base_vlm} \
  --datasets.vla_data.data_root_dir ${data_root} \
  --datasets.vla_data.data_mix ${data_mix} \
  --datasets.vla_data.per_device_batch_size 4 \
  --trainer.max_train_steps 100000 \
  --trainer.save_interval 10000 \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id}
```

### Multi-Node Training

For multi-node distributed training:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes ${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  # ... other arguments
```
