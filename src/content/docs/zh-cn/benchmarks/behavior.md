---
title: BEHAVIOR-1K 评测
description: 使用 StarVLA 框架运行 BEHAVIOR-1K 基准测试。
---

:::caution[建设中]
本文档正在积极开发中。
:::

**BEHAVIOR-1K** 是斯坦福大学开发的家庭任务仿真基准，包含 1000 种日常生活活动（如做饭、清洁、整理等）。我们按照 [2025 BEHAVIOR Challenge](https://behavior.stanford.edu/challenge/index.html) 的结构，在 50 个完整家庭任务上进行训练和评测。使用 R1Pro 人形机器人（双臂 + 底座 + 躯干，23 维动作空间）。

评测流程主要包含两部分：

1. 配置 `behavior` 环境与依赖。
2. 分别在 `starVLA` 与 `behavior` 环境中启动服务并运行评测。

:::note[为什么需要两个终端？]
模型推理（starVLA 环境）和仿真环境（behavior 环境）各自依赖不同的 Python 包版本，放在同一个 conda 环境中会产生冲突。因此需要分别在两个终端中激活各自的 conda 环境来运行。
:::

:::note[GPU 要求]
BEHAVIOR 的仿真器（OmniGibson）依赖**硬件光线追踪（RT Cores）**进行渲染。以下 GPU **不能使用**：A100、H100（它们没有 RT Cores）。

**推荐使用**：RTX 3090、RTX 4090 或其他 GeForce RTX / Quadro RTX 系列 GPU。

详情请参阅 [此 issue](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1872#issuecomment-3455002820) 和 [此讨论](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1875#issuecomment-3444246495)。
:::

---

## BEHAVIOR 评测

### 1. 环境配置

配置 `behavior` conda 环境：

```bash
git clone https://github.com/StanfordVL/BEHAVIOR-1K.git
conda create -n behavior python=3.10 -y
conda activate behavior
cd BEHAVIOR-1K
pip install "setuptools<=79"
# --omnigibson: 安装 OmniGibson 仿真器（BEHAVIOR 的底层物理引擎）
# --bddl: 安装 BDDL（Behavior Domain Definition Language，任务定义语言）
# --joylo: 安装 JoyLo（遥操作控制接口）
# --dataset: 下载 BEHAVIOR 数据集资源（场景、物体模型等）
./setup.sh --omnigibson --bddl --joylo --dataset
conda install -c conda-forge libglu
pip install rich omegaconf hydra-core msgpack websockets av pandas google-auth
```

同时在 starVLA 环境中：

```bash
pip install websockets
```

---

### 2. 评测流程

步骤：
1. 下载检查点
2. 根据需要选择以下脚本

#### (A) 并行评测脚本

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval.sh
```

运行 `start_parallel_eval.sh` 之前，设置以下路径：
- `star_vla_python`：StarVLA 环境的 Python 解释器
- `sim_python`：Behavior 环境的 Python 解释器
- `TASKS_JSONL_PATH`：从[训练数据集](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos)下载的任务描述文件（已包含在 `examples/Behavior/tasks.jsonl`）
- `BEHAVIOR_ASSET_PATH`：behavior 资源的本地路径（使用 `./setup.sh` 安装后默认在 `BEHAVIOR-1K/datasets`）

#### (B) 使用独立终端调试

为便于调试，你也可以在两个独立终端中分别启动客户端（评测环境）和服务端（策略）：

```bash
bash examples/Behavior/start_server.sh
bash examples/Behavior/start_client.sh
```

以上调试文件将在训练集上进行评测。

#### (C) 按任务评测（内存安全）

为防止内存溢出，我们实现了另一个文件 `start_parallel_eval_per_task.sh`：

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval_per_task.sh
```

- 脚本将迭代运行 `INSTANCE_NAMES` 中每个任务的评测
- 对于每个任务，将 `TEST_EVAL_INSTANCE_IDS` 中的所有实例分配到各 GPU
- 等待前一个任务完成后再继续下一个任务

---

## 注意事项

### Wrapper 类型

1. **RGBLowResWrapper**：仅使用 RGB 作为视觉观测，相机分辨率为 224×224。仅使用低分辨率 RGB 可以加速仿真器并减少评测时间。此 wrapper 可用于标准赛道。

2. **DefaultWrapper**：使用数据收集时的默认观测配置（RGB + 深度 + 分割，头部相机 720p，手腕相机 480p）。此 wrapper 可用于标准赛道，但评测速度会比 RGBLowResWrapper 慢很多。

3. **RichObservationWrapper**：加载额外的观测模态，如法线和光流，以及特权任务信息。此 wrapper 只能用于特权信息赛道。

### 动作维度

BEHAVIOR 的动作维度 = 23：

```python
"R1Pro": {
    "base": np.s_[0:3],           # 索引 0-2
    "torso": np.s_[3:7],          # 索引 3-6
    "left_arm": np.s_[7:14],      # 索引 7-13
    "left_gripper": np.s_[14:15], # 索引 14
    "right_arm": np.s_[15:22],    # 索引 15-21
    "right_gripper": np.s_[22:23] # 索引 22
}
```

### 视频保存

视频将以 `{task_name}_{idx}_{epi}.mp4` 格式保存，其中 `idx` 是实例编号，`epi` 是 episode 编号。

### 常见问题

**Segmentation fault (core dumped)：** 可能的原因是 Vulkan 未成功安装。请查看[此链接](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)。

**ImportError: libGL.so.1: cannot open shared object file:**
```bash
apt-get install ffmpeg libsm6 libxext6 -y
```
