---
title: Co-Training with VLM Data
description: Integrate VLM (Vision-Language Model) data to co-train the StarVLA framework.
---

This guide outlines the process for integrating VLM (Vision-Language Model) data to co-train the StarVLA (Vision-Language-Action) framework.

**Why co-train?** Training a VLA purely on robot manipulation data can degrade the VLM backbone's vision and language understanding — this is known as "catastrophic forgetting": after being trained only on robot data, the model may forget how to interpret images, answer questions, or understand complex instructions. Mixing in VLM data (image QA, captioning, etc.) preserves the model's general understanding while learning robot control.

---

## 1. Multi-Modal Data Preparation

The VLM data must adhere to the [QwenVL Conversations JSON Data Structure](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune).

### Required Format

Each data instance is a JSON object that links an **image file path** to a list of **human-GPT conversational turns**.

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
            // <image> is a placeholder that tells the model "insert the image here";
            // the actual image path is specified in the outer "image" field
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### Quick Start

You can download our case dataset [LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO).

Unzip `sharegpt4v_coco.zip` and place it in `playground/Datasets/LLaVA-OneVision-COCO`.

The resulting file structure will look like this:

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. VLM Dataset Configuration

To add a custom VLM dataset, follow these steps:

### 2.1 Register Dataset (Python)

Register your dataset by adding it to the `data_dict` in `starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py`:

```python
# Example Registration
# json_root and image_root are defined at the top of this file,
# defaulting to subdirectories under playground/Datasets/LLaVA-OneVision-COCO/:
#   json_root = "playground/Datasets/LLaVA-OneVision-COCO/llava_jsons"
#   image_root = "playground/Datasets/LLaVA-OneVision-COCO/images"

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # Use this name in the YAML config
}
```

### 2.2 Update Training YAML

Include the VLM dataset configuration in your training YAML file (`your_train_config.yaml`):

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # Must match the name registered in 2.1
```

**Tip:** You can verify the VLM dataloader by running:

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. Training Execution

Choose the appropriate script based on whether you want to train *only* on VLM data or *co-train* with VLA data.

:::tip[How to choose?]
- **If you only want to fine-tune the VLM** (e.g., fine-tune on domain-specific image-text data without robot actions), choose **Option A**.
- **If you have robot data and want to train both together** (to prevent catastrophic forgetting while the model learns both robot control and visual-language understanding), choose **Option B**.
:::

### Option A: Train with VLM Data Only

Use this for VLM-specific pre-training or fine-tuning.

**Script:** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### Option B: Co-Train VLA with VLM Data

This simultaneously trains the model on both robotics (VLA) and multi-modal (VLM) data.

**Script:** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
