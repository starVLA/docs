---
title: Catálogo de Modelos
description: Modelos modificados publicados, checkpoints de ajuste fino y datasets.
---

## Modelos Modificados Disponibles

| Modelo | Descripción | Enlace |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Extiende el vocabulario de Qwen2.5-VL con tokens fast (extensión especial de vocabulario para discretizar acciones continuas en tokens) | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Extiende el vocabulario de Qwen3-VL con tokens fast (igual que arriba) | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | Pesos del tokenizador de acciones pi-fast | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## Checkpoints de Ajuste Fino

### SimplerEnv / Bridge

Bridge es un dataset de manipulación sobre mesa con WidowX; Fractal es el dataset de manipulación robótica RT-1 de Google.

| Modelo | Framework | VLM Base | Descripción | WidowX | Enlace |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | Solo Bridge | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal (modelo pequeño) | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**Columna WidowX**: Tasa de éxito (%) en tareas del robot WidowX en [SimplerEnv](/docs/es/benchmarks/simplerenv/). Mayor es mejor.

### LIBERO

LIBERO tiene 4 suites de tareas (Spatial, Object, Goal, Long Horizon) con 40 tareas en total. Todos los checkpoints se entrenan conjuntamente en las 4 suites. Consulta la [documentación de evaluación de LIBERO](/docs/es/benchmarks/libero/).

| Modelo | Framework | VLM Base | Enlace |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

Tareas de Mesa GR1 de RoboCasa con 24 tareas de Pick-and-Place. Consulta la [documentación de evaluación de RoboCasa](/docs/es/benchmarks/robocasa/).

| Modelo | Framework | VLM Base | Enlace |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

Benchmark de manipulación de doble brazo RoboTwin 2.0 con 50 tareas. Consulta la [documentación de evaluación de RoboTwin](/docs/es/benchmarks/robotwin/).

| Modelo | Framework | VLM Base | Enlace |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

Benchmark de tareas domésticas BEHAVIOR-1K usando el robot humanoide R1Pro. Consulta la [documentación de evaluación de BEHAVIOR](/docs/es/benchmarks/behavior/).

| Modelo | Descripción | Enlace |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | Entrenado conjuntamente en las 50 tareas | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | Entrenamiento de tarea única | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | Entrenamiento conjunto de 6 tareas | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | Experimento de observación con segmentación | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## Datasets

### Datasets de Entrenamiento

| Dataset | Descripción | Enlace |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | Dataset de imagen-texto para co-entrenamiento VLM (subconjunto ShareGPT4V-COCO) | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | Demostraciones limpias de RoboTwin 2.0 (50 por tarea) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | Demostraciones aleatorizadas de RoboTwin 2.0 (500 por tarea) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | Igual que arriba, formato empaquetado tar.gz (para descarga masiva) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### Datos de BEHAVIOR

| Dataset | Descripción | Enlace |
| --- | --- | --- |
| **BEHAVIOR-1K** | Configuraciones de simulación del benchmark BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | Datasets de entrenamiento de BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | Assets de escenas y objetos de BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | Demos de visualización de BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | Muestra de datos de entrenamiento de tarea única | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
Además de los datasets propios de StarVLA mencionados arriba, los datasets de terceros comúnmente usados para entrenamiento incluyen:
- **SimplerEnv/OXE**: [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot), [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO**: [Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot), [Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot), [Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot), [10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa**: [PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## Cómo Usar un Checkpoint

Descarga un checkpoint y ejecuta el servidor de políticas:

```bash
# Descargar (requiere huggingface_hub)
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# Iniciar el servidor de políticas
python deployment/model_server/server_policy.py \
    # steps_XXXXX es el conteo de pasos de entrenamiento — reemplaza con el nombre de archivo real de tu descarga
    # por ejemplo steps_50000_pytorch_model.pt; ejecuta `ls` para ver el nombre de archivo exacto
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

Luego sigue la guía de evaluación para el benchmark que desees probar (por ejemplo, [SimplerEnv](/docs/es/benchmarks/simplerenv/), [LIBERO](/docs/es/benchmarks/libero/), [RoboCasa](/docs/es/benchmarks/robocasa/), [RoboTwin](/docs/es/benchmarks/robotwin/), [BEHAVIOR](/docs/es/benchmarks/behavior/)).
