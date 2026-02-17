---
title: Model Zoo
description: Released modified models and finetuning checkpoints for reproduction and downstream use.
---

## Available Modified Models

| Model | Description | Link |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Extend Qwen2.5-VL vocabulary with fast tokens | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Extend Qwen3-VL vocabulary with fast tokens | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |

## Available Finetuning Checkpoints

| Model | Description | WidowX | Link |
| --- | --- | --- | --- |
| **QWen2.5-FAST-Bridge-RT-1** | Bridge + Fractal datasets | 58.6 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **QWen2.5-OFT-Bridge-RT-1** | Bridge + Fractal datasets | 41.8 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **QWen2.5-PI-Bridge-RT-1** | Bridge + Fractal datasets | 62.5 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **QWen2.5-GR00T-Bridge-RT-1** | Bridge + Fractal datasets | 63.6 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **QWen-GR00T-Bridge** | Bridge dataset only | 71.4 | [Hugging Face](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **QWen3VL-OFT-Bridge-RT-1** | Bridge + Fractal datasets | 42.7 | [Hugging Face](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **QWen3VL-GR00T-Bridge-RT-1** | Bridge + Fractal datasets | 65.3 | [Hugging Face](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |

## How to Use a Checkpoint

Download a checkpoint and run the policy server:

```bash
# Download (requires huggingface_hub)
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# Start the policy server
python deployment/model_server/server_policy.py \
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

Then follow the evaluation guide for the benchmark you want to test on (e.g. [SimplerEnv](/benchmarks/simplerenv/), [LIBERO](/benchmarks/libero/)).

## Notes

- **WidowX column**: Success rate (%) on the WidowX robot tasks in [SimplerEnv](/benchmarks/simplerenv/). Higher is better.
- Dataset references: [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot) and [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot).
- If you release new models, update this page and add links to the corresponding Hugging Face repos.
