---
title: 乐高式设计
description: StarVLA 模块化设计的核心原则与可扩展性。
---

## 子模块可独立自测

StarVLA 强调模块化模型设计。每个框架文件可独立运行，用于快速调试与冒烟测试：

```bash
# model
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# dataloader
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**设计要求：** `starVLA/model/framework/<your_framework>.py` 是模型唯一对外 API，应与论文中的框架图结构保持一致。

## 明确的模型边界

StarVLA 遵循自顶向下拆分与高内聚低耦合。Dataloader 仅返回原始、与模型无关的数据字典，不包含 tokenizer 或图像编码等模型特定预处理。

典型样本字段：

- `image`: `list[PIL.Image] | np.ndarray`
- `lang`: `str`
- `action`: `np.ndarray[T, action_dim]`
- `state`: `Optional[np.ndarray[..., state_dim]]`

`framework.forward()` 与 `framework.predict_action()` 直接处理原始输入，保证训练与测试边界清晰、易于扩展。

## 灵活的配置系统

StarVLA 使用单一全局配置对象，参数以可扩展 dict 形式传递，便于覆盖与冗余控制。

示例（CLI 覆盖参数）：

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**注意：** `framework.action_model.new_module` 只向全局配置添加键，实际行为由你的 framework 实现定义。

