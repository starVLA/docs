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

## SimplerEnv Evaluation

### 1. Environment Setup

To set up the environment, please first follow the official [SimplerEnv repository](https://github.com/simpler-env/SimplerEnv) to install the base `simpler_env` environment.

Afterwards, inside the `simpler_env` environment, install the following dependencies:

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4
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

Run the evaluation **from the starVLA repository root** using **two separate terminals**, one for each environment:

- **starVLA environment**: runs the policy inference server.
- **simpler_env environment**: runs the simulation eval code.

#### Step 0. Download Checkpoint

Download the checkpoint: [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Step 1. Start the server (starVLA environment)

In the first terminal, activate the `starVLA` conda environment and run:

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**Note:** Please ensure that you specify the correct checkpoint path in `run_policy_server.sh`

---

#### Step 2. Start the simulation (simpler_env environment)

In the second terminal, activate the `simpler_env` conda environment and run:

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

This script will automatically launch the WidowX Robot evaluation tasks, reproducing the benchmark results reported above.

**Note:** Please ensure that you specify the correct `SimplerEnv_PATH` in `start_simpler_env.sh`

**Common Issues:**
When running policy server but getting `NotImplementedError: Framework QwenGR00T is not implemented`, you may need to run `python QwenGR00T.py` to check your environment.

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
