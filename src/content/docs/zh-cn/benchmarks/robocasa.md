---
title: RoboCasa 评测
description: 复现 StarVLA 在 RoboCasa GR1 Tabletop Tasks 上的实验结果。
---

**RoboCasa** 是一个大规模家庭环境仿真基准。这里我们使用的是 [GR1 Tabletop Tasks](https://github.com/robocasa/robocasa-gr1-tabletop-tasks) 子集，包含 24 个桌面 Pick-and-Place 任务，使用 Fourier GR1 人形机器人的上半身（双臂）进行操作。

本文档提供复现我们**实验结果**的操作指南。

评测流程主要包含两部分：

1. 配置 `robocasa` 环境与依赖。
2. 分别在 `starVLA` 与 `robocasa` 环境中启动服务并运行评测。

我们已在 **NVIDIA A100** 上验证该流程可稳定运行。

---

## 实验结果

| 任务 | GR00T-N1.6 | Qwen3GR00T | Qwen3PI | Qwen3OFT | Qwen3FAST |
|------|------------|------------|---------|----------|-----------|
| **PnP Bottle To Cabinet Close** | 51.5 | 46.0 | 26.0 | 30.0 | 38.0 |
| **PnP Can To Drawer Close** | 13.0 | 80.0 | 62.0 | 76.0 | 44.0 |
| **PnP Cup To Drawer Close** | 8.5 | 54.0 | 42.0 | 44.0 | 56.0 |
| **PnP Milk To Microwave Close** | 14.0 | 48.0 | 50.0 | 44.0 | 44.0 |
| **PnP Potato To Microwave Close** | 41.5 | 28.0 | 42.0 | 32.0 | 14.0 |
| **PnP Wine To Cabinet Close** | 16.5 | 46.0 | 32.0 | 36.0 | 14.0 |
| **PnP Novel From Cuttingboard To Basket** | 58.0 | 48.0 | 40.0 | 50.0 | 54.0 |
| **PnP Novel From Cuttingboard To Cardboardbox** | 46.5 | 40.0 | 46.0 | 40.0 | 42.0 |
| **PnP Novel From Cuttingboard To Pan** | 68.5 | 68.0 | 60.0 | 70.0 | 58.0 |
| **PnP Novel From Cuttingboard To Pot** | 65.0 | 52.0 | 40.0 | 54.0 | 58.0 |
| **PnP Novel From Cuttingboard To Tieredbasket** | 46.5 | 56.0 | 44.0 | 38.0 | 40.0 |
| **PnP Novel From Placemat To Basket** | 58.5 | 42.0 | 44.0 | 32.0 | 36.0 |
| **PnP Novel From Placemat To Bowl** | 57.5 | 44.0 | 52.0 | 58.0 | 38.0 |
| **PnP Novel From Placemat To Plate** | 63.0 | 48.0 | 50.0 | 52.0 | 42.0 |
| **PnP Novel From Placemat To Tieredshelf** | 28.5 | 18.0 | 28.0 | 24.0 | 18.0 |
| **PnP Novel From Plate To Bowl** | 57.0 | 60.0 | 52.0 | 60.0 | 52.0 |
| **PnP Novel From Plate To Cardboardbox** | 43.5 | 50.0 | 40.0 | 50.0 | 30.0 |
| **PnP Novel From Plate To Pan** | 51.0 | 54.0 | 36.0 | 66.0 | 48.0 |
| **PnP Novel From Plate To Plate** | 78.7 | 70.0 | 48.0 | 68.0 | 50.0 |
| **PnP Novel From Tray To Cardboardbox** | 51.5 | 38.0 | 34.0 | 44.0 | 28.0 |
| **PnP Novel From Tray To Plate** | 71.0 | 56.0 | 64.0 | 56.0 | 34.0 |
| **PnP Novel From Tray To Pot** | 64.5 | 50.0 | 44.0 | 62.0 | 46.0 |
| **PnP Novel From Tray To Tieredbasket** | 57.0 | 36.0 | 50.0 | 54.0 | 36.0 |
| **PnP Novel From Tray To Tieredshelf** | 31.5 | 16.0 | 28.0 | 30.0 | 16.0 |
| **平均** | **47.6** | **47.8** | **43.9** | **48.8** | **39.0** |

*注：所有数值均为成功率百分比。所有 24 个任务使用单一模型训练。结果基于每个任务 50 次 rollout。*

---

## RoboCasa 评测

### 0. 下载检查点

首先下载检查点：
- [Qwen3VL-GR00T](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1)
- [Qwen3VL-OFT](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa)

### 1. 环境配置

请先参考 [官方 RoboCasa 安装指南](https://github.com/robocasa/robocasa-gr1-tabletop-tasks?tab=readme-ov-file#getting-started) 安装基础 `robocasa-gr1-tabletop-tasks` 环境。

然后安装 socket 支持：

```bash
pip install tyro
```

---

### 2. 评测流程

#### Step 1. 启动服务端（starVLA 环境）

在第一个终端中，激活 `starVLA` conda 环境并运行：

```bash
python deployment/model_server/server_policy.py \
        --ckpt_path ${your_ckpt} \
        --port 5678 \
        --use_bf16
```

---

#### Step 2. 启动仿真（robocasa 环境）

在第二个终端中，激活 `robocasa` conda 环境并运行：

```bash
export PYTHONPATH=$(pwd):${PYTHONPATH}
your_ckpt=StarVLA/Qwen3-VL-OFT-Robocasa/checkpoints/steps_90000_pytorch_model.pt

python examples/Robocasa_tabletop/eval_files/simulation_env.py\
   --args.env_name ${env_name} \
   --args.port 5678 \
   --args.n_episodes 50 \
   --args.n_envs 1 \
   --args.max_episode_steps 720 \
   --args.n_action_steps 12 \
   --args.video_out_path ${video_out_path} \
   --args.pretrained_path ${your_ckpt}
```

#### 批量评测（可选）

如果你有更多 GPU，可以使用批量评测脚本：

```bash
bash examples/Robocasa_tabletop/batch_eval_args.sh
```

**注意**：请确保在 `batch_eval_args.sh` 中填写了正确的 checkpoint 路径。

---

## 复现训练结果

### Step 0：下载训练数据集

从 [HuggingFace](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim) 下载 PhysicalAI-Robotics-GR00T-X-Embodiment-Sim 目录数据集到 `playground/Datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim` 目录。

如需仅下载相关的微调文件夹，可参考 [GR00T-N1.5](https://github.com/NVIDIA/Isaac-GR00T/tree/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/examples/RoboCasa#-1-dataset-preparation) 仓库的说明。

或使用脚本下载 `*_1000` 文件夹：

```bash
python examples/Robocasa_tabletop/download_gr00t_ft_data.py
```

### Step 1：开始训练

可通过修改参数 `data_mix` 选择不同的数据集，使用以下脚本对 `*_1000` 数据集进行微调：

```bash
bash examples/Robocasa_tabletop/train_files/run_robocasa.sh
```
