---
title: 使用自己的 LeRobot 数据集
description: 使用你自己的 LeRobot 格式数据集训练 StarVLA。
---

本指南将带你完成使用自己的机器人数据训练 StarVLA 的完整流程，从数据转换到模型训练。

## 概述

整个工作流程包含五个主要步骤：

1. **转换数据到 LeRobot 格式** - 将原始数据转换为标准化的 LeRobot 格式
2. **创建 Robot Type Config** - 定义机器人数据模态的结构
3. **创建 Data Mix** - 在混合数据注册表中注册你的数据集
4. **创建训练配置** - 配置训练参数
5. **运行训练** - 启动训练脚本

## 步骤一：转换数据到 LeRobot 格式

StarVLA 使用 LeRobot 数据集格式进行 VLA 训练。你需要先将机器人数据转换为此格式。

### LeRobot 数据结构

LeRobot 数据集需要以下特征：

- **`observation.state`**：机器人状态（关节位置、末端执行器位姿等）
- **`action`**：机器人动作（关节命令、位置增量等）
- **`observation.images.*`**：相机图像（以视频形式存储）
- **`language_instruction`** 或 **`task`**：任务描述文本

### 转换示例

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# 定义数据集特征
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # 例如：6个关节 + 1个夹爪
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # 高度, 宽度, 通道
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# 创建数据集
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# 从你的数据中添加帧
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            "task": frame["instruction"],  # 必须的重复字段
        })
    dataset.save_episode()

# 完成数据集创建
dataset.finalize()
```

:::tip
更详细的 LeRobot 转换说明，请参考 [LeRobot 文档](https://github.com/huggingface/lerobot)。
:::

### 数据集目录结构

转换后，你的数据集应该具有以下结构：

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

## 步骤二：创建 Robot Type Config

Robot Type Config 定义了 StarVLA 如何读取和处理你的数据。在 `starVLA/dataloader/gr00t_lerobot/data_config.py` 中创建新的配置类。

### 配置结构

```python
class MyRobotDataConfig:
    # 定义每个模态的键
    video_keys = [
        "video.camera_1",      # 映射到 observation.images.camera_1
        "video.camera_2",      # 映射到 observation.images.camera_2
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

    # 索引配置
    observation_indices = [0]        # 用于观测的时间步
    action_indices = list(range(8))  # 动作预测范围（预测未来8步）

    def modality_config(self):
        """定义数据加载的模态配置。"""
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
        """定义数据变换。"""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # 状态变换
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # 动作变换
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

### 注册配置

将你的配置添加到 `data_config.py` 底部的 `ROBOT_TYPE_CONFIG_MAP` 中：

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... 现有配置 ...
    "my_robot": MyRobotDataConfig(),
}
```

### Modality JSON 文件

在训练目录下创建 `modality.json` 文件，定义 LeRobot 键与 StarVLA 键之间的映射：

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

### 归一化模式

`StateActionTransform` 可用的归一化模式：

| 模式 | 描述 |
|------|------|
| `min_max` | 使用最大/最小值统计归一化到 [-1, 1] |
| `q99` | 使用第1和第99百分位数归一化（对异常值鲁棒） |
| `binary` | 映射到 {-1, 1}，用于二值动作（如夹爪开/关） |
| `rotation_6d` | 将旋转转换为6D表示 |
| `axis_angle` | 将旋转转换为轴角表示 |

## 步骤三：创建 Data Mix

在 `starVLA/dataloader/gr00t_lerobot/mixtures.py` 中注册你的数据集：

```python
DATASET_NAMED_MIXTURES = {
    # ... 现有混合 ...

    # 单个数据集
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (数据集文件夹名, 采样权重, robot_type_config)
    ],

    # 多个数据集，不同权重
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # 一半采样权重
        ("my_dataset_task3", 2.0, "my_robot"),  # 两倍采样权重
    ],
}
```

### 数据目录结构

你的数据应该按以下方式组织：

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

## 步骤四：创建训练配置

创建 YAML 配置文件（例如 `examples/MyRobot/train_files/starvla_my_robot.yaml`）：

```yaml
# 运行配置
run_id: my_robot_training
run_root_dir: results/Checkpoints
seed: 42
trackers: [jsonl, wandb]
wandb_entity: your_wandb_entity
wandb_project: my_robot_project
is_debug: false

# 框架配置
framework:
  name: QwenOFT  # 选项：QwenOFT, QwenGR00T, QwenFast, QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048
  action_model:
    action_model_type: MLP  # QwenOFT 使用
    action_dim: 7           # 你的动作维度
    state_dim: 7            # 你的状态维度
    action_horizon: 8       # 预测的未来步数

# 数据集配置
datasets:
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT
    data_mix: my_dataset           # 你注册的混合名称
    action_type: delta_qpos        # 选项：abs_qpos, delta_qpos, delta_ee
    per_device_batch_size: 16
    obs: ["image_0"]               # 使用哪些图像

# 训练器配置
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

  freeze_modules: ''  # 要冻结的模块，逗号分隔
  gradient_accumulation_steps: 1
  enable_gradient_checkpointing: true

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

### 框架选项

| 框架 | 动作头 | 适用场景 |
|------|--------|----------|
| `QwenOFT` | MLP | 快速推理，简单任务 |
| `QwenGR00T` | Flow-matching DiT | 复杂操作，高精度 |
| `QwenFast` | 离散 token | 基于 token 的动作预测 |
| `QwenPI` | 扩散模型 | 多模态动作分布 |

### 动作类型

| 类型 | 描述 |
|------|------|
| `abs_qpos` | 绝对关节位置 |
| `delta_qpos` | 关节位置增量 |
| `delta_ee` | 末端执行器位姿增量 |

## 步骤五：运行训练

创建训练脚本（例如 `examples/MyRobot/train_files/run_train.sh`）：

```bash
#!/bin/bash

# 配置
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# 创建输出目录
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# 启动训练
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

### 多节点训练

对于多节点分布式训练：

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
  # ... 其他参数
```
