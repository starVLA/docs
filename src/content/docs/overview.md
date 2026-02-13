---
title: Project Overview
description: What StarVLA is, what it supports today, and where to find core capabilities.
---

## Vision

StarVLA is a lego-like, modular codebase for developing Vision-Language Models (VLMs) and (under construction) World Models (WM) into Vision-Language-Action (VLA) models. Each component (model, data, trainer, config, evaluation) is designed for high cohesion and low coupling so you can prototype quickly and debug in isolation.

## Key Features

### VLA Frameworks

StarVLA officially provides the Qwen-based StarVLA Model Family, which includes:

- **Qwen-FAST**: Qwen2.5-VL-3B/Qwen3-VL-4B with fast tokenizer generating discrete action tokens (pi0-fast style).
- **Qwen-OFT**: Qwen2.5/3-VL-3B/Qwen3-VL-4B with MLP action head for parallel continuous actions (OpenVLA-OFT/EO style).
- **Qwen-PI**: Flow-Matching action expert with diffusion-based continuous actions (pi0 style).
- **Qwen-GR00T**: Dual-system VLA with Qwen2.5-VL-3B/Qwen3-VL-4B for reasoning and FM for fast action prediction.

The modular repository also means that you only need to define your model structure in a Framework, and you can use the shared Trainer, Dataloader, and Evaluation/Deployment pipeline to seamlessly run on all supported benchmarks and real-robot deployments.

### Training Strategies

- Single imitation learning.
- Multimodal multi-task co-training.
- **\[Planned\]** Reinforcement learning adaptation.

### Simulation Benchmarks

Supported or planned benchmarks:

- Supported: SimplerEnv, LIBERO, RoboCasa, RoboTwin, CALVIN, BEHAVIOR.
- Planned: SO101, RLBench.

#### Selected Benchmark Results

![StarVLA results on SimplerEnv.](../../assets/starvla_simpleEnv.png)

![StarVLA results on LIBERO.](../../assets/starvla_LIBERO.png)

![StarVLA results on RoboCasa.](../../assets/stavla_RoboCasa.png)

### Results & Reports

Results are continuously tracked in a live Overleaf report: https://www.overleaf.com/read/qqtwrnprctkf#d5bdce

## Where to Go Next

- Set up your environment and verify installation in [Quick Start](/getting-started/quick-start/).
- Explore design principles in [Lego-like Design](/design/lego-like/).
- Browse checkpoints in [Model Zoo](/model-zoo/).

## Community & Links

- Hugging Face: https://huggingface.co/StarVLA
- WeChat group: https://github.com/starVLA/starVLA/issues/64#issuecomment-3715403845

---

**Projects Based on StarVLA:**

- NeuroVLA: [A Brain-like Embodied Intelligence for Fluid and Fast Reflexive Robotics Control](https://github.com/guoweiyu/NeuroVLA)
- PhysBrain: [Human Egocentric Data as a Bridge from Vision Language Models to Physical Intelligence](https://zgc-embodyai.github.io/PhysBrain/)
- TwinBrainVLA: [Unleashing the Potential of Generalist VLMs for Embodied Tasks via Asymmetric Mixture-of-Transformers](https://github.com/ZGC-EmbodyAI/TwinBrainVLA)
- LangForce: [Bayesian Decomposition of Vision Language Action Models via Latent Action Queries](https://github.com/ZGC-EmbodyAI/LangForce)

---

**Latest Updates**

- **2025/12/25**: Pipelines established for Behavior-1K, RoboTwin 2.0, and CALVIN; looking to share baselines with the community.
- **2025/12/25**: RoboCasa evaluation support released, achieving SOTA without pretraining. See `examples/Robocasa_tabletop` in the main repo.
- **2025/12/15**: Release regression check completed; ongoing updates in the [Daily Development Log](https://github.com/starVLA/starVLA/issues/64#issue-3727060165).
- **2025/12/09**: Open-source training for VLM, VLA, and VLA+VLM co-training. See `examples/CoTrainVLM`.
- **2025/11/12**: Florence-2 support added for resource-constrained VLM training (single A100). See [Lego-like Design](/design/lego-like/) for workflow notes.
- **2025/10/30**: LIBERO training and evaluation guides released.
- **2025/10/25**: Script links and packaging polished based on community feedback.
