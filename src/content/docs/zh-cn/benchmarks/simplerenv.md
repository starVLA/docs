---
title: SimplerEnv 评测
description: 复现 StarVLA 在 SimplerEnv 上的实验结果（环境配置、评测流程与训练说明）。
---

**SimplerEnv** 是一个基于 ManiSkill 的仿真评测环境，使用 WidowX 机械臂执行桌面操作任务（如抓取、放置、开关抽屉等）。它被广泛用于评测在 Open X-Embodiment（OXE）数据集上训练的 VLA 模型。

本文档提供在 SimplerEnv 上复现我们**实验结果**的操作指南。评测流程主要包含两部分：

1. 配置 `simpler_env` 环境与依赖。
2. 分别在 `starVLA` 与 `simpler_env` 环境中启动服务并运行评测。

我们已在 **NVIDIA A100** 与 **RTX 4090** 上验证该流程可稳定运行。

---

## Experimental Results

### WidowX Robot (Visual Matching)

| Method | Steps | Put Spoon on Towel | Put Carrot on Plate | Stack Green Block on Yellow Block | Put Eggplant in Yellow Basket | Average |
|--------|-------|--------------------|--------------------|---------------------------------|------------------------------|---------|
| RT-1-X | - | 0.0 | 4.2 | 0.0 | 0.0 | 1.1 |
| Octo-Base | - | 15.8 | 12.5 | 0.0 | 41.7 | 17.5 |
| Octo-Small | - | 41.7 | 8.2 | 0.0 | 56.7 | 26.7 |
| OpenVLA | - | 4.2 | 0.0 | 0.0 | 12.5 | 4.2 |
| CogACT | - | 71.7 | 50.8 | 15.0 | 67.5 | 51.3 |
| SpatialVLA | - | 16.7 | 25.0 | 29.2 | **100.0** | 42.7 |
| π₀ | - | 29.1 | 0.0 | 16.6 | 62.5 | 27.1 |
| π₀-FAST | - | 29.1 | 21.9 | 10.8 | 66.6 | 48.3 |
| GR00T N1.5 | - | 75.3 | 54.3 | **57.0** | 61.3 | 61.9 |
| Magma | - | 37.5 | 31.0 | 12.7 | 60.5 | 35.8 |
| **StarVLA-FAST (Qwen3-VL)** | 15K | 18.8 | 31.3 | 4.2 | 71.9 | 31.6 |
| **StarVLA-OFT (Qwen3-VL)** | 65K | **90.3** | 38.5 | 29.7 | **100.0** | 64.6 |
| **StarVLA-π (Qwen3-VL)** | 40K | 78.1 | 46.9 | 30.2 | 88.5 | 60.9 |
| **StarVLA-GR00T (Qwen3-VL)** | 20K | 83.0 | 59.4 | 18.8 | **100.0** | 65.3 |
| **StarVLA-OFT (Cosmos-Predict2-2B)** | 30K | 66.8 | 62.6 | 25.3 | 90.2 | 61.2 |
| **StarVLA-π (Cosmos-Predict2-2B)** | 30K | 81.4 | 55.2 | 25.1 | 73.0 | 58.7 |
| **StarVLA-GR00T (Cosmos-Predict2-2B)** | 30K | 80.4 | **65.4** | 20.0 | 80.6 | 61.6 |

### Google Robot (Visual Matching)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 85.7 | 44.2 | **73.0** | 6.5 | 52.4 |
| RT-1-X | 56.7 | 31.7 | 59.7 | 21.3 | 42.4 |
| RT-2-X | 78.7 | 77.9 | 25.0 | 3.7 | 46.3 |
| OpenVLA | 18.0 | 56.3 | 63.0 | 0.0 | 34.3 |
| CogACT | 91.3 | 85.0 | 71.8 | 50.9 | 74.8 |
| SpatialVLA | 86.0 | 77.9 | 57.4 | - | 75.1 |
| π₀ | 72.7 | 65.3 | 38.3 | - | 58.8 |
| π₀-FAST | 75.3 | 67.5 | 42.9 | - | 61.9 |
| GR00T N1.5* | 51.7 | 54.0 | 27.8 | 7.4 | 35.2 |
| Magma | 83.7 | 65.4 | 56.0 | 6.4 | 52.9 |
| **StarVLA-OFT** | **95.3** | 75.0 | 68.8 | **66.1** | **76.0** |

