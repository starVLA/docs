---
title: 模型库
description: 已发布的改造模型、微调检查点与数据集。
---

## 已发布的改造模型

| 模型 | 说明 | 链接 |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | 扩展 Qwen2.5-VL 词表，加入 fast tokens（用于将连续动作离散化为 token 的特殊词表扩展） | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | 扩展 Qwen3-VL 词表，加入 fast tokens（同上） | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | pi-fast 动作 tokenizer 权重 | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## 微调检查点

### SimplerEnv / Bridge

Bridge 是 WidowX 桌面操作数据集，Fractal 是 Google RT-1 机器人操作数据集。

| 模型 | 框架 | 基座 VLM | 说明 | WidowX | 链接 |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | 仅 Bridge | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal（小模型方案） | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**WidowX 列**：在 [SimplerEnv](/zh-cn/benchmarks/simplerenv/) 中 WidowX 机器人任务上的成功率（%），越高越好。

### LIBERO

LIBERO 包含 4 个任务套件（Spatial、Object、Goal、Long Horizon），共 40 个任务。所有检查点均为 4 套件联合训练。详见 [LIBERO 评测文档](/zh-cn/benchmarks/libero/)。

| 模型 | 框架 | 基座 VLM | 链接 |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

RoboCasa GR1 Tabletop Tasks，24 个桌面 Pick-and-Place 任务。详见 [RoboCasa 评测文档](/zh-cn/benchmarks/robocasa/)。

| 模型 | 框架 | 基座 VLM | 链接 |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

RoboTwin 2.0 双臂操作基准，50 个任务。详见 [RoboTwin 评测文档](/zh-cn/benchmarks/robotwin/)。

| 模型 | 框架 | 基座 VLM | 链接 |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

BEHAVIOR-1K 家庭任务基准，使用 R1Pro 人形机器人。详见 [BEHAVIOR 评测文档](/zh-cn/benchmarks/behavior/)。

| 模型 | 说明 | 链接 |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | 全部 50 个任务联合训练 | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | 单任务训练 | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | 6 任务联合训练 | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | 分割观测实验 | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## 数据集

### 训练数据集

| 数据集 | 说明 | 链接 |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | VLM 联合训练用图文数据集（ShareGPT4V-COCO 子集） | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | RoboTwin 2.0 的 clean 演示数据（每任务 50 条） | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | RoboTwin 2.0 的 randomized 演示数据（每任务 500 条） | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | 同上，tar.gz 打包格式（适合批量下载） | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### BEHAVIOR 相关数据

| 数据集 | 说明 | 链接 |
| --- | --- | --- |
| **BEHAVIOR-1K** | BEHAVIOR-1K 基准的仿真环境配置 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | BEHAVIOR-1K 训练数据集 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | BEHAVIOR-1K 场景与物体资源 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | BEHAVIOR-1K 可视化演示 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | 单任务训练数据样例 | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
除以上 StarVLA 自有数据集外，训练常用的第三方数据集包括：
- **SimplerEnv/OXE**：[Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)、[Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO**：[Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)、[Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)、[Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)、[10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa**：[PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## 如何使用检查点

下载检查点并启动策略服务器：

```bash
# 下载（需要安装 huggingface_hub）
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# 启动策略服务器
python deployment/model_server/server_policy.py \
    # steps_XXXXX 是训练步数，请替换为你下载的 checkpoint 中实际的文件名
    # 例如 steps_50000_pytorch_model.pt，可通过 ls 查看具体文件名
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

然后参照你要测试的 Benchmark 评测指南进行评测（如 [SimplerEnv](/zh-cn/benchmarks/simplerenv/)、[LIBERO](/zh-cn/benchmarks/libero/)、[RoboCasa](/zh-cn/benchmarks/robocasa/)、[RoboTwin](/zh-cn/benchmarks/robotwin/)、[BEHAVIOR](/zh-cn/benchmarks/behavior/)）。
