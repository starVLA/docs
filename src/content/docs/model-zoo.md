---
title: Model Zoo
description: Released modified models, finetuning checkpoints, and datasets.
---

## Available Modified Models

| Model | Description | Link |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Extend Qwen2.5-VL vocabulary with fast tokens (special vocabulary extension for discretizing continuous actions into tokens) | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Extend Qwen3-VL vocabulary with fast tokens (same as above) | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | pi-fast action tokenizer weights | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## Finetuning Checkpoints

### SimplerEnv / Bridge

Bridge is a WidowX tabletop manipulation dataset; Fractal is Google's RT-1 robot manipulation dataset.

| Model | Framework | Base VLM | Description | WidowX | Link |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | Bridge only | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal (small model) | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**WidowX column**: Success rate (%) on WidowX robot tasks in [SimplerEnv](/benchmarks/simplerenv/). Higher is better.

### LIBERO

LIBERO has 4 task suites (Spatial, Object, Goal, Long Horizon) with 40 tasks total. All checkpoints are trained jointly on all 4 suites. See [LIBERO evaluation docs](/benchmarks/libero/).

| Model | Framework | Base VLM | Link |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

RoboCasa GR1 Tabletop Tasks with 24 Pick-and-Place tasks. See [RoboCasa evaluation docs](/benchmarks/robocasa/).

| Model | Framework | Base VLM | Link |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

RoboTwin 2.0 dual-arm manipulation benchmark with 50 tasks. See [RoboTwin evaluation docs](/benchmarks/robotwin/).

| Model | Framework | Base VLM | Link |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

BEHAVIOR-1K household task benchmark using R1Pro humanoid robot. See [BEHAVIOR evaluation docs](/benchmarks/behavior/).

| Model | Description | Link |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | Jointly trained on all 50 tasks | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | Single-task training | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | 6-task joint training | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | Segmentation observation experiment | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## Datasets

### Training Datasets

| Dataset | Description | Link |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | Image-text dataset for VLM co-training (ShareGPT4V-COCO subset) | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | RoboTwin 2.0 clean demonstrations (50 per task) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | RoboTwin 2.0 randomized demonstrations (500 per task) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | Same as above, tar.gz packed format (for bulk download) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### BEHAVIOR Data

| Dataset | Description | Link |
| --- | --- | --- |
| **BEHAVIOR-1K** | BEHAVIOR-1K benchmark simulation configs | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | BEHAVIOR-1K training datasets | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | BEHAVIOR-1K scene and object assets | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | BEHAVIOR-1K visualization demos | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | Single-task training data sample | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
In addition to StarVLA's own datasets above, commonly used third-party datasets for training include:
- **SimplerEnv/OXE**: [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot), [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO**: [Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot), [Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot), [Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot), [10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa**: [PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## How to Use a Checkpoint

Download a checkpoint and run the policy server:

```bash
# Download (requires huggingface_hub)
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# Start the policy server
python deployment/model_server/server_policy.py \
    # steps_XXXXX is the training step count — replace with the actual filename from your download
    # e.g. steps_50000_pytorch_model.pt; run `ls` to see the exact filename
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

Then follow the evaluation guide for the benchmark you want to test on (e.g. [SimplerEnv](/benchmarks/simplerenv/), [LIBERO](/benchmarks/libero/), [RoboCasa](/benchmarks/robocasa/), [RoboTwin](/benchmarks/robotwin/), [BEHAVIOR](/benchmarks/behavior/)).
