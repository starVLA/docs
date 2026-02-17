---
title: LIBERO 评测
description: 复现 StarVLA 在 LIBERO 上的实验结果（环境配置、评测流程与训练说明）。
---

**LIBERO** 是一个桌面机械臂操作仿真基准，包含 4 个任务套件（Spatial、Object、Goal、Long Horizon），共 40 个任务，用来测试 VLA 模型的空间理解、物体识别、目标推理和长序列操作能力。使用 Franka 机械臂。

本文档提供在 LIBERO 上复现我们**实验结果**的操作指南。评测流程主要包含两部分：

1. 配置 `LIBERO` 环境与依赖。
2. 分别在 `starVLA` 与 `LIBERO` 环境中启动服务并运行评测。

我们已在 **NVIDIA A100** 与 **RTX 4090** 上验证该流程可稳定运行。

---

## LIBERO 测评

### 0. 下载检查点

我们在 Hugging Face 上提供了一组预训练检查点，方便社区进行评测：[🤗 StarVLA/bench-libero](https://huggingface.co/collections/StarVLA/libero)。对应的 LIBERO 结果汇总如下表。

#### 实验结果

| Model                | Steps | Epochs | Spatial | Object | Goal | Long | Avg  |
|----------------------|-------|--------|---------|--------|------|------|------|
| $\pi_0$+FAST         | -     | -      | 96.4    | 96.8   | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT          | 175K  | 223    | 97.6    | 98.4   | 97.9 | 94.5 | 97.1 |
| $\pi_0$              | -     | -      | 96.8    | 98.8   | 95.8 | 85.2 | 94.1 |
| GR00T-N1.5           | 20K   | 203    | 92.0    | 92.0   | 86.0 | 76.0 | 86.5 |
| **Qwen2.5-VL-FAST**  | 30K   | 9.54   | 97.3    | 97.2   | 96.1 | 90.2 | 95.2 |
| **Qwen2.5-VL-OFT**   | 30K   | 9.54   | 97.4    | 98.0   | 96.8 | 92.0 | 96.1 |
| **Qwen2.5-VL-GR00T** | 30K   | 9.54   | 97.8    | 98.2   | 94.6 | 90.8 | 95.4 |
| **Qwen3-VL-FAST**    | 30K   | 9.54   | 97.3    | 97.4   | 96.3 | 90.6 | 95.4 |
| **Qwen3-VL-OFT**     | 30K   | 9.54   | 97.8    | 98.6   | 96.2 | 93.8 | 96.6 |
| **Qwen3-VL-GR00T**   | 30K   | 9.54   | 97.8    | 98.8   | 97.4 | 92.0 | 96.5 |

我们使用同一个策略覆盖全部 4 个 suite。每个 task suite 的分数均为 500 次试验平均（10 个任务 × 每任务 50 个 episode）。

---

### 1. 环境配置

请先参考官方 [LIBERO 仓库](https://github.com/Lifelong-Robot-Learning/LIBERO) 安装基础 `LIBERO` 环境。

⚠️ **常见问题**：LIBERO 默认使用 Python 3.8，但 3.8 与 3.10 之间的语法更新差异较大。**我们验证 Python 3.10 可以避免许多问题**。

随后，在 `LIBERO` 环境中安装以下依赖：

```bash
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4
```

---

### 2. 评测流程

请在 **starVLA 主仓库根目录**使用**两个独立终端**运行评测（每个环境一个终端）：

- **starVLA 环境**：运行推理服务（server）。
- **LIBERO 环境**：运行仿真（simulation）。

#### Step 1. 启动服务端（starVLA 环境）

在第一个终端中，激活 `starVLA` conda 环境并运行：

```bash
bash examples/LIBERO/eval_files/run_policy_server.sh
```

⚠️ **注意**：请确保你在 `examples/LIBERO/eval_files/run_policy_server.sh` 中填写了正确的 checkpoint 路径。

---

#### Step 2. 启动仿真（LIBERO 环境）

在第二个终端中，激活 `LIBERO` conda 环境并运行：

```bash
bash examples/LIBERO/eval_files/eval_libero.sh
```

⚠️ **注意**：请确保你在 `eval_libero.sh` 中正确设置了以下变量：

| 变量 | 含义 | 示例 |
|------|------|------|
| `LIBERO_HOME` | LIBERO 仓库克隆路径 | `/path/to/LIBERO` |
| `LIBERO_Python` | LIBERO conda 环境的 Python 路径 | `$(which python)` （在 LIBERO 环境中） |
| `your_ckpt` | StarVLA checkpoint 路径 | `./results/Checkpoints/.../steps_30000_pytorch_model.pt` |
| `unnorm_key` | 数据集的 robot type 名，用于加载反归一化统计量 | `franka`（LIBERO 使用 Franka 机械臂） |

`unnorm_key` 用来从 checkpoint 中读取训练时保存的归一化统计信息（min/max 等），以便在评测时将模型输出的归一化动作恢复为实际关节角度。

最后，每次评测结果也会保存一段可视化视频（示例）：

![Example](../../../../assets/LIBERO_example.gif)

---

## LIBERO 训练

### Step 0：下载训练数据集

将数据集下载到 `playground/Datasets/LEROBOT_LIBERO_DATA` 目录：

- [LIBERO-spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [LIBERO-object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [LIBERO-goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [LIBERO-10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

并将 `modality.json` 移动到每个 `$LEROBOT_LIBERO_DATA/subset/meta/modality.json`。

你可以通过下面的脚本快速准备数据：

```bash
## Set DEST to the directory where you want to store the data
export DEST=/path/to/your/data/directory
bash examples/LIBERO/data_preparation.sh
```

### Step 1：开始训练

训练所需文件已整理在 `examples/LIBERO/train_files/`。

运行以下命令开始训练：

```bash
bash examples/LIBERO/train_files/run_libero_train.sh
```

⚠️ **注意**：请确保你在 `examples/LIBERO/train_files/run_libero_train.sh` 中填写了正确的路径。
