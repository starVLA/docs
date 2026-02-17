---
title: 常见问题
description: StarVLA 设计选择与训练流程常见疑问。
---

### 为什么不把预处理放在 dataloader？

评测显示数据预处理耗时 <1%。将其放在 Framework 内能更灵活地处理模型特定逻辑，并避免在 dataloader 中引入假设。

### 可以使用除 Qwen2.5-VL 之外的骨干模型吗？

可以。实现新的视觉与语言模块并在 Framework 中组合即可。由于框架处理原始动作数据，替换骨干模型很直接。

### 为什么没有抽象的 vision tower 接口？

我们认为 VLM 将成为基础模型，并天然包含视觉塔，因此不需要额外抽象层。

### 可以通过命令行覆盖或新增参数吗？

可以。StarVLA 使用 `OmegaConf.load(args.config_yaml)` 作为唯一配置入口，可通过 CLI 覆盖：

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module` 只新增配置项，行为由框架实现决定。

### 可以通过参数冻结 VLM 吗？

可以，使用模块路径列表：

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

提示：先 `print(your_model)` 获取模块路径。实现位于 `TrainerUtils.freeze_backbones`。

### 不同模块可以设置不同学习率吗？

可以，使用分组字典：

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

参考实现：`trainer_tools.build_param_lr_groups`。

### 可以从 checkpoint 恢复训练吗？

可以。配置示例：

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

`reload_modules` 为空则完整加载。StarVLA 不保存 optimizer state，以降低内存与磁盘开销。

### 使用更小 VLM 训练

以 Florence-2 为例：

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

说明：为保证兼容已发布检查点，暂时继续使用 `--framework.qwenvl`，后续版本会统一。
