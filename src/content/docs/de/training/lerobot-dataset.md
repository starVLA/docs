---
title: Eigenen LeRobot-Datensatz verwenden
description: StarVLA mit Ihrem eigenen LeRobot-Format-Datensatz trainieren.
---

Dieser Leitfaden fuehrt Sie durch den gesamten Prozess des Trainings von StarVLA mit Ihren eigenen Robotikdaten, von der Datenkonvertierung bis zum Modelltraining.

## Uebersicht

Der Workflow besteht aus fuenf Hauptschritten:

1. **Daten in LeRobot-Format konvertieren** - Transformieren Sie Ihre Rohdaten in das standardisierte LeRobot-Format
2. **Robotertyp-Konfiguration erstellen** - Definieren Sie, wie die Datenmodalitaeten Ihres Roboters strukturiert sind
3. **Data Mix erstellen** - Registrieren Sie Ihren Datensatz im Mischungsregister
4. **Trainingskonfiguration erstellen** - Konfigurieren Sie die Trainingsparameter
5. **Training starten** - Fuehren Sie das Trainingsskript aus

## Schritt 1: Daten in LeRobot-Format konvertieren

StarVLA verwendet das LeRobot-Datensatzformat fuer VLA-Training. Sie muessen Ihre Robotikdaten zuerst in dieses Format konvertieren.

### LeRobot-Datenstruktur

Ein LeRobot-Datensatz erfordert die folgenden Features:

- **`observation.state`**: Roboterzustand (Gelenkpositionen, Endeffektorpose usw.)
- **`action`**: Roboter-Aktionen (Gelenkbefehle, Delta-Positionen usw.)
- **`observation.images.*`**: Kamerabilder (als Video gespeichert)
- **`language_instruction`** oder **`task`**: Aufgabenbeschreibungstext

### Konvertierungsbeispiel

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# Definieren Sie Ihre Datensatz-Features
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # z. B. 6 Gelenke + 1 Greifer
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # Hoehe, Breite, Kanaele
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# Datensatz erstellen
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# Frames aus Ihren Daten hinzufuegen
# Angenommen, Ihre Rohdaten sind nach Episoden organisiert (jeweils eine vollstaendige Demonstration),
# die jeweils mehrere Frames enthalten.
# z. B.: episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # `task` ist ein intern von LeRobot benoetigtes Feld zur Gruppierung
            # von Episoden nach Aufgabe; sein Inhalt ist normalerweise identisch mit language_instruction
            "task": frame["instruction"],
        })
    dataset.save_episode()

