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

### Modality JSON 文件

在训练目录下创建 `modality.json` 文件，定义 LeRobot 键与 StarVLA 键之间的映射：

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

StarVLA 提供了目前已经支持的数据集的全部 LeRobot 格式，或者使用了其他人提供的 LeRobot 数据集，具体可以到文档的对应章节查看。

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
        "state.arm_joint",
        "state.gripper_joint",
    ]
    action_keys = [
        "action.arm_joint",
        "action.gripper_joint",
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

从 DataConfig 中可以注意到 Modality 实现的映射关系。例如某一数据集中包含一个含有 arm, gripper, body, wheel 全部自由度的 state 和 action，Modality 可以从其中切出每段 index 对应的含义（通过 start 以及 end 这两个 key），并且在 DataConfig 中将它们重新拼接组织。

### 注册配置

将你的配置添加到 `data_config.py` 底部的 `ROBOT_TYPE_CONFIG_MAP` 中：

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... 现有配置 ...
    "my_robot": MyRobotDataConfig(),
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

:::tip
在 StarVLA 比较常见的 Setting 中，我们使用绝对 Joint Position 作为 State 或者 Action 的表征，此时一般来说推荐对于 Arm 使用 `min_max` 并对 Gripper 使用 `binary`。
:::

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
    hidden_size: 1024     # 和 DiT 最后的 projection 对应，用于 ActionDecoder
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
    diffusion_model_cfg:    # DiT Transformers 的参数
      cross_attention_dim: 2048 # VLM 的 dim
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
    data_mix: my_dataset           # 你注册的混合名称
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

| 框架 | 动作头 | 适用场景 |
|------|--------|----------|
| `QwenOFT` | MLP | 快速推理，简单任务 |
| `QwenGR00T` | Flow-matching DiT | 复杂操作，高精度 |
| `QwenFast` | 离散 token | 基于 token 的动作预测 |
| `QwenPI` | 扩散模型 | 多模态动作分布 |

你也可以选择社区支持的其他模型，它们共享 BaseFramework，因此可以仅仅通过修改 Config 来适配

## 步骤五：运行训练

创建训练脚本（例如 `examples/MyRobot/train_files/run_train.sh`）：

```bash
#!/bin/bash

# 配置
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml
# 以下内容演示如何覆盖 Config
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
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
  # 以下内容用于演示如何覆盖 Config
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
