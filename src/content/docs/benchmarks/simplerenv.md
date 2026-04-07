---
title: SimplerEnv Evaluation
description: Reproduce StarVLA experimental results on SimplerEnv (setup, evaluation workflow, and training notes).
---

**SimplerEnv** is a ManiSkill-based simulation environment using the WidowX robotic arm for tabletop manipulation tasks (grasping, placing, drawer operations, etc.). It is widely used to evaluate VLA models trained on the Open X-Embodiment (OXE) dataset.

This document provides instructions for reproducing our **experimental results** with SimplerEnv.

The evaluation process consists of two main parts:

1. Setting up the `simpler_env` environment and dependencies.
2. Running the evaluation by launching services in both `starVLA` and `simpler_env` environments.

We have verified that this workflow runs successfully on both **NVIDIA A100** and **RTX 4090** GPUs.

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

## SimplerEnv Evaluation

### 1. Environment Setup

To set up the environment, please first follow the official [SimplerEnv repository](https://github.com/simpler-env/SimplerEnv) to install the base `simpler_env` environment.

Afterwards, inside the `simpler_env` environment, install the following dependencies:

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Downgrade numpy for compatibility with the simulation environment
```

**Common Issues:**
When testing SimplerEnv on NVIDIA A100, you may encounter the following error:
`libvulkan.so.1: cannot open shared object file: No such file or directory`
You can refer to this link to fix: [Installation Guide – Vulkan Section](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### Verification

We provide a minimal environment verification script:

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

If you see the "✅ Env built successfully" message, it means SimplerEnv is installed correctly and ready to use.

---

### 2. Evaluation Workflow

Run the evaluation **from the starVLA repository root** using **two separate terminals**, one for each environment.

:::note[Why two terminals?]
Model inference (starVLA environment) and the simulation (simpler_env environment) depend on different Python package versions that would conflict if installed in the same conda environment. Running them in separate terminals with separate conda environments avoids this.
:::

- **starVLA environment**: runs the policy inference server.
- **simpler_env environment**: runs the simulation eval code.

#### Step 0. Download Checkpoint

Download the checkpoint: [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Step 1. Start the server (starVLA environment)

In the first terminal, activate the `starVLA` conda environment and run:

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**Note:** Open `examples/SimplerEnv/eval_files/run_policy_server.sh`, find the `your_ckpt` variable, and set it to your actual checkpoint path, e.g. `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`.

---

#### Step 2. Start the simulation (simpler_env environment)

In the second terminal, activate the `simpler_env` conda environment and run:

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

This script will automatically launch the WidowX Robot evaluation tasks, reproducing the benchmark results reported above.

**Note:** Open `examples/SimplerEnv/start_simpler_env.sh`, find the `SimplerEnv_PATH` variable, and set it to your SimplerEnv repo clone path (e.g. `/path/to/SimplerEnv`).

**Common Issues:**
If you encounter `NotImplementedError: Framework QwenGR00T is not implemented` when running the policy server, this usually means the Framework hasn't been properly registered in Python's import path. Run the smoke test first to trigger correct registration:
```bash
python starVLA/model/framework/QwenGR00T.py
```
If the smoke test passes, restart the policy server.

---

## Training on OXE

### Data Preparation

Steps:
1. Download a LeRobot-format OXE dataset:
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. Include `modality.json` in each `*lerobot/meta/modality.json`:
   - [bridge modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - Rename as `modality.json` and put it as `bridge_orig_lerobot/meta/modality.json`
   - [fractal modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - Rename as `modality.json` and put it as `fractal20220817_data_lerobot/meta/modality.json`

3. Add your dataset path to `config.yaml`:
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### Check Your Dataloader

We provide a simple way to check your dataloader. Make sure you can load batched data:

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Framework Preparation

Before running, you need to ensure that your framework can `forward` and `predict_action` using a fake data example.

Try the following command:

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Start Training

Once everything is ready, use our provided script to start training:

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**Note:** Ensure that the script explicitly uses the validated config path. If not already passed, add the `--config_yaml` argument.
