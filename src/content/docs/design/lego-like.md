---
title: Lego-like Design
description: The modular principles that make StarVLA easy to extend and debug.
---

## Smoke test any submodule

StarVLA emphasizes modular model design. Each major framework file is executable for fast debugging and smoke tests:

```bash
# model (config file located at starVLA/config/training/starvla_cotrain_oxe.yaml)
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# dataloader
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**Design rule:** `starVLA/model/framework/<your_framework>.py` is the single external API surface of the model. It should mirror the framework diagram in your paper.

## Explicit model boundaries

StarVLA follows top-down decomposition and high cohesion / low coupling (each module handles its own responsibility and modules don't interfere with each other). The dataloader must return a raw, model-agnostic dict without model-specific preprocessing.

A typical sample contains:

- `image`: `list[PIL.Image] | np.ndarray` — camera images (one or more viewpoints)
- `lang`: `str` — task instruction in natural language (e.g., "put the red block in the box")
- `action`: `np.ndarray[T, action_dim]` — sequence of robot actions (T steps, each with action_dim joint values)
- `state`: `Optional[np.ndarray[..., state_dim]]` — current sensor readings of the robot (e.g., joint angles, end-effector position; optional)

Both `framework.forward()` and `framework.predict_action()` operate directly on raw inputs. This keeps train/test boundaries explicit and easy to hack.

## Flexible configuration system

StarVLA uses a single global configuration object powered by OmegaConf (a YAML configuration management library that supports overriding config values from the command line). Parameters are passed via extensible dicts, allowing overrides and controlled redundancy.

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

## How to add a new framework

Want to integrate your own model architecture? Just three steps:

1. **Create a framework file**: Add `YourFramework.py` under `starVLA/model/framework/`, inherit from the base class, and implement `forward()` and `predict_action()` methods.
2. **Write a smoke test**: Add an `if __name__ == "__main__":` entry point at the end of the file to verify forward pass and action prediction work with fake data.
3. **Register in config**: Set `framework.name: YourFramework` in your training YAML config to plug into the existing training and evaluation pipeline.

Use `QwenGR00T.py` or `QwenOFT.py` as templates.
