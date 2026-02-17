---
title: 与 VLM 数据联合训练
description: 整合 VLM（视觉语言模型）数据来联合训练 StarVLA 框架。
---

本指南介绍如何整合 VLM（Vision-Language Model）数据来联合训练 StarVLA（Vision-Language-Action）框架。

**为什么要联合训练？** 纯粹用机器人操作数据训练 VLA 时，VLM 骨干的视觉和语言理解能力可能会退化（"灾难性遗忘"）。混入 VLM 数据（图文问答、描述等）可以保持模型的通用理解能力，同时学习机器人操作。

---

## 1. 多模态数据准备

VLM 数据必须遵循 [QwenVL Conversations JSON 数据结构](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune)。

### 所需格式

每个数据实例是一个 JSON 对象，将**图片文件路径**与**人机对话轮次列表**关联起来。

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### 快速开始

你可以下载我们的示例数据集 [LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO)。

解压 `sharegpt4v_coco.zip` 并放置到 `playground/Datasets/LLaVA-OneVision-COCO`。

最终的文件结构如下：

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. VLM 数据集配置

要添加自定义 VLM 数据集，请按以下步骤操作：

### 2.1 注册数据集（Python）

在 `starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py` 的 `data_dict` 中注册你的数据集：

```python
# 注册示例

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # 在 YAML 配置中使用此名称
}
```

### 2.2 更新训练 YAML

在训练 YAML 文件（`your_train_config.yaml`）中包含 VLM 数据集配置：

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # 必须与 2.1 中注册的名称匹配
```

**提示：** 你可以通过运行以下命令验证 VLM 数据加载器：

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. 训练执行

根据你是想*仅*使用 VLM 数据训练还是与 VLA 数据*联合训练*，选择相应的脚本。

### 选项 A：仅使用 VLM 数据训练

用于 VLM 特定的预训练或微调。

**脚本：** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### 选项 B：VLA 与 VLM 数据联合训练

同时在机器人（VLA）和多模态（VLM）数据上训练模型。

**脚本：** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
