---
title: 模型库
description: 已发布的改造模型与微调检查点。
---

## 已发布的改造模型

| 模型 | 说明 | 链接 |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | 扩展 Qwen2.5-VL 词表，加入 fast tokens | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | 扩展 Qwen3-VL 词表，加入 fast tokens | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |

## 已发布的微调检查点

| 模型 | 说明 | WidowX | 链接 |
| --- | --- | --- | --- |
| **QWen2.5-FAST-Bridge-RT-1** | Bridge + Fractal 数据集 | 58.6 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **QWen2.5-OFT-Bridge-RT-1** | Bridge + Fractal 数据集 | 41.8 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **QWen2.5-PI-Bridge-RT-1** | Bridge + Fractal 数据集 | 62.5 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **QWen2.5-GR00T-Bridge-RT-1** | Bridge + Fractal 数据集 | 63.6 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **QWen-GR00T-Bridge** | 仅 Bridge 数据集 | 71.4 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **QWen3VL-OFT-Bridge-RT-1** | Bridge + Fractal 数据集 | 42.7 | [Hugging Face](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **QWen3VL-GR00T-Bridge-RT-1** | Bridge + Fractal 数据集 | 65.3 | [Hugging Face](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |

## 如何使用检查点

下载检查点并启动策略服务器：

```bash
# 下载（需要安装 huggingface_hub）
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# 启动策略服务器
python deployment/model_server/server_policy.py \
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

然后参照你要测试的 Benchmark 评测指南进行评测（如 [SimplerEnv](/zh-cn/benchmarks/simplerenv/)、[LIBERO](/zh-cn/benchmarks/libero/)）。

## 备注

- **WidowX 列**：在 [SimplerEnv](/zh-cn/benchmarks/simplerenv/) 中 WidowX 机器人任务上的成功率（%），越高越好。
- 数据集链接：[Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot) 与 [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)。
- 若发布新模型，请同步更新该页并补充 Hugging Face 链接。
