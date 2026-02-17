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

## SimplerEnv 评测

### 1. 环境配置

请先参考官方 [SimplerEnv 仓库](https://github.com/simpler-env/SimplerEnv) 安装基础 `simpler_env` 环境。

随后，在 `simpler_env` 环境中安装以下依赖：

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4
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

请在 **starVLA 主仓库根目录**使用**两个独立终端**运行评测（每个环境一个终端）：

- **starVLA 环境**：运行策略推理服务。
- **simpler_env 环境**：运行仿真评测代码。

#### Step 0. 下载检查点

下载检查点：[Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Step 1. 启动服务端（starVLA 环境）

在第一个终端中，激活 `starVLA` conda 环境并运行：

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**注意**：请确保在 `run_policy_server.sh` 中填写了正确的 checkpoint 路径。

---

#### Step 2. 启动仿真（simpler_env 环境）

在第二个终端中，激活 `simpler_env` conda 环境并运行：

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

此脚本会自动启动 WidowX 机器人评测任务，复现上述基准测试结果。

**注意**：请确保在 `start_simpler_env.sh` 中填写了正确的 `SimplerEnv_PATH`。

**常见问题：**
运行策略服务器时如果遇到 `NotImplementedError: Framework QwenGR00T is not implemented`，可能需要运行 `python QwenGR00T.py` 来检查环境。

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
