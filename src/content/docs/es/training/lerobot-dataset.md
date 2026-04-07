---
title: Usa tu Propio Dataset LeRobot
description: Entrena StarVLA con tu propio dataset en formato LeRobot.
---

Esta guía te lleva a través del proceso completo de entrenamiento de StarVLA con tus propios datos robóticos, desde la conversión de datos hasta el entrenamiento del modelo.

## Descripción General

El flujo de trabajo consta de cinco pasos principales:

1. **Convertir Datos a Formato LeRobot** - Transforma tus datos crudos al formato estandarizado LeRobot
2. **Crear Configuración de Tipo de Robot** - Define cómo están estructuradas las modalidades de datos de tu robot
3. **Crear Mezcla de Datos** - Registra tu dataset en el registro de mezclas
4. **Crear Configuración de Entrenamiento** - Configura los parámetros de entrenamiento
5. **Ejecutar Entrenamiento** - Lanza el script de entrenamiento

## Paso 1: Convertir Datos a Formato LeRobot

StarVLA usa el formato de dataset LeRobot para entrenamiento VLA. Necesitas convertir tus datos robóticos a este formato primero.

### Estructura de Datos LeRobot

Un dataset LeRobot requiere las siguientes características:

- **`observation.state`**: Estado del robot (posiciones articulares, pose del efector final, etc.)
- **`action`**: Acciones del robot (comandos articulares, posiciones delta, etc.)
- **`observation.images.*`**: Imágenes de cámara (almacenadas como video)
- **`language_instruction`** o **`task`**: Texto de descripción de la tarea

### Ejemplo de Conversión

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# Define las características de tu dataset
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # por ejemplo, 6 articulaciones + 1 gripper
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # alto, ancho, canales
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# Crear dataset
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# Agregar frames de tus datos
# Asume que tus datos crudos están organizados por episodio (una demostración completa),
# cada uno conteniendo múltiples frames.
# por ejemplo: episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # `task` es un campo requerido usado internamente por LeRobot para agrupar
            # episodios por tarea; su contenido suele ser igual a language_instruction
            "task": frame["instruction"],
        })
    dataset.save_episode()

# Finalizar el dataset
dataset.finalize()
```

:::tip
Para instrucciones detalladas de conversión a LeRobot, consulta la [documentación de LeRobot](https://github.com/huggingface/lerobot).
:::

### Estructura del Directorio del Dataset

Después de la conversión, tu dataset debería tener esta estructura:

```
your_dataset_name/
├── meta/
│   ├── info.json
│   ├── episodes.jsonl
│   ├── stats.json
│   └── tasks.json
├── data/
│   └── chunk-000/
│       └── episode_000000.parquet
└── videos/
    └── chunk-000/
        └── observation.images.image/
            └── episode_000000.mp4
```

### Archivo JSON de Modalidad

Crea un archivo `modality.json` en tu directorio de entrenamiento para definir el mapeo entre las claves de LeRobot y las claves de StarVLA. Piensa en él como una "tabla de traducción" — traduce los nombres de columna crudos de tu dataset a los nombres internos unificados de StarVLA, para que diferentes datasets puedan ser procesados por el mismo código simplemente proporcionando su propio `modality.json`:

```json
{
    "state": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "action": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "video": {
        "camera_1": {"original_key": "observation.images.camera_1"},
        "camera_2": {"original_key": "observation.images.camera_2"}
    },
    "annotation": {
        "human.action.task_description": {"original_key": "language_instruction"}
    }
}
```

StarVLA proporciona archivos `modality.json` para todos los benchmarks integrados. Puedes encontrarlos en el directorio de ejemplos de cada benchmark (por ejemplo, `examples/LIBERO/train_files/modality.json`, `examples/SimplerEnv/train_files/modality.json`).

## Paso 2: Crear Configuración de Tipo de Robot

La Configuración de Tipo de Robot define cómo StarVLA lee y procesa tus datos. Crea una nueva clase de configuración en `starVLA/dataloader/gr00t_lerobot/data_config.py`.

### Estructura de la Configuración

```python
class MyRobotDataConfig:
    # Define las claves para cada modalidad
    video_keys = [
        "video.camera_1",      # Mapea a observation.images.camera_1
        "video.camera_2",      # Mapea a observation.images.camera_2
    ]
    state_keys = [
        "state.arm_joint",
        "state.gripper_joint",
    ]
    action_keys = [
        "action.arm_joint",
        "action.gripper_joint",
    ]
    language_keys = ["annotation.human.action.task_description"]

    # Configuración de índices
    observation_indices = [0]        # Qué pasos de tiempo usar para observación
    action_indices = list(range(8))  # Horizonte de acción (predecir 8 pasos futuros)

    def modality_config(self):
        """Define configuraciones de modalidad para la carga de datos."""
        from starVLA.dataloader.gr00t_lerobot.datasets import ModalityConfig

        return {
            "video": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.video_keys,
            ),
            "state": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.state_keys,
            ),
            "action": ModalityConfig(
                delta_indices=self.action_indices,
                modality_keys=self.action_keys,
            ),
            "language": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.language_keys,
            ),
        }

    def transform(self):
        """Define transformaciones de datos."""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # Transformaciones de estado
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # Transformaciones de acción
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

