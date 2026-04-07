---
title: Evaluación de BEHAVIOR-1K
description: Ejecuta el framework StarVLA con el Benchmark BEHAVIOR-1K.
---

:::caution[En Construcción]
Este documento está en desarrollo activo.
:::

**BEHAVIOR-1K** es un benchmark de simulación de tareas domésticas de Stanford, que presenta 1000 actividades cotidianas (cocinar, limpiar, organizar, etc.). Seguimos la estructura del [Desafío BEHAVIOR 2025](https://behavior.stanford.edu/challenge/index.html) para entrenar y evaluar en 50 tareas domésticas completas. Utiliza el robot humanoide R1Pro (brazos duales + base + torso, espacio de acciones de 23 dimensiones).

El proceso de evaluación consta de dos partes principales:

1. Configurar el entorno de `behavior` y sus dependencias.
2. Ejecutar la evaluación lanzando servicios en ambos entornos `starVLA` y `behavior`.

:::note[¿Por qué dos terminales?]
La inferencia del modelo (entorno starVLA) y la simulación (entorno behavior) dependen de diferentes versiones de paquetes Python que entrarían en conflicto si se instalan en el mismo entorno conda. Ejecutarlos en terminales separadas con entornos conda separados evita esto.
:::

:::note[Requisitos de GPU]
El simulador de BEHAVIOR (OmniGibson) requiere **ray tracing por hardware (RT Cores)** para el renderizado. Las siguientes GPUs **no pueden usarse**: A100, H100 (carecen de RT Cores).

**Recomendadas**: RTX 3090, RTX 4090, u otras GPUs de la serie GeForce RTX / Quadro RTX.

Consulta [este issue](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1872#issuecomment-3455002820) y [esta discusión](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1875#issuecomment-3444246495) para más detalles.
:::

---

## Evaluación de BEHAVIOR

### 1. Configuración del Entorno

Para configurar el entorno conda para `behavior`:

```bash
git clone https://github.com/StanfordVL/BEHAVIOR-1K.git
conda create -n behavior python=3.10 -y
conda activate behavior
cd BEHAVIOR-1K
pip install "setuptools<=79"
# --omnigibson: Instala el simulador OmniGibson (motor de física de BEHAVIOR)
# --bddl: Instala BDDL (Behavior Domain Definition Language para definiciones de tareas)
# --joylo: Instala JoyLo (interfaz de control por teleoperación)
# --dataset: Descarga los assets del dataset BEHAVIOR (escenas, modelos de objetos, etc.)
./setup.sh --omnigibson --bddl --joylo --dataset
conda install -c conda-forge libglu
pip install rich omegaconf hydra-core msgpack websockets av pandas google-auth
```

También en el entorno starVLA:

```bash
pip install websockets
```

---

### 2. Flujo de Evaluación

Pasos:
1. Descargar el checkpoint
2. Elige el script adecuado según tu necesidad

#### (A) Script de Evaluación en Paralelo

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval.sh
```

Antes de ejecutar `start_parallel_eval.sh`, configura las siguientes rutas:
- `star_vla_python`: Intérprete de Python para el entorno StarVLA
- `sim_python`: Intérprete de Python para el entorno Behavior
- `TASKS_JSONL_PATH`: Archivo de descripción de tareas descargado del [dataset de entrenamiento](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos) (incluido en `examples/Behavior/tasks.jsonl`)
- `BEHAVIOR_ASSET_PATH`: Ruta local a los assets de behavior (por defecto está en `BEHAVIOR-1K/datasets` después de instalar con `./setup.sh`)

#### (B) Depuración con Terminales Separadas

Para facilitar la depuración, también puedes iniciar el cliente (entorno de evaluación) y el servidor (política) en dos terminales separadas:

```bash
bash examples/Behavior/start_server.sh
bash examples/Behavior/start_client.sh
```

Los archivos de depuración anteriores realizarán la evaluación en el conjunto de entrenamiento.

#### (C) Evaluación por Tarea (Segura para Memoria)

Para prevenir desbordamiento de memoria, implementamos otro archivo `start_parallel_eval_per_task.sh`:

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval_per_task.sh
```

- El script ejecutará la evaluación para cada tarea en `INSTANCE_NAMES` iterativamente
- Para cada tarea, asigna todas las instancias de `TEST_EVAL_INSTANCE_IDS` entre las GPUs
- Espera a que la tarea anterior termine, luego procede a la siguiente tarea

---

## Notas

### Tipos de Wrapper

1. **RGBLowResWrapper**: Solo usa RGB como observación visual y resoluciones de cámara de 224×224. Usar solo RGB de baja resolución puede ayudar a acelerar el simulador y reducir el tiempo de evaluación. Este wrapper es válido para usar en la categoría estándar.

2. **DefaultWrapper**: Wrapper con la configuración de observación predeterminada usada durante la recolección de datos (RGB + profundidad + segmentación, 720p para cámara frontal y 480p para cámara de muñeca). Este wrapper es válido para usar en la categoría estándar, pero la evaluación será considerablemente más lenta comparada con RGBLowResWrapper.

3. **RichObservationWrapper**: Carga modalidades de observación adicionales, como normales y flujo, así como información privilegiada de la tarea. Este wrapper solo puede usarse en la categoría de información privilegiada.

### Dimensiones de Acción

BEHAVIOR tiene action dim = 23:

```python
"R1Pro": {
    "base": np.s_[0:3],           # Índices 0-2
    "torso": np.s_[3:7],          # Índices 3-6
    "left_arm": np.s_[7:14],      # Índices 7-13
    "left_gripper": np.s_[14:15], # Índice 14
    "right_arm": np.s_[15:22],    # Índices 15-21
    "right_gripper": np.s_[22:23] # Índice 22
}
```

### Guardado de Video

El video se guardará en el formato `{task_name}_{idx}_{epi}.mp4`, donde `idx` es el número de instancia y `epi` es el número de episodio.

### Problemas Comunes

**Segmentation fault (core dumped):** Una razón probable es que Vulkan no se instaló correctamente. Consulta [este enlace](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan).

**ImportError: libGL.so.1: cannot open shared object file:**
```bash
apt-get install ffmpeg libsm6 libxext6 -y
```
