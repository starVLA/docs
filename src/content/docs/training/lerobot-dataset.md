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
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            "task": frame["instruction"],  # Required duplicate
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

Create a `modality.json` file in your training directory to define the mapping between LeRobot keys and StarVLA keys:

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

StarVLA provides LeRobot formats for all currently supported datasets, or you can use LeRobot datasets provided by others. See the corresponding sections in the documentation for details.

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
# Run configuration
run_id: my_robot_training
run_root_dir: results/Checkpoints
seed: 42
trackers: [jsonl, wandb]
wandb_entity: your_wandb_entity
wandb_project: my_robot_project
is_debug: false

framework:
  name: QwenOFT
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048
  dino:
    dino_backbone: dinov2_vits14

  action_model:
    action_model_type: DiT-B
    hidden_size: 1024     # Corresponds to DiT's final projection, used for ActionDecoder
    add_pos_embed: True
    max_seq_len: 1024
    action_dim: 14
    state_dim: 14
    future_action_window_size: 15
    action_horizon: 16
    past_action_window_size: 0
    repeated_diffusion_steps: 8
    noise_beta_alpha: 1.5
    noise_beta_beta: 1.0
    noise_s: 0.999
    num_timestep_buckets: 1000
    num_inference_timesteps: 4
    num_target_vision_tokens: 32
    diffusion_model_cfg:    # DiT Transformer parameters
      cross_attention_dim: 2048 # VLM dim
      dropout: 0.2
      final_dropout: true
      interleave_self_attention: true
      norm_type: "ada_norm"
      num_layers: 16
      output_dim: 2560
      positional_embeddings: null

datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: asv2_conversation_en,asv2_detailed_description_en,asv2_region_captioning_en,coco_internvl_longcap_en,coco_karpathy_train_567_en,coco_negative_gpt4o_en,coco_poetry_zh,coco_rem_en_zh,cocorem_exist_yorn_en,cocotextv2_en,cocotextv2_gpt4o_en,okvqa_en,refcoco_grounding_aug_en,refcoco_grounding_en,tallyqa_coco_en,toloka_grounding_aug_en,vqav2_en,vsr_en
    eval_dataset: aokvqa_cauldron_llava_format
    data_flatten: false
    base_interval: 2
    max_pixels: 50176
    min_pixels: 784
    model_max_length: 2048
    model_type: qwen2.5vl
    per_device_batch_size: 4

  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT
    data_mix: my_dataset           # Your registered mixture name
    action_type: abs_qpos
    default_image_resolution: [3, 224, 224]
    per_device_batch_size: 16
    load_all_data_for_training: true
    obs: ["image_0"]
    image_size: [224,224]
    video_backend: torchvision_av

trainer:
  epochs: 100
  max_train_steps: 100000
  num_warmup_steps: 5000
  save_interval: 5000
  eval_interval: 100
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07
  freeze_modules: ''
  loss_scale:
    vla: 1.0
    vlm: 0.1
  repeated_diffusion_steps: 4
  max_grad_norm: 1.0
  warmup_ratio: 0.1
  weight_decay: 0.0
  logging_frequency: 10
  gradient_clipping: 1.0
  gradient_accumulation_steps: 1

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

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

# Configuration
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml
# The following demonstrates how to override config values
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
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  # The following demonstrates how to override config values
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
