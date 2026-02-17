---
title: Lego-like Design
description: The modular principles that make StarVLA easy to extend and debug.
---

## Smoke test any submodule

StarVLA emphasizes modular model design. Each major framework file is executable for fast debugging and smoke tests:

```bash
# model
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# dataloader
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**Design rule:** `starVLA/model/framework/<your_framework>.py` is the single external API surface of the model. It should mirror the framework diagram in your paper.

## Explicit model boundaries

StarVLA follows top-down decomposition and high cohesion / low coupling. The dataloader must return a raw, model-agnostic dict without model-specific preprocessing.

A typical sample contains:

- `image`: `list[PIL.Image] | np.ndarray`
- `lang`: `str`
- `action`: `np.ndarray[T, action_dim]`
- `state`: `Optional[np.ndarray[..., state_dim]]`

Both `framework.forward()` and `framework.predict_action()` operate directly on raw inputs. This keeps train/test boundaries explicit and easy to hack.

## Flexible configuration system

StarVLA uses a single global configuration object. Parameters are passed via extensible dicts, allowing overrides and controlled redundancy.

Example (override via CLI):

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**Note:** `framework.action_model.new_module` only adds keys to the global config. Its behavior is defined in your framework implementation.
