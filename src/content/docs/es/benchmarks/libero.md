---
title: Evaluación de LIBERO
description: Reproduce los resultados experimentales de StarVLA en LIBERO (configuración, flujo de evaluación y notas de entrenamiento).
---

**LIBERO** es un benchmark de manipulación robótica sobre mesa con 4 suites de tareas (Spatial, Object, Goal, Long Horizon), totalizando 40 tareas. Evalúa modelos VLA en comprensión espacial, reconocimiento de objetos, razonamiento de objetivos y manipulación de horizonte largo usando un brazo robótico Franka.

Este documento proporciona instrucciones para reproducir nuestros **resultados experimentales** con LIBERO.
El proceso de evaluación consta de dos partes principales:

1. Configurar el entorno de `LIBERO` y sus dependencias.
2. Ejecutar la evaluación lanzando servicios en ambos entornos `starVLA` y `LIBERO`.

Hemos verificado que este flujo de trabajo funciona correctamente tanto en GPUs **NVIDIA A100** como **RTX 4090**.

---

## Evaluación de LIBERO

### 0. Descargar Checkpoints

Proporcionamos una colección de checkpoints preentrenados en Hugging Face para facilitar la evaluación de la comunidad: [StarVLA/bench-libero](https://huggingface.co/collections/StarVLA/libero). Sus resultados correspondientes en LIBERO se resumen en la tabla siguiente.

#### Resultados Experimentales

| Modelo                | Pasos | Épocas | Spatial | Object | Goal | Long | Prom |
|----------------------|-------|--------|---------|--------|------|------|------|
| $\pi_0$+FAST         | -     | -      | 96.4    | 96.8   | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT          | 175K  | 223    | 97.6    | 98.4   | 97.9 | 94.5 | 97.1 |
| $\pi_0$              | -     | -      | 96.8    | 98.8   | 95.8 | 85.2 | 94.1 |
| GR00T-N1.5           | 20K   | 203    | 92.0    | 92.0   | 86.0 | 76.0 | 86.5 |
| **StarVLA-FAST (Qwen2.5-VL)**  | 30K   | 9.54   | 97.3    | 97.2   | 96.1 | 90.2 | 95.2 |
| **StarVLA-OFT (Qwen2.5-VL)**   | 30K   | 9.54   | 97.4    | 98.0   | 96.8 | 92.0 | 96.1 |
| **StarVLA-π (Qwen2.5-VL)**     | 30K   | 9.54   | 98.2    | 99.2   | 95.6 | 88.4 | 95.4 |
| **StarVLA-GR00T (Qwen2.5-VL)** | 30K   | 9.54   | 97.8    | 98.2   | 94.6 | 90.8 | 95.4 |
| **StarVLA-FAST (Qwen3-VL)**    | 30K   | 9.54   | 97.3    | 97.4   | 96.3 | 90.6 | 95.4 |
| **StarVLA-OFT (Qwen3-VL)**     | 30K   | 9.54   | 97.8    | 98.6   | 96.2 | 93.8 | 96.6 |
| **StarVLA-π (Qwen3-VL)**       | 30K   | 9.54   | 98.8    | 99.6   | 95.8 | 88.4 | 95.7 |
| **StarVLA-GR00T (Qwen3-VL)**   | 30K   | 9.54   | 97.8    | 98.8   | 97.4 | 92.0 | 96.5 |

Entrenamos una política para las 4 suites. Todas las puntuaciones son promedio de 500 pruebas para cada suite de tareas (10 tareas × 50 episodios).

---

### 1. Configuración del Entorno

Para configurar el entorno, primero sigue el [repositorio oficial de LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO) para instalar el entorno base de `LIBERO`.

⚠️ **Problema común:** LIBERO usa Python 3.8 por defecto, pero las actualizaciones de sintaxis entre 3.8 y 3.10 son sustanciales. **Hemos verificado que usar Python 3.10 evita muchos problemas**.

Después, dentro del entorno de `LIBERO`, instala las siguientes dependencias:

```bash
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Degradar numpy para compatibilidad con el entorno de simulación
```

---

### 2. Flujo de Evaluación

Ejecuta la evaluación **desde la raíz del repositorio starVLA** usando **dos terminales separadas**, una para cada entorno.

:::note[¿Por qué dos terminales?]
La inferencia del modelo (entorno starVLA) y la simulación (entorno LIBERO) dependen de diferentes versiones de paquetes Python que entrarían en conflicto si se instalan en el mismo entorno conda. Ejecutarlos en terminales separadas con entornos conda separados evita esto.
:::

- **Entorno starVLA**: ejecuta el servidor de inferencia.
- **Entorno LIBERO**: ejecuta la simulación.

#### Paso 1. Iniciar el servidor (entorno starVLA)

En la primera terminal, activa el entorno conda `starVLA` y ejecuta:

```bash
bash examples/LIBERO/eval_files/run_policy_server.sh
```

⚠️ **Nota:** Asegúrate de especificar la ruta correcta del checkpoint en `examples/LIBERO/eval_files/run_policy_server.sh`

---

#### Paso 2. Iniciar la simulación (entorno LIBERO)

En la segunda terminal, activa el entorno conda `LIBERO` y ejecuta:

```bash
bash examples/LIBERO/eval_files/eval_libero.sh
```

⚠️ **Nota:** Asegúrate de configurar correctamente las siguientes variables en `eval_libero.sh`:

| Variable | Significado | Ejemplo |
|----------|-------------|---------|
| `LIBERO_HOME` | Ruta a tu clon del repositorio LIBERO | `/path/to/LIBERO` |
| `LIBERO_Python` | Ruta de Python del entorno conda de LIBERO | `$(which python)` (dentro del entorno LIBERO) |
| `your_ckpt` | Ruta del checkpoint de StarVLA | `./results/Checkpoints/.../steps_30000_pytorch_model.pt` |
| `unnorm_key` | Nombre del tipo de robot para cargar estadísticas de desnormalización | `franka` (LIBERO usa el brazo Franka) |

`unnorm_key` se usa para cargar las estadísticas de normalización (mín/máx, etc.) guardadas durante el entrenamiento, convirtiendo las salidas normalizadas del modelo de vuelta a ángulos articulares reales.

Finalmente, cada resultado también guardará un video para visualización, como se muestra a continuación:

![Ejemplo](../../../../assets/LIBERO_example.gif)

---

## Entrenamiento de LIBERO

### Paso 0: Descargar el dataset de entrenamiento

Descarga los datasets al directorio `playground/Datasets/LEROBOT_LIBERO_DATA`:

- [LIBERO-spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [LIBERO-object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [LIBERO-goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [LIBERO-10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

Y mueve `modality.json` a cada `$LEROBOT_LIBERO_DATA/subset/meta/modality.json`.

Puedes preparar estos rápidamente ejecutando:

```bash
# Establece DEST al directorio donde quieres almacenar los datos
export DEST=/path/to/your/data/directory
bash examples/LIBERO/data_preparation.sh
```

### Paso 1: Iniciar el Entrenamiento

La mayoría de los archivos de entrenamiento necesarios están organizados en `examples/LIBERO/train_files/`.

Ejecuta el siguiente comando para iniciar el entrenamiento:

```bash
bash examples/LIBERO/train_files/run_libero_train.sh
```

⚠️ **Nota:** Asegúrate de especificar la ruta correcta en `examples/LIBERO/train_files/run_libero_train.sh`