# Datensatz finalisieren
dataset.finalize()
```

:::tip
Fuer detaillierte Anweisungen zur LeRobot-Konvertierung lesen Sie die [LeRobot-Dokumentation](https://github.com/huggingface/lerobot).
:::

### Datensatz-Verzeichnisstruktur

Nach der Konvertierung sollte Ihr Datensatz diese Struktur haben:

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

### Modality-JSON-Datei

Erstellen Sie eine `modality.json`-Datei in Ihrem Trainingsverzeichnis, um die Zuordnung zwischen LeRobot-Schluesseln und StarVLA-Schluesseln zu definieren. Betrachten Sie sie als "Uebersetzungstabelle" -- sie uebersetzt die rohen Spaltennamen in Ihrem Datensatz in StarVLAs vereinheitlichte interne Namen, sodass verschiedene Datensaetze durch denselben Code verarbeitet werden koennen, indem sie einfach ihre eigene `modality.json` bereitstellen:

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

StarVLA stellt `modality.json`-Dateien fuer alle integrierten Benchmarks bereit. Sie finden diese im jeweiligen Benchmark-Beispielverzeichnis (z. B. `examples/LIBERO/train_files/modality.json`, `examples/SimplerEnv/train_files/modality.json`).

## Schritt 2: Robotertyp-Konfiguration erstellen

Die Robotertyp-Konfiguration definiert, wie StarVLA Ihre Daten liest und verarbeitet. Erstellen Sie eine neue Konfigurationsklasse in `starVLA/dataloader/gr00t_lerobot/data_config.py`.

### Konfigurationsstruktur

```python
class MyRobotDataConfig:
    # Schluessel fuer jede Modalitaet definieren
    video_keys = [
        "video.camera_1",      # Zuordnung zu observation.images.camera_1
        "video.camera_2",      # Zuordnung zu observation.images.camera_2
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

    # Indexkonfiguration
    observation_indices = [0]        # Welche Zeitschritte fuer die Beobachtung verwenden
    action_indices = list(range(8))  # Aktionshorizont (8 zukuenftige Schritte vorhersagen)

    def modality_config(self):
        """Modalitaetskonfigurationen fuer das Datenladen definieren."""
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
        """Datentransformationen definieren."""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # State-Transformationen
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # Action-Transformationen
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

Beachten Sie die Zuordnungsbeziehung, die durch Modality in der DataConfig implementiert wird. Wenn ein Datensatz beispielsweise State und Action mit allen Freiheitsgraden einschliesslich Arm, Greifer, Koerper und Rad enthaelt, kann Modality die Bedeutung jedes Indexbereichs herausschneiden (ueber die Schluessel `start` und `end`) und sie dann in der DataConfig neu zusammensetzen und organisieren.

**Konkretes Beispiel**: Angenommen, Ihr Roboter hat einen 7-DOF-Arm + 1 Greifer, und der rohe State ist ein 8-dimensionaler Vektor `[j0, j1, j2, j3, j4, j5, j6, gripper]`. In `modality.json` teilen Sie ihn auf als: `"arm_joint": {"start": 0, "end": 7}` fuer die ersten 7 Dimensionen (Gelenkwinkel) und `"gripper_joint": {"start": 7, "end": 8}` fuer die 8. Dimension (Greiferzustand). Dies ermoeglicht StarVLA zu wissen, welche Dimensionen Armgelenke sind und welche der Greifer, und verschiedene Normalisierungsstrategien fuer jede anzuwenden.

### Konfiguration registrieren

Fuegen Sie Ihre Konfiguration zur `ROBOT_TYPE_CONFIG_MAP` am Ende von `data_config.py` hinzu:

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... bestehende Konfigurationen ...
    "my_robot": MyRobotDataConfig(),
}
```

### Normalisierungsmodi

Verfuegbare Normalisierungsmodi fuer `StateActionTransform`:

| Modus | Beschreibung |
|------|-------------|
| `min_max` | Normalisierung auf [-1, 1] unter Verwendung von Min/Max-Statistiken |
| `q99` | Normalisierung unter Verwendung der 1. und 99. Perzentile (robust gegenueber Ausreissern) |
| `binary` | Zuordnung zu {-1, 1} fuer binaere Aktionen (z. B. Greifer oeffnen/schliessen) |
| `rotation_6d` | Rotation in 6D-Darstellung konvertieren |
| `axis_angle` | Rotation in Achse-Winkel-Darstellung konvertieren |

:::tip
In einer typischen StarVLA-Konfiguration verwenden wir absolute Gelenkposition als Darstellung fuer State oder Action. In diesem Fall wird generell empfohlen, `min_max` fuer den Arm und `binary` fuer den Greifer zu verwenden.
:::

## Schritt 3: Data Mix erstellen

Registrieren Sie Ihren Datensatz in `starVLA/dataloader/gr00t_lerobot/mixtures.py`:

```python
DATASET_NAMED_MIXTURES = {
    # ... bestehende Mischungen ...

    # Einzelner Datensatz
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (dataset_ordnername, sampling_gewicht, robotertyp_konfiguration)
    ],

    # Mehrere Datensaetze mit unterschiedlichen Gewichten
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # Halbes Sampling-Gewicht
        ("my_dataset_task3", 2.0, "my_robot"),  # Doppeltes Sampling-Gewicht
    ],
}
```

### Datenverzeichnisstruktur

Ihre Daten sollten wie folgt organisiert sein:

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

## Schritt 4: Trainingskonfiguration erstellen

Erstellen Sie eine YAML-Konfigurationsdatei (z. B. `examples/MyRobot/train_files/starvla_my_robot.yaml`):

```yaml
# ===== Ausfuehrungskonfiguration =====
run_id: my_robot_training           # Experimentname; Checkpoints werden unter run_root_dir/run_id/ gespeichert
run_root_dir: results/Checkpoints   # Stammverzeichnis fuer Checkpoint-Ausgabe
seed: 42
trackers: [jsonl, wandb]            # Protokollierung: jsonl (lokal) + wandb (online)
wandb_entity: your_wandb_entity     # Ihr wandb-Benutzername oder Team
wandb_project: my_robot_project
is_debug: false                     # Auf true setzen fuer minimale Daten zum schnellen Debugging

