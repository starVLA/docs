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

An empty `reload_modules` loads the full model. StarVLA uses Accelerator's checkpoint mechanism to fully save and restore optimizer state, learning rate scheduler, and other training state, so training resumes seamlessly.

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
  --framework.name QwenGR00T \
  --framework.qwenvl.base_vlm microsoft/Florence-2-large \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id} \
  --wandb_project your_project \
  --wandb_entity your_name
```

Note: `--framework.qwenvl` will be unified in a future release for compatibility reasons.

### Can I train with just 1 GPU?

Yes. Set `--num_processes` to 1, reduce `per_device_batch_size` (e.g., to 1-2), and increase `gradient_accumulation_steps` to compensate. Single-GPU training will be much slower but is fully functional. We recommend starting with a smaller model (e.g., Qwen2.5-VL-3B).

### How long does training take?

It depends on dataset size, GPU count, and model scale. As a reference:
- **8xA800 + Qwen2.5-VL-3B + Bridge dataset**: ~10-20 hours for 50k steps.
- **1xRTX 4090 + Qwen2.5-VL-3B + small dataset**: may take several days.

We recommend running a quick sanity check with `is_debug: true` for a few hundred steps first, then starting full training.

### How do I monitor training?

StarVLA supports two logging methods (specified in the `trackers` field of your YAML config):

- **jsonl**: Training logs are saved as JSON Lines in a `log.jsonl` file in the checkpoint directory. You can parse and plot them with scripts.
- **wandb**: Real-time online monitoring. Fill in `wandb_entity` and `wandb_project` in your config, and metrics (loss curves, learning rates, etc.) will be automatically uploaded to [wandb.ai](https://wandb.ai) once training starts.

We recommend enabling both: `trackers: [jsonl, wandb]`.