### Google Robot (Variant Aggregation)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 89.8 | 50.0 | 32.3 | 2.6 | 43.7 |
| RT-1-X | 49.0 | 32.3 | 29.4 | 10.1 | 30.2 |
| RT-2-X | 82.3 | 79.2 | 35.3 | 20.6 | 54.4 |
| OpenVLA | 60.8 | 67.7 | 28.8 | 0.0 | 39.3 |
| CogACT | 89.6 | 80.8 | 28.3 | 46.6 | 61.3 |
| SpatialVLA | 88.0 | **82.5** | 41.8 | - | 70.7 |
| π₀ | 75.2 | 63.7 | 25.6 | - | 54.8 |
| π₀-FAST | 77.6 | 68.2 | 31.3 | - | 59.0 |
| GR00T N1.5 | 69.3 | 68.7 | 35.8 | 4.0 | 44.5 |
| Magma | 68.8 | 65.7 | **53.4** | 18.5 | 51.6 |
| **StarVLA-OFT** | 91.3 | 75.1 | 55.0 | **59.4** | **70.2** |

*Note: All StarVLA Google Robot results use Qwen3-VL-4B as backbone. Numbers marked with \* denote our reimplementation.*

---

## SimplerEnv 评测

### 1. 环境配置

请先参考官方 [SimplerEnv 仓库](https://github.com/simpler-env/SimplerEnv) 安装基础 `simpler_env` 环境。

随后，在 `simpler_env` 环境中安装以下依赖：

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # 降级 numpy 是因为仿真环境对 numpy 版本有严格兼容性要求
```

**常见问题：**
在 NVIDIA A100 上测试 SimplerEnv 时，可能会遇到以下错误：
`libvulkan.so.1: cannot open shared object file: No such file or directory`
可参考此链接修复：[安装指南 – Vulkan 部分](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### 验证安装

我们提供了一个最小化的环境验证脚本：

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

如果看到 "✅ Env built successfully" 消息，说明 SimplerEnv 已正确安装并可以使用。

---

### 2. 评测流程

请在 **starVLA 主仓库根目录**使用**两个独立终端**运行评测（每个环境一个终端）。

:::note[为什么需要两个终端？]
模型推理（starVLA 环境）和仿真环境（simpler_env 环境）各自依赖不同的 Python 包版本，放在同一个 conda 环境中会产生冲突。因此需要分别在两个终端中激活各自的 conda 环境来运行。
:::

- **starVLA 环境**：运行策略推理服务。
- **simpler_env 环境**：运行仿真评测代码。

#### Step 0. 下载检查点

下载检查点：[Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Step 1. 启动服务端（starVLA 环境）

在第一个终端中，激活 `starVLA` conda 环境并运行：

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**注意**：请打开 `examples/SimplerEnv/eval_files/run_policy_server.sh`，找到 `your_ckpt` 变量，将其改为你实际的 checkpoint 路径，例如 `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`。

---

#### Step 2. 启动仿真（simpler_env 环境）

在第二个终端中，激活 `simpler_env` conda 环境并运行：

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

此脚本会自动启动 WidowX 机器人评测任务，复现上述基准测试结果。

**注意**：请打开 `examples/SimplerEnv/start_simpler_env.sh`，找到 `SimplerEnv_PATH` 变量，将其改为你的 SimplerEnv 仓库克隆路径（如 `/path/to/SimplerEnv`）。

**常见问题：**
运行策略服务器时如果遇到 `NotImplementedError: Framework QwenGR00T is not implemented`，这通常是因为 Framework 尚未被正确注册到 Python 的 import 路径中。请先运行冒烟测试来触发正确的注册：
```bash
python starVLA/model/framework/QwenGR00T.py
```
如果冒烟测试通过，再重新启动策略服务器即可。

---

## 在 OXE 上训练

### 数据准备

步骤：
1. 下载 LeRobot 格式的 OXE 数据集：
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. 将 `modality.json` 放入每个 `*lerobot/meta/modality.json`：
   - [bridge modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - 重命名为 `modality.json` 并放入 `bridge_orig_lerobot/meta/modality.json`
   - [fractal modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - 重命名为 `modality.json` 并放入 `fractal20220817_data_lerobot/meta/modality.json`

3. 在 `config.yaml` 中添加数据集路径：
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### 检查数据加载器

我们提供了一个简单的方式来检查你的数据加载器。确保可以加载批次数据：

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### 框架准备

在运行之前，需要确保你的框架可以使用 fake data 进行 `forward` 和 `predict_action`。

尝试以下命令：

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### 开始训练

准备就绪后，使用我们提供的脚本开始训练：

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**注意**：确保脚本明确使用经过验证的配置路径。如果尚未传递，请添加 `--config_yaml` 参数。