Nota la relación de mapeo implementada por Modality en el DataConfig. Por ejemplo, si un dataset contiene estado y acción con todos los grados de libertad incluyendo brazo, gripper, cuerpo y rueda, Modality puede separar el significado de cada rango de índices (mediante las claves `start` y `end`), y luego reensamblar y organizar en el DataConfig.

**Ejemplo concreto**: Supón que tu robot tiene un brazo de 7 DOF + 1 gripper, y el estado crudo es un vector de 8 dimensiones `[j0, j1, j2, j3, j4, j5, j6, gripper]`. En `modality.json`, lo divides como: `"arm_joint": {"start": 0, "end": 7}` para las primeras 7 dimensiones (ángulos articulares) y `"gripper_joint": {"start": 7, "end": 8}` para la 8va dimensión (estado del gripper). Esto permite a StarVLA saber qué dimensiones son articulaciones del brazo y cuáles son del gripper, habilitando diferentes estrategias de normalización para cada una.

### Registrar la Configuración

Agrega tu configuración al `ROBOT_TYPE_CONFIG_MAP` al final de `data_config.py`:

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... configuraciones existentes ...
    "my_robot": MyRobotDataConfig(),
}
```

### Modos de Normalización

Modos de normalización disponibles para `StateActionTransform`:

| Modo | Descripción |
|------|-------------|
| `min_max` | Normaliza a [-1, 1] usando estadísticas mín/máx |
| `q99` | Normaliza usando percentiles 1 y 99 (robusto a valores atípicos) |
| `binary` | Mapea a {-1, 1} para acciones binarias (por ejemplo, gripper abrir/cerrar) |
| `rotation_6d` | Convierte rotación a representación 6D |
| `axis_angle` | Convierte rotación a representación eje-ángulo |

:::tip
En una configuración común de StarVLA, usamos Posición Articular absoluta como representación para Estado o Acción. En este caso, generalmente se recomienda usar `min_max` para el Brazo y `binary` para el Gripper.
:::

## Paso 3: Crear Mezcla de Datos

Registra tu dataset en `starVLA/dataloader/gr00t_lerobot/mixtures.py`:

```python
DATASET_NAMED_MIXTURES = {
    # ... mezclas existentes ...

    # Dataset único
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (nombre_carpeta_dataset, peso_muestreo, configuración_tipo_robot)
    ],

    # Múltiples datasets con diferentes pesos
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # Mitad del peso de muestreo
        ("my_dataset_task3", 2.0, "my_robot"),  # Doble del peso de muestreo
    ],
}
```

### Estructura del Directorio de Datos

Tus datos deben organizarse como:

```
playground/Datasets/MY_DATA_ROOT/
├── my_dataset_task1/
│   ├── meta/
│   ├── data/
│   └── videos/
├── my_dataset_task2/
│   ├── meta/
│   ├── data/
│   └── videos/
└── my_dataset_task3/
    ├── meta/
    ├── data/
    └── videos/
```

## Paso 4: Crear Configuración de Entrenamiento

Crea un archivo de configuración YAML (por ejemplo, `examples/MyRobot/train_files/starvla_my_robot.yaml`):

```yaml
# ===== Configuración de Ejecución =====
run_id: my_robot_training           # Nombre del experimento; checkpoints guardados bajo run_root_dir/run_id/
run_root_dir: results/Checkpoints   # Directorio raíz para salida de checkpoints
seed: 42
trackers: [jsonl, wandb]            # Registro: jsonl (local) + wandb (en línea)
wandb_entity: your_wandb_entity     # Tu nombre de usuario o equipo de wandb
wandb_project: my_robot_project
is_debug: false                     # Establecer true para usar datos mínimos para depuración rápida

