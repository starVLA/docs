---
title: Evaluación de SimplerEnv
description: Reproduce los resultados experimentales de StarVLA en SimplerEnv (configuración, flujo de evaluación y notas de entrenamiento).
---

**SimplerEnv** es un entorno de simulación basado en ManiSkill que utiliza el brazo robótico WidowX para tareas de manipulación sobre mesa (agarrar, colocar, operaciones con cajones, etc.). Se usa ampliamente para evaluar modelos VLA entrenados con el dataset Open X-Embodiment (OXE).

Este documento proporciona instrucciones para reproducir nuestros **resultados experimentales** con SimplerEnv.

El proceso de evaluación consta de dos partes principales:

1. Configurar el entorno de `simpler_env` y sus dependencias.
2. Ejecutar la evaluación lanzando servicios en ambos entornos `starVLA` y `simpler_env`.

Hemos verificado que este flujo de trabajo funciona correctamente tanto en GPUs **NVIDIA A100** como **RTX 4090**.

---

## Experimental Results

### WidowX Robot (Visual Matching)

| Method | Steps | Put Spoon on Towel | Put Carrot on Plate | Stack Green Block on Yellow Block | Put Eggplant in Yellow Basket | Average |
|--------|-------|--------------------|--------------------|---------------------------------|------------------------------|---------|
| RT-1-X | - | 0.0 | 4.2 | 0.0 | 0.0 | 1.1 |
| Octo-Base | - | 15.8 | 12.5 | 0.0 | 41.7 | 17.5 |
| Octo-Small | - | 41.7 | 8.2 | 0.0 | 56.7 | 26.7 |
| OpenVLA | - | 4.2 | 0.0 | 0.0 | 12.5 | 4.2 |
| CogACT | - | 71.7 | 50.8 | 15.0 | 67.5 | 51.3 |
| SpatialVLA | - | 16.7 | 25.0 | 29.2 | **100.0** | 42.7 |
| π₀ | - | 29.1 | 0.0 | 16.6 | 62.5 | 27.1 |
| π₀-FAST | - | 29.1 | 21.9 | 10.8 | 66.6 | 48.3 |
| GR00T N1.5 | - | 75.3 | 54.3 | **57.0** | 61.3 | 61.9 |
| Magma | - | 37.5 | 31.0 | 12.7 | 60.5 | 35.8 |
| **StarVLA-FAST (Qwen3-VL)** | 15K | 18.8 | 31.3 | 4.2 | 71.9 | 31.6 |
| **StarVLA-OFT (Qwen3-VL)** | 65K | **90.3** | 38.5 | 29.7 | **100.0** | 64.6 |
| **StarVLA-π (Qwen3-VL)** | 40K | 78.1 | 46.9 | 30.2 | 88.5 | 60.9 |
| **StarVLA-GR00T (Qwen3-VL)** | 20K | 83.0 | 59.4 | 18.8 | **100.0** | 65.3 |
| **StarVLA-OFT (Cosmos-Predict2-2B)** | 30K | 66.8 | 62.6 | 25.3 | 90.2 | 61.2 |
| **StarVLA-π (Cosmos-Predict2-2B)** | 30K | 81.4 | 55.2 | 25.1 | 73.0 | 58.7 |
| **StarVLA-GR00T (Cosmos-Predict2-2B)** | 30K | 80.4 | **65.4** | 20.0 | 80.6 | 61.6 |

### Google Robot (Visual Matching)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 85.7 | 44.2 | **73.0** | 6.5 | 52.4 |
| RT-1-X | 56.7 | 31.7 | 59.7 | 21.3 | 42.4 |
| RT-2-X | 78.7 | 77.9 | 25.0 | 3.7 | 46.3 |
| OpenVLA | 18.0 | 56.3 | 63.0 | 0.0 | 34.3 |
| CogACT | 91.3 | 85.0 | 71.8 | 50.9 | 74.8 |
| SpatialVLA | 86.0 | 77.9 | 57.4 | - | 75.1 |
| π₀ | 72.7 | 65.3 | 38.3 | - | 58.8 |
| π₀-FAST | 75.3 | 67.5 | 42.9 | - | 61.9 |
| GR00T N1.5* | 51.7 | 54.0 | 27.8 | 7.4 | 35.2 |
| Magma | 83.7 | 65.4 | 56.0 | 6.4 | 52.9 |
| **StarVLA-OFT** | **95.3** | 75.0 | 68.8 | **66.1** | **76.0** |

