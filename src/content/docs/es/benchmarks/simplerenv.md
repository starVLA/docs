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
