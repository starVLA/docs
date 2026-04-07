---
title: Evaluación de RoboCasa
description: Reproduce los resultados experimentales de StarVLA en las Tareas de Mesa GR1 de RoboCasa.
---

**RoboCasa** es un benchmark de simulación doméstica a gran escala. Aquí usamos el subconjunto de [Tareas de Mesa GR1](https://github.com/robocasa/robocasa-gr1-tabletop-tasks), que presenta 24 tareas de Pick-and-Place sobre mesa realizadas por un robot humanoide Fourier GR1 (parte superior del cuerpo, brazos duales).

Este documento proporciona instrucciones para reproducir nuestros **resultados experimentales**.

El proceso de evaluación consta de dos partes principales:

1. Configurar el entorno de `robocasa` y sus dependencias.
2. Ejecutar la evaluación lanzando servicios en ambos entornos `starVLA` y `robocasa`.

:::note[¿Por qué dos terminales?]
La inferencia del modelo (entorno starVLA) y la simulación (entorno robocasa) dependen de diferentes versiones de paquetes Python que entrarían en conflicto si se instalan en el mismo entorno conda. Ejecutarlos en terminales separadas con entornos conda separados evita esto.
:::

Hemos verificado que este flujo de trabajo funciona correctamente en GPUs **NVIDIA A100**.

---

## Resultados Experimentales

| Tarea | GR00T-N1.6 | StarVLA-GR00T-Qwen3 | StarVLA-π-Qwen3 | StarVLA-OFT-Qwen3 | StarVLA-FAST-Qwen3 |
|------|------------|------------|---------|----------|-----------|
| **PnP Bottle To Cabinet Close** | 51.5 | 46.0 | 26.0 | 30.0 | 38.0 |
| **PnP Can To Drawer Close** | 13.0 | 80.0 | 62.0 | 76.0 | 44.0 |
| **PnP Cup To Drawer Close** | 8.5 | 54.0 | 42.0 | 44.0 | 56.0 |
| **PnP Milk To Microwave Close** | 14.0 | 48.0 | 50.0 | 44.0 | 44.0 |
| **PnP Potato To Microwave Close** | 41.5 | 28.0 | 42.0 | 32.0 | 14.0 |
| **PnP Wine To Cabinet Close** | 16.5 | 46.0 | 32.0 | 36.0 | 14.0 |
| **PnP Novel From Cuttingboard To Basket** | 58.0 | 48.0 | 40.0 | 50.0 | 54.0 |
| **PnP Novel From Cuttingboard To Cardboardbox** | 46.5 | 40.0 | 46.0 | 40.0 | 42.0 |
| **PnP Novel From Cuttingboard To Pan** | 68.5 | 68.0 | 60.0 | 70.0 | 58.0 |
| **PnP Novel From Cuttingboard To Pot** | 65.0 | 52.0 | 40.0 | 54.0 | 58.0 |
| **PnP Novel From Cuttingboard To Tieredbasket** | 46.5 | 56.0 | 44.0 | 38.0 | 40.0 |
| **PnP Novel From Placemat To Basket** | 58.5 | 42.0 | 44.0 | 32.0 | 36.0 |
| **PnP Novel From Placemat To Bowl** | 57.5 | 44.0 | 52.0 | 58.0 | 38.0 |
| **PnP Novel From Placemat To Plate** | 63.0 | 48.0 | 50.0 | 52.0 | 42.0 |
| **PnP Novel From Placemat To Tieredshelf** | 28.5 | 18.0 | 28.0 | 24.0 | 18.0 |
| **PnP Novel From Plate To Bowl** | 57.0 | 60.0 | 52.0 | 60.0 | 52.0 |
| **PnP Novel From Plate To Cardboardbox** | 43.5 | 50.0 | 40.0 | 50.0 | 30.0 |
| **PnP Novel From Plate To Pan** | 51.0 | 54.0 | 36.0 | 66.0 | 48.0 |
| **PnP Novel From Plate To Plate** | 78.7 | 70.0 | 48.0 | 68.0 | 50.0 |
| **PnP Novel From Tray To Cardboardbox** | 51.5 | 38.0 | 34.0 | 44.0 | 28.0 |
| **PnP Novel From Tray To Plate** | 71.0 | 56.0 | 64.0 | 56.0 | 34.0 |
| **PnP Novel From Tray To Pot** | 64.5 | 50.0 | 44.0 | 62.0 | 46.0 |
| **PnP Novel From Tray To Tieredbasket** | 57.0 | 36.0 | 50.0 | 54.0 | 36.0 |
| **PnP Novel From Tray To Tieredshelf** | 31.5 | 16.0 | 28.0 | 30.0 | 16.0 |
| **Promedio** | **47.6** | **47.8** | **43.9** | **48.8** | **39.0** |

*Nota: Todos los valores son tasas de éxito en porcentaje (%). Se entrenó un único modelo para las 24 tareas. Los resultados se reportan sobre 50 ejecuciones por tarea.*

---

## Evaluación de RoboCasa

### 0. Descargar Checkpoints

Primero, descarga los checkpoints desde:
- [Qwen3VL-GR00T](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1)
- [Qwen3VL-OFT](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa)

### 1. Configuración del Entorno

Para configurar el entorno, primero sigue la [guía oficial de instalación de RoboCasa](https://github.com/robocasa/robocasa-gr1-tabletop-tasks?tab=readme-ov-file#getting-started) para instalar el entorno base de `robocasa-gr1-tabletop-tasks`.

Luego instala el soporte para sockets:

```bash
pip install tyro
```

---

### 2. Flujo de Evaluación

#### Paso 1. Iniciar el servidor (entorno starVLA)

En la primera terminal, activa el entorno conda `starVLA` y ejecuta:

```bash
python deployment/model_server/server_policy.py \
        --ckpt_path ${your_ckpt} \
        --port 5678 \
        --use_bf16
```

---

#### Paso 2. Iniciar la simulación (entorno robocasa)

En la segunda terminal, activa el entorno conda `robocasa` y ejecuta:

```bash
export PYTHONPATH=$(pwd):${PYTHONPATH}
your_ckpt=StarVLA/Qwen3-VL-OFT-Robocasa/checkpoints/steps_90000_pytorch_model.pt

python examples/Robocasa_tabletop/eval_files/simulation_env.py\
   --args.env_name ${env_name} \
   --args.port 5678 \
   --args.n_episodes 50 \
   --args.n_envs 1 \
   --args.max_episode_steps 720 \
   --args.n_action_steps 12 \
   --args.video_out_path ${video_out_path} \
   --args.pretrained_path ${your_ckpt}
```

#### Evaluación por Lotes (Opcional)

Si tienes más GPUs, puedes usar el script de evaluación por lotes:

```bash
bash examples/Robocasa_tabletop/batch_eval_args.sh
```

**Nota:** Asegúrate de especificar la ruta correcta del checkpoint en `batch_eval_args.sh`

---

## Reproducir Resultados de Entrenamiento

### Paso 0: Descargar el dataset de entrenamiento

Descarga los datasets del directorio PhysicalAI-Robotics-GR00T-X-Embodiment-Sim desde [HuggingFace](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim) al directorio `playground/Datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim`.

Para descargar solo las carpetas relevantes de ajuste fino, puedes consultar las instrucciones del repositorio [GR00T-N1.5](https://github.com/NVIDIA/Isaac-GR00T/tree/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/examples/RoboCasa#-1-dataset-preparation).

O usa el script para descargar las carpetas `*_1000`:

```bash
python examples/Robocasa_tabletop/download_gr00t_ft_data.py
```

### Paso 1: Iniciar el Entrenamiento

Se pueden seleccionar diferentes datasets modificando el parámetro `data_mix`, y el siguiente script se puede usar para hacer ajuste fino con los datasets `*_1000`:

```bash
bash examples/Robocasa_tabletop/train_files/run_robocasa.sh
```