### Google Robot (Variant Aggregation)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 89.8 | 50.0 | 32.3 | 2.6 | 43.7 |
| RT-1-X | 49.0 | 32.3 | 29.4 | 10.1 | 30.2 |
| RT-2-X | 82.3 | 79.2 | 35.3 | 20.6 | 54.4 |
| OpenVLA | 60.8 | 67.7 | 28.8 | 0.0 | 39.3 |
| CogACT | 89.6 | 80.8 | 28.3 | 46.6 | 61.3 |
| SpatialVLA | 88.0 | **82.5** | 41.8 | - | 70.7 |
| π₀ | 75.2 | 63.7 | 25.6 | - | 54.8 |
| π₀-FAST | 77.6 | 68.2 | 31.3 | - | 59.0 |
| GR00T N1.5 | 69.3 | 68.7 | 35.8 | 4.0 | 44.5 |
| Magma | 68.8 | 65.7 | **53.4** | 18.5 | 51.6 |
| **StarVLA-OFT** | 91.3 | 75.1 | 55.0 | **59.4** | **70.2** |

*Note: All StarVLA Google Robot results use Qwen3-VL-4B as backbone. Numbers marked with \* denote our reimplementation.*

---

## Evaluación de SimplerEnv

### 1. Configuración del Entorno

Para configurar el entorno, primero sigue el [repositorio oficial de SimplerEnv](https://github.com/simpler-env/SimplerEnv) para instalar el entorno base de `simpler_env`.

Después, dentro del entorno de `simpler_env`, instala las siguientes dependencias:

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Degradar numpy para compatibilidad con el entorno de simulación
```

**Problemas Comunes:**
Al probar SimplerEnv en NVIDIA A100, puedes encontrar el siguiente error:
`libvulkan.so.1: cannot open shared object file: No such file or directory`
Puedes consultar este enlace para solucionarlo: [Guía de Instalación - Sección Vulkan](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### Verificación

Proporcionamos un script mínimo de verificación del entorno:

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

Si ves el mensaje "✅ Env built successfully", significa que SimplerEnv está instalado correctamente y listo para usar.

---

### 2. Flujo de Evaluación

Ejecuta la evaluación **desde la raíz del repositorio starVLA** usando **dos terminales separadas**, una para cada entorno.

:::note[¿Por qué dos terminales?]
La inferencia del modelo (entorno starVLA) y la simulación (entorno simpler_env) dependen de diferentes versiones de paquetes Python que entrarían en conflicto si se instalan en el mismo entorno conda. Ejecutarlos en terminales separadas con entornos conda separados evita esto.
:::

- **Entorno starVLA**: ejecuta el servidor de inferencia de políticas.
- **Entorno simpler_env**: ejecuta el código de evaluación de la simulación.

#### Paso 0. Descargar Checkpoint

Descarga el checkpoint: [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Paso 1. Iniciar el servidor (entorno starVLA)

En la primera terminal, activa el entorno conda `starVLA` y ejecuta:

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**Nota:** Abre `examples/SimplerEnv/eval_files/run_policy_server.sh`, busca la variable `your_ckpt` y configúrala con la ruta real de tu checkpoint, por ejemplo `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`.

---

#### Paso 2. Iniciar la simulación (entorno simpler_env)

En la segunda terminal, activa el entorno conda `simpler_env` y ejecuta:

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

Este script lanzará automáticamente las tareas de evaluación del robot WidowX, reproduciendo los resultados del benchmark reportados anteriormente.

**Nota:** Abre `examples/SimplerEnv/start_simpler_env.sh`, busca la variable `SimplerEnv_PATH` y configúrala con la ruta de tu clon del repositorio SimplerEnv (por ejemplo `/path/to/SimplerEnv`).

**Problemas Comunes:**
Si encuentras `NotImplementedError: Framework QwenGR00T is not implemented` al ejecutar el servidor de políticas, esto generalmente significa que el Framework no se ha registrado correctamente en la ruta de importación de Python. Ejecuta primero la prueba de humo para activar el registro correcto:
```bash
python starVLA/model/framework/QwenGR00T.py
```
Si la prueba de humo pasa, reinicia el servidor de políticas.

---

## Entrenamiento en OXE

### Preparación de Datos

Pasos:
1. Descarga un dataset OXE en formato LeRobot:
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. Incluye `modality.json` en cada `*lerobot/meta/modality.json`:
   - [bridge modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - Renombrar como `modality.json` y colocar en `bridge_orig_lerobot/meta/modality.json`
   - [fractal modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - Renombrar como `modality.json` y colocar en `fractal20220817_data_lerobot/meta/modality.json`

3. Agrega la ruta de tu dataset a `config.yaml`:
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### Verifica tu Dataloader

Proporcionamos una forma sencilla de verificar tu dataloader. Asegúrate de que puedas cargar datos por lotes:

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Preparación del Framework

Antes de ejecutar, necesitas asegurarte de que tu framework puede hacer `forward` y `predict_action` usando un ejemplo de datos ficticios.

Prueba el siguiente comando:

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Iniciar el Entrenamiento

Una vez que todo esté listo, usa nuestro script proporcionado para iniciar el entrenamiento:

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**Nota:** Asegúrate de que el script use explícitamente la ruta de configuración validada. Si aún no se pasa, agrega el argumento `--config_yaml`.
