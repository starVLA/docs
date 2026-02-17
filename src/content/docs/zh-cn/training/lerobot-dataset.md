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
# 假设你的原始数据按 episode（一次完整演示）组织，每个 episode 包含多帧
# 例如：episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # task 字段是 LeRobot 内部用于按任务对 episode 分组的必需字段，
            # 内容通常和 language_instruction 相同
            "task": frame["instruction"],
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

在训练目录下创建 `modality.json` 文件，定义 LeRobot 键与 StarVLA 键之间的映射。你可以把它理解为一个"翻译表"——把数据集中的原始列名翻译成 StarVLA 统一的内部名称，这样不同数据集只要提供各自的 `modality.json`，就能被同一套代码处理：

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

StarVLA 已为所有内置支持的 Benchmark 提供了对应的 `modality.json` 文件，你可以在各 Benchmark 的示例目录中找到它们（如 `examples/LIBERO/train_files/modality.json`、`examples/SimplerEnv/train_files/modality.json`）。

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

从 DataConfig 中可以注意到 Modality 实现的映射关系。例如某一数据集中包含一个含有 arm、gripper、body、wheel 全部自由度的 state 和 action，Modality 可以从其中切出每段 index 对应的含义（通过 `start` 以及 `end` 这两个 key），并且在 DataConfig 中将它们重新拼接组织。

**具体例子**：假设你的机器人有一个 7 自由度手臂 + 1 个夹爪，原始数据中 state 是一个 8 维向量 `[j0, j1, j2, j3, j4, j5, j6, gripper]`。在 `modality.json` 中，你可以这样切分：`"arm_joint": {"start": 0, "end": 7}` 取前 7 维（关节角度），`"gripper_joint": {"start": 7, "end": 8}` 取第 8 维（夹爪状态）。这样 StarVLA 就知道哪些维度是手臂、哪些是夹爪，从而可以分别使用不同的归一化策略。

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
在 StarVLA 常见的配置中，我们使用绝对关节位置（absolute joint position）作为状态和动作的表征。此时一般推荐对手臂关节使用 `min_max` 归一化，对夹爪使用 `binary` 归一化。
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
# ===== 运行配置 =====
run_id: my_robot_training           # 实验名称，checkpoint 保存在 run_root_dir/run_id/
run_root_dir: results/Checkpoints   # checkpoint 输出根目录
seed: 42
trackers: [jsonl, wandb]            # 日志方式：jsonl 本地文件 + wandb 在线
wandb_entity: your_wandb_entity     # 你的 wandb 用户名或团队名
wandb_project: my_robot_project
is_debug: false                     # 设为 true 时只用少量数据快速调试

# ===== 模型框架配置 =====
framework:
  name: QwenOFT                     # 选择框架：QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # VLM 基座模型路径
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # VLM 隐藏层维度（Qwen3-VL-4B 为 2048）
  dino:
    dino_backbone: dinov2_vits14    # 额外视觉编码器（可选，用于提供空间特征）

  action_model:
    action_model_type: DiT-B        # 动作模型类型（DiT-B 仅用于 GR00T/PI 框架）
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # 动作维度 = 你的机器人关节数（例：7关节×双臂=14）
    state_dim: 14                   # 状态维度，通常和 action_dim 相同
    future_action_window_size: 15   # 模型预测未来多少步动作（action chunk 长度-1）
    action_horizon: 16              # 总动作序列长度 = future + 1（当前步）
    past_action_window_size: 0      # 历史动作窗口（0 = 不使用历史动作）
    repeated_diffusion_steps: 8     # 训练时每步重复扩散采样次数（仅 GR00T/PI）
    num_inference_timesteps: 4      # 推理时扩散步数（越少越快，但精度可能下降）
    num_target_vision_tokens: 32    # 从 VLM 提取的视觉 token 数（压缩后）
    # 以下为 DiT Transformer 的内部参数，通常不需要修改：
    diffusion_model_cfg:
      cross_attention_dim: 2048     # 需与 VLM 的 hidden_dim 一致
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== 数据集配置 =====
datasets:
  # VLM 数据（可选，仅联合训练时需要）
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # 在 qwen_data_config.py 中注册的数据集名
    per_device_batch_size: 4

  # VLA 数据（机器人操作数据，必需）
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # 数据集根目录
    data_mix: my_dataset            # 在 mixtures.py 中注册的混合名称
    action_type: abs_qpos           # 动作类型：abs_qpos = absolute joint position（绝对关节位置，即目标角度值）
    default_image_resolution: [3, 224, 224]  # [通道, 高, 宽]
    per_device_batch_size: 16
    load_all_data_for_training: true # 启动时将所有训练数据加载到内存（加快训练速度，但占用更多内存）
    obs: ["image_0"]                # 使用哪些相机（image_0 对应 DataConfig 中 video_keys 列表的第一个相机）
    image_size: [224,224]
    video_backend: torchvision_av   # 视频解码后端（torchvision_av 或 decord）

# ===== 训练器配置 =====
trainer:
  epochs: 100
  max_train_steps: 100000           # 最大训练步数（达到后停止，不管 epoch）
  num_warmup_steps: 5000            # 学习率预热步数
  save_interval: 5000               # 每隔多少步保存 checkpoint
  eval_interval: 100                # 每隔多少步在验证集上评估

  # 分模块学习率：不同组件可以用不同学习率
  learning_rate:
    base: 1e-05                     # 默认学习率（其他模块如未指定则用此值）
    qwen_vl_interface: 1.0e-05      # VLM 骨干学习率
    action_model: 1.0e-04           # 动作头学习率（通常设高一些，因为从头训练）

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # 余弦退火的最小学习率

  freeze_modules: ''                # 要冻结的模块路径（空 = 全部可训练）
  loss_scale:
    vla: 1.0                        # VLA 损失权重
    vlm: 0.1                        # VLM 损失权重（联合训练时使用）
  repeated_diffusion_steps: 4       # 训练时每步扩散采样次数（覆盖 action_model 中的值）
  max_grad_norm: 1.0                # 梯度裁剪阈值
  gradient_accumulation_steps: 1    # 梯度累积步数（显存不够时增大）

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[关于 action_dim 和 state_dim]
这两个值取决于你的机器人硬件。例如：
- 单臂 7 关节 + 1 夹爪 → `action_dim: 8`, `state_dim: 8`
- 双臂各 7 关节 → `action_dim: 14`, `state_dim: 14`
- BEHAVIOR 的 R1Pro 人形 → `action_dim: 23`, `state_dim: 23`

必须与你在 DataConfig 中定义的 action/state keys 的总维度一致。
:::

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

# ========== 必需参数 ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # 训练配置文件（必需）

# ========== 可选覆盖参数（命令行优先级高于 YAML 文件中的值）==========
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
# --config_yaml 是唯一必需的参数，其余 --xxx 参数都是可选的命令行覆盖
# 如果你已经在 YAML 文件中配置好了所有参数，可以省略下面的覆盖参数
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
