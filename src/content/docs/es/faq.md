---
title: Preguntas Frecuentes
description: Preguntas comunes sobre las decisiones de diseño y el flujo de trabajo de entrenamiento de StarVLA.
---

### ¿Por qué no poner el preprocesamiento en el dataloader?

El preprocesamiento de datos toma menos del 1% del tiempo en el perfilado. Mantenerlo dentro del Framework permite el manejo específico del modelo sin filtrar suposiciones al dataloader.

### ¿Puedo usar un backbone diferente a Qwen2.5-VL?

Sí. Implementa nuevos módulos de visión y lenguaje y compónlos dentro de un Framework. Como el framework procesa datos de acción crudos, cambiar de backbone es sencillo.

### ¿Por qué no hay una interfaz abstracta para la torre de visión?

Esperamos que los VLMs sean el modelo base e incluyan su propia torre de visión nativa, por lo que no se requiere una interfaz abstracta adicional.

### ¿Puedo sobrescribir o agregar parámetros desde la terminal?

Sí. StarVLA usa `OmegaConf.load(args.config_yaml)` como la entrada de configuración única. Puedes sobrescribir valores desde la CLI:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module` solo agrega a la configuración global; su comportamiento está definido por tu framework.

### ¿Puedo congelar el VLM mediante parámetros?

Sí. Usa una lista separada por comas de rutas de módulos:

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

Consejo: ejecuta `print(your_model)` para verificar las rutas de los módulos. La implementación está en `TrainerUtils.freeze_backbones`.

### ¿Puedo establecer tasas de aprendizaje diferentes para diferentes módulos?

Sí. Usa un diccionario por módulo:

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

Consulta `trainer_tools.build_param_lr_groups` como referencia.

### ¿Puedo reanudar el entrenamiento desde un checkpoint?

Sí. Especifica la ruta del último checkpoint en la configuración:

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

Un `reload_modules` vacío carga el modelo completo. StarVLA usa el mecanismo de checkpoints de Accelerator para guardar y restaurar completamente el estado del optimizador, el planificador de tasa de aprendizaje y otros estados de entrenamiento, por lo que el entrenamiento se reanuda sin problemas.

### Entrenar con un VLM más pequeño

Ejemplo usando Florence-2:

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

Nota: `--framework.qwenvl` se unificará en una versión futura por razones de compatibilidad.

### ¿Puedo entrenar con solo 1 GPU?

Sí. Establece `--num_processes` en 1, reduce `per_device_batch_size` (por ejemplo, a 1-2) y aumenta `gradient_accumulation_steps` para compensar. El entrenamiento con una sola GPU será mucho más lento pero es completamente funcional. Recomendamos comenzar con un modelo más pequeño (por ejemplo, Qwen2.5-VL-3B).

### ¿Cuánto tiempo tarda el entrenamiento?

Depende del tamaño del dataset, la cantidad de GPUs y la escala del modelo. Como referencia:
- **8xA800 + Qwen2.5-VL-3B + dataset Bridge**: ~10-20 horas para 50k pasos.
- **1xRTX 4090 + Qwen2.5-VL-3B + dataset pequeño**: puede tardar varios días.

Recomendamos ejecutar una verificación rápida de cordura con `is_debug: true` durante unos cientos de pasos primero, y luego iniciar el entrenamiento completo.

### ¿Cómo monitoreo el entrenamiento?

StarVLA soporta dos métodos de registro (especificados en el campo `trackers` de tu configuración YAML):

- **jsonl**: Los registros de entrenamiento se guardan como JSON Lines en un archivo `log.jsonl` en el directorio de checkpoints. Puedes analizarlos y graficarlos con scripts.
- **wandb**: Monitoreo en línea en tiempo real. Completa `wandb_entity` y `wandb_project` en tu configuración, y las métricas (curvas de pérdida, tasas de aprendizaje, etc.) se subirán automáticamente a [wandb.ai](https://wandb.ai) una vez que comience el entrenamiento.

Recomendamos habilitar ambos: `trackers: [jsonl, wandb]`.
