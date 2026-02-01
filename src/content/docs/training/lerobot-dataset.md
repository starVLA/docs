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
        "state.joint_1",
        "state.joint_2",
        "state.joint_3",
        "state.joint_4",
        "state.joint_5",
        "state.joint_6",
        "state.gripper",
    ]
    action_keys = [
        "action.joint_1",
        "action.joint_2",
        "action.joint_3",
        "action.joint_4",
        "action.joint_5",
        "action.joint_6",
        "action.gripper",
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

### Register the Config

Add your config to the `ROBOT_TYPE_CONFIG_MAP` at the bottom of `data_config.py`:

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... existing configs ...
    "my_robot": MyRobotDataConfig(),
}
```

### Modality JSON File

Create a `modality.json` file in your training directory to define the mapping between LeRobot keys and StarVLA keys:

```json
{
    "state": {
        "joint_1": {"start": 0, "end": 1},
        "joint_2": {"start": 1, "end": 2},
        "joint_3": {"start": 2, "end": 3},
        "joint_4": {"start": 3, "end": 4},
        "joint_5": {"start": 4, "end": 5},
        "joint_6": {"start": 5, "end": 6},
        "gripper": {"start": 6, "end": 7}
    },
    "action": {
        "joint_1": {"start": 0, "end": 1},
        "joint_2": {"start": 1, "end": 2},
        "joint_3": {"start": 2, "end": 3},
        "joint_4": {"start": 3, "end": 4},
        "joint_5": {"start": 4, "end": 5},
        "joint_6": {"start": 5, "end": 6},
        "gripper": {"start": 6, "end": 7}
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

### Normalization Modes

Available normalization modes for `StateActionTransform`:

| Mode | Description |
|------|-------------|
| `min_max` | Normalize to [-1, 1] using min/max statistics |
| `q99` | Normalize using 1st and 99th percentiles (robust to outliers) |
| `binary` | Map to {-1, 1} for binary actions (e.g., gripper open/close) |
| `rotation_6d` | Convert rotation to 6D representation |
| `axis_angle` | Convert rotation to axis-angle representation |

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

# Framework configuration
framework:
  name: QwenOFT  # Options: QwenOFT, QwenGR00T, QwenFast, QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048
  action_model:
    action_model_type: MLP  # For QwenOFT
    action_dim: 7           # Your action dimension
    state_dim: 7            # Your state dimension
    action_horizon: 8       # Number of future steps to predict

# Dataset configuration
datasets:
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT
    data_mix: my_dataset           # Your registered mixture name
    action_type: delta_qpos        # Options: abs_qpos, delta_qpos, delta_ee
    per_device_batch_size: 16
    obs: ["image_0"]               # Which images to use

# Trainer configuration
trainer:
  max_train_steps: 100000
  num_warmup_steps: 5000
  save_interval: 10000
  eval_interval: 100
  logging_frequency: 100

  learning_rate:
    base: 2.5e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 1.0e-06

  freeze_modules: ''  # Comma-separated list of modules to freeze
  gradient_accumulation_steps: 1
  enable_gradient_checkpointing: true

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

### Framework Options

| Framework | Action Head | Best For |
|-----------|-------------|----------|
| `QwenOFT` | MLP | Fast inference, simple tasks |
| `QwenGR00T` | Flow-matching DiT | Complex manipulation, high precision |
| `QwenFast` | Discrete tokens | Token-based action prediction |
| `QwenPI` | Diffusion | Multimodal action distributions |

### Action Types

| Type | Description |
|------|-------------|
| `abs_qpos` | Absolute joint positions |
| `delta_qpos` | Delta joint positions |
| `delta_ee` | Delta end-effector pose |

## Step 5: Run Training

Create a training script (e.g., `examples/MyRobot/train_files/run_train.sh`):

```bash
#!/bin/bash

# Configuration
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml
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
  --framework.name ${Framework_name} \
  --framework.qwenvl.base_vlm ${base_vlm} \
  --datasets.vla_data.data_root_dir ${data_root} \
  --datasets.vla_data.data_mix ${data_mix} \
  --datasets.vla_data.per_device_batch_size 16 \
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