# ===== Modell-Framework-Konfiguration =====
framework:
  name: QwenOFT                     # Auswahl: QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # VLM-Basismodellpfad
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # VLM-Hidden-Dimension (2048 fuer Qwen3-VL-4B)
  dino:
    dino_backbone: dinov2_vits14    # Optionaler zusaetzlicher Vision-Encoder fuer raeumliche Features

  action_model:
    action_model_type: DiT-B        # Action-Modelltyp (DiT-B nur fuer GR00T/PI-Frameworks)
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # Aktionsdimension = Gelenkanzahl Ihres Roboters (z. B. 7 Gelenke x 2 Arme = 14)
    state_dim: 14                   # State-Dimension, normalerweise gleich action_dim
    future_action_window_size: 15   # Wie viele zukuenftige Schritte das Modell vorhersagt (Action-Chunk-Laenge - 1)
    action_horizon: 16              # Gesamte Aktionssequenzlaenge = future + 1 (aktueller Schritt)
    past_action_window_size: 0      # Historisches Aktionsfenster (0 = keine Historie)
    repeated_diffusion_steps: 8     # Diffusion-Sampling-Wiederholungen waehrend des Trainings (nur GR00T/PI)
    num_inference_timesteps: 4      # Diffusion-Schritte bei Inferenz (weniger = schneller, weniger praezise)
    num_target_vision_tokens: 32    # Anzahl komprimierter Vision-Tokens vom VLM
    # DiT-Transformer-Interna (normalerweise keine Aenderung noetig):
    diffusion_model_cfg:
      cross_attention_dim: 2048     # Muss mit hidden_dim des VLM uebereinstimmen
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== Datensatz-Konfiguration =====
datasets:
  # VLM-Daten (optional, nur fuer Co-Training erforderlich)
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # In qwen_data_config.py registrierter Datensatzname
    per_device_batch_size: 4

  # VLA-Daten (Robotermanipulationsdaten, erforderlich)
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # Datensatz-Stammverzeichnis
    data_mix: my_dataset            # In mixtures.py registrierter Mischungsname
    action_type: abs_qpos           # Aktionstyp: abs_qpos = absolute Gelenkposition (Zielwinkelwerte)
    default_image_resolution: [3, 224, 224]  # [Kanaele, Hoehe, Breite]
    per_device_batch_size: 16
    load_all_data_for_training: true # Alle Trainingsdaten beim Start in den Speicher laden (schnelleres Training, aber mehr RAM)
    obs: ["image_0"]                # Welche Kameras verwenden (image_0 = erste Kamera in der video_keys-Liste der DataConfig)
    image_size: [224,224]
    video_backend: torchvision_av   # Video-Decode-Backend (torchvision_av oder decord)

# ===== Trainer-Konfiguration =====
trainer:
  epochs: 100
  max_train_steps: 100000           # Maximale Trainingsschritte (stoppt hier unabhaengig von Epochen)
  num_warmup_steps: 5000            # Lernraten-Warmup-Schritte
  save_interval: 5000               # Checkpoint alle N Schritte speichern
  eval_interval: 100                # Auf Validierungsset alle N Schritte evaluieren

  # Pro-Modul-Lernraten: verschiedene Komponenten koennen verschiedene Raten verwenden
  learning_rate:
    base: 1e-05                     # Standard-LR (verwendet fuer Module, die unten nicht angegeben sind)
    qwen_vl_interface: 1.0e-05      # VLM-Backbone-LR
    action_model: 1.0e-04           # Action-Head-LR (hoeher, da von Grund auf trainiert)

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # Minimale LR fuer Kosinus-Abklingung

  freeze_modules: ''                # Modulpfade zum Einfrieren (leer = alle trainierbar)
  loss_scale:
    vla: 1.0                        # VLA-Verlustgewichtung
    vlm: 0.1                        # VLM-Verlustgewichtung (fuer Co-Training)
  repeated_diffusion_steps: 4       # Diffusion-Sampling-Wiederholungen zur Trainingszeit (ueberschreibt action_model-Wert)
  max_grad_norm: 1.0                # Gradient-Clipping-Schwellwert
  gradient_accumulation_steps: 1    # Erhoehen, falls GPU-Speicher knapp wird

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[Zu action_dim und state_dim]
Diese Werte haengen von Ihrer Roboterhardware ab. Beispiele:
- Einzelarm mit 7 Gelenken + 1 Greifer → `action_dim: 8`, `state_dim: 8`
- Zweiarm mit je 7 Gelenken → `action_dim: 14`, `state_dim: 14`
- BEHAVIOR R1Pro-Humanoid → `action_dim: 23`, `state_dim: 23`

Muss mit der Gesamtdimension der action/state-Schluessel in Ihrer DataConfig uebereinstimmen.
:::

| Framework | Action Head | Am besten fuer |
|-----------|-------------|----------|
| `QwenOFT` | MLP | Schnelle Inferenz, einfache Aufgaben |
| `QwenGR00T` | Flow-matching DiT | Komplexe Manipulation, hohe Praezision |
| `QwenFast` | Diskrete Tokens | Token-basierte Aktionsvorhersage |
| `QwenPI` | Diffusion | Multimodale Aktionsverteilungen |

Sie koennen auch von der Community unterstuetzte Modelle waehlen, die das BaseFramework teilen und einfach durch Aendern der Konfiguration angepasst werden koennen.

## Schritt 5: Training starten

Erstellen Sie ein Trainingsskript (z. B. `examples/MyRobot/train_files/run_train.sh`):

```bash
#!/bin/bash

# ========== Erforderlicher Parameter ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # Trainingskonfigurationsdatei (erforderlich)

# ========== Optionale Ueberschreibungen (CLI hat Vorrang vor YAML-Werten) ==========
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# Ausgabeverzeichnis erstellen
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# Training starten
# --config_yaml ist das einzige erforderliche Argument; alle anderen --xxx-Flags sind optionale CLI-Ueberschreibungen.
# Wenn Sie bereits alles in Ihrer YAML-Datei konfiguriert haben, koennen Sie die unten stehenden Ueberschreibungs-Flags weglassen.
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

### Multi-Node-Training

Fuer verteiltes Training ueber mehrere Knoten:

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
  # ... weitere Argumente
```
