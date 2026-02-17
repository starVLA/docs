---
title: FAQ
description: Common questions about StarVLA design choices and training workflow.
---

### Why not put preprocessing in the dataloader?

Data preprocessing takes <1% time in profiling. Keeping it inside the Framework allows model-specific handling without leaking assumptions into the dataloader.

### Can I use a backbone other than Qwen2.5-VL?

Yes. Implement new vision and language modules and compose them inside a Framework. Since the framework processes raw action data, swapping backbones is straightforward.

### Why isn't there an abstract interface for the vision tower?

We expect VLMs to be the base model and to include their own native vision tower, so an extra abstract interface is not required.

### Can I override or add parameters via the terminal?

Yes. StarVLA uses `OmegaConf.load(args.config_yaml)` as the single configuration entry. You can override values from the CLI:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module` only adds to the global config; its behavior is defined by your framework.

### Can I freeze the VLM via parameters?

Yes. Use a comma-separated list of module paths:

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

Tip: run `print(your_model)` to verify module paths. Implementation lives in `TrainerUtils.freeze_backbones`.

### Can I set different learning rates for different modules?

Yes. Use a per-module dict:

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

See `trainer_tools.build_param_lr_groups` for reference.

### Can I resume training from a checkpoint?

Yes. Specify the latest checkpoint path in config:

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

An empty `reload_modules` loads the full model. StarVLA does not save optimizer state to reduce memory and disk usage.

### Train with a smaller VLM

Example using Florence-2:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes=${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.framework_py QwenGR00T \
  --framework.qwenvl.base_vlm microsoft/Florence-2-large \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id} \
  --wandb_project your_project \
  --wandb_entity your_name
```

Note: `--framework.qwenvl` will be unified in a future release for compatibility reasons.