# ===== Configuración del Framework del Modelo =====
framework:
  name: QwenOFT                     # Elegir: QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # Ruta del modelo base VLM
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # Dimensión oculta del VLM (2048 para Qwen3-VL-4B)
  dino:
    dino_backbone: dinov2_vits14    # Codificador de visión extra opcional para características espaciales

  action_model:
    action_model_type: DiT-B        # Tipo de modelo de acción (DiT-B solo para frameworks GR00T/PI)
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # Dimensión de acción = cantidad de articulaciones de tu robot (por ejemplo, 7 articulaciones × 2 brazos = 14)
    state_dim: 14                   # Dimensión de estado, generalmente igual a action_dim
    future_action_window_size: 15   # Cuántos pasos futuros predice el modelo (longitud del chunk de acción - 1)
    action_horizon: 16              # Longitud total de la secuencia de acción = futuro + 1 (paso actual)
    past_action_window_size: 0      # Ventana de acción histórica (0 = sin historial)
    repeated_diffusion_steps: 8     # Repeticiones de muestreo de difusión durante entrenamiento (solo GR00T/PI)
    num_inference_timesteps: 4      # Pasos de difusión en inferencia (menos = más rápido, menos preciso)
    num_target_vision_tokens: 32    # Número de tokens de visión comprimidos del VLM
    # Internos del Transformer DiT (generalmente no necesitan modificación):
    diffusion_model_cfg:
      cross_attention_dim: 2048     # Debe coincidir con hidden_dim del VLM
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== Configuración de Datasets =====
datasets:
  # Datos VLM (opcional, solo necesario para co-entrenamiento)
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # Nombre del dataset registrado en qwen_data_config.py
    per_device_batch_size: 4

  # Datos VLA (datos de manipulación robótica, requerido)
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # Directorio raíz del dataset
    data_mix: my_dataset            # Nombre de mezcla registrado en mixtures.py
    action_type: abs_qpos           # Tipo de acción: abs_qpos = posición articular absoluta (valores de ángulo objetivo)
    default_image_resolution: [3, 224, 224]  # [canales, alto, ancho]
    per_device_batch_size: 16
    load_all_data_for_training: true # Cargar todos los datos de entrenamiento en memoria al inicio (entrenamiento más rápido, pero usa más RAM)
    obs: ["image_0"]                # Qué cámaras usar (image_0 = primera cámara en la lista video_keys del DataConfig)
    image_size: [224,224]
    video_backend: torchvision_av   # Backend de decodificación de video (torchvision_av o decord)

# ===== Configuración del Entrenador =====
trainer:
  epochs: 100
  max_train_steps: 100000           # Pasos máximos de entrenamiento (se detiene aquí independientemente de las épocas)
  num_warmup_steps: 5000            # Pasos de calentamiento de tasa de aprendizaje
  save_interval: 5000               # Guardar checkpoint cada N pasos
  eval_interval: 100                # Evaluar en conjunto de validación cada N pasos

  # Tasas de aprendizaje por módulo: diferentes componentes pueden usar tasas diferentes
  learning_rate:
    base: 1e-05                     # LR predeterminado (usado para módulos no especificados abajo)
    qwen_vl_interface: 1.0e-05      # LR del backbone VLM
    action_model: 1.0e-04           # LR de la cabeza de acción (más alto ya que se entrena desde cero)

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # LR mínimo para decaimiento coseno

  freeze_modules: ''                # Rutas de módulos a congelar (vacío = todos entrenables)
  loss_scale:
    vla: 1.0                        # Peso de pérdida VLA
    vlm: 0.1                        # Peso de pérdida VLM (para co-entrenamiento)
  repeated_diffusion_steps: 4       # Repeticiones de muestreo de difusión en tiempo de entrenamiento (sobrescribe el valor de action_model)
  max_grad_norm: 1.0                # Umbral de recorte de gradientes
  gradient_accumulation_steps: 1    # Aumentar si te quedas sin memoria GPU

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[Sobre action_dim y state_dim]
Estos valores dependen del hardware de tu robot. Ejemplos:
- Brazo único con 7 articulaciones + 1 gripper → `action_dim: 8`, `state_dim: 8`
- Doble brazo con 7 articulaciones cada uno → `action_dim: 14`, `state_dim: 14`
- Humanoide R1Pro de BEHAVIOR → `action_dim: 23`, `state_dim: 23`

Deben coincidir con la dimensión total de las claves de acción/estado definidas en tu DataConfig.
:::

| Framework | Cabeza de Acción | Mejor Para |
|-----------|-----------------|------------|
| `QwenOFT` | MLP | Inferencia rápida, tareas simples |
| `QwenGR00T` | Flow-matching DiT | Manipulación compleja, alta precisión |
| `QwenFast` | Tokens discretos | Predicción de acciones basada en tokens |
| `QwenPI` | Difusión | Distribuciones de acción multimodales |

También puedes elegir modelos soportados por la comunidad, que comparten el BaseFramework y pueden adaptarse simplemente modificando la configuración.

## Paso 5: Ejecutar Entrenamiento

Crea un script de entrenamiento (por ejemplo, `examples/MyRobot/train_files/run_train.sh`):

```bash
#!/bin/bash

# ========== Parámetro requerido ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # Archivo de configuración de entrenamiento (requerido)

# ========== Sobrescrituras opcionales (CLI tiene prioridad sobre los valores YAML) ==========
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# Crear directorio de salida
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# Lanzar entrenamiento
# --config_yaml es el único argumento requerido; todos los demás flags --xxx son sobrescrituras opcionales de CLI.
# Si ya has configurado todo en tu archivo YAML, puedes omitir los flags de sobrescritura abajo.
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  --framework.name ${Framework_name} \
  --framework.qwenvl.base_vlm ${base_vlm} \
  --datasets.vla_data.data_root_dir ${data_root} \
  --datasets.vla_data.data_mix ${data_mix} \
  --datasets.vla_data.per_device_batch_size 4 \
  --trainer.max_train_steps 100000 \
  --trainer.save_interval 10000 \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id}
```

### Entrenamiento Multi-Nodo

Para entrenamiento distribuido multi-nodo:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes ${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  # ... otros argumentos
```
