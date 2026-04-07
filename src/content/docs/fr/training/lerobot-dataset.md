---
title: Utiliser votre propre dataset LeRobot
description: Entrainer StarVLA avec votre propre dataset au format LeRobot.
---

Ce guide vous accompagne tout au long du processus complet d'entrainement de StarVLA sur vos propres donnees robotiques, de la conversion des donnees a l'entrainement du modele.

## Vue d'ensemble

Le workflow se compose de cinq etapes principales :

1. **Convertir les donnees au format LeRobot** - Transformer vos donnees brutes dans le format standardise LeRobot
2. **Creer la configuration du type de robot** - Definir comment les modalites de donnees de votre robot sont structurees
3. **Creer un Data Mix** - Enregistrer votre dataset dans le registre de mixtures
4. **Creer la configuration d'entrainement** - Configurer les parametres d'entrainement
5. **Lancer l'entrainement** - Executer le script d'entrainement

## Etape 1 : Convertir les donnees au format LeRobot

StarVLA utilise le format de dataset LeRobot pour l'entrainement VLA. Vous devez d'abord convertir vos donnees robotiques dans ce format.

### Structure des donnees LeRobot

Un dataset LeRobot necessite les features suivantes :

- **`observation.state`** : Etat du robot (positions articulaires, pose de l'effecteur terminal, etc.)
- **`action`** : Actions du robot (commandes articulaires, positions delta, etc.)
- **`observation.images.*`** : Images de cameras (stockees en video)
- **`language_instruction`** ou **`task`** : Texte de description de la tache

### Exemple de conversion

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# Definir les features de votre dataset
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # par ex., 6 articulations + 1 pince
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # hauteur, largeur, canaux
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# Creer le dataset
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# Ajouter des frames depuis vos donnees
# On suppose que vos donnees brutes sont organisees par episode (une demonstration complete),
# chacun contenant plusieurs frames.
# par ex. : episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # `task` est un champ requis utilise en interne par LeRobot pour regrouper
            # les episodes par tache ; son contenu est generalement le meme que language_instruction
            "task": frame["instruction"],
        })
    dataset.save_episode()

# Finaliser le dataset
dataset.finalize()
```

:::tip
Pour des instructions detaillees de conversion LeRobot, consultez la [documentation LeRobot](https://github.com/huggingface/lerobot).
:::

### Structure du repertoire du dataset

Apres la conversion, votre dataset devrait avoir cette structure :

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

### Fichier JSON de modalite

Creez un fichier `modality.json` dans votre repertoire d'entrainement pour definir le mapping entre les cles LeRobot et les cles StarVLA. Considerez-le comme une « table de traduction » -- il traduit les noms de colonnes bruts de votre dataset en noms internes unifies de StarVLA, de sorte que differents datasets puissent etre traites par le meme code simplement en fournissant leur propre `modality.json` :

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

StarVLA fournit des fichiers `modality.json` pour tous les benchmarks integres. Vous pouvez les trouver dans le repertoire d'exemples de chaque benchmark (par exemple, `examples/LIBERO/train_files/modality.json`, `examples/SimplerEnv/train_files/modality.json`).

## Etape 2 : Creer la configuration du type de robot

La configuration du type de robot definit comment StarVLA lit et traite vos donnees. Creez une nouvelle classe de configuration dans `starVLA/dataloader/gr00t_lerobot/data_config.py`.

### Structure de la configuration

```python
class MyRobotDataConfig:
    # Definir les cles pour chaque modalite
    video_keys = [
        "video.camera_1",      # Correspond a observation.images.camera_1
        "video.camera_2",      # Correspond a observation.images.camera_2
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

    # Configuration des indices
    observation_indices = [0]        # Quels pas de temps utiliser pour l'observation
    action_indices = list(range(8))  # Horizon d'action (predire 8 pas futurs)

    def modality_config(self):
        """Definir les configurations de modalite pour le chargement des donnees."""
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
        """Definir les transformations de donnees."""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # Transformations d'etat
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # Transformations d'action
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

Notez la relation de mapping implementee par Modality dans le DataConfig. Par exemple, si un dataset contient l'etat et l'action avec tous les degres de liberte incluant bras, pince, corps et roues, Modality peut extraire la signification de chaque plage d'indices (via les cles `start` et `end`), puis les reassembler et les organiser dans le DataConfig.

**Exemple concret** : Supposons que votre robot a un bras a 7 DDL + 1 pince, et que l'etat brut est un vecteur a 8 dimensions `[j0, j1, j2, j3, j4, j5, j6, gripper]`. Dans `modality.json`, vous le decomposez en : `"arm_joint": {"start": 0, "end": 7}` pour les 7 premieres dimensions (angles articulaires) et `"gripper_joint": {"start": 7, "end": 8}` pour la 8e dimension (etat de la pince). Cela permet a StarVLA de savoir quelles dimensions sont des articulations de bras et lesquelles sont la pince, permettant des strategies de normalisation differentes pour chacune.

### Enregistrer la configuration

Ajoutez votre configuration au `ROBOT_TYPE_CONFIG_MAP` en bas de `data_config.py` :

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... configurations existantes ...
    "my_robot": MyRobotDataConfig(),
}
```

### Modes de normalisation

Modes de normalisation disponibles pour `StateActionTransform` :

| Mode | Description |
|------|-------------|
| `min_max` | Normaliser dans [-1, 1] en utilisant les statistiques min/max |
| `q99` | Normaliser en utilisant les 1er et 99e percentiles (robuste aux valeurs aberrantes) |
| `binary` | Mapper sur {-1, 1} pour les actions binaires (par ex., ouverture/fermeture de pince) |
| `rotation_6d` | Convertir la rotation en representation 6D |
| `axis_angle` | Convertir la rotation en representation axe-angle |

:::tip
Dans une configuration StarVLA courante, nous utilisons la position articulaire absolue (Joint Position) comme representation pour l'etat ou l'action. Dans ce cas, il est generalement recommande d'utiliser `min_max` pour le bras et `binary` pour la pince.
:::

## Etape 3 : Creer un Data Mix

Enregistrez votre dataset dans `starVLA/dataloader/gr00t_lerobot/mixtures.py` :

```python
DATASET_NAMED_MIXTURES = {
    # ... mixtures existantes ...

    # Dataset unique
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (nom_du_dossier_dataset, poids_d_echantillonnage, config_type_robot)
    ],

    # Plusieurs datasets avec des poids differents
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # Demi poids d'echantillonnage
        ("my_dataset_task3", 2.0, "my_robot"),  # Double poids d'echantillonnage
    ],
}
```

### Structure du repertoire de donnees

Vos donnees doivent etre organisees comme suit :

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

## Etape 4 : Creer la configuration d'entrainement

Creez un fichier de configuration YAML (par exemple, `examples/MyRobot/train_files/starvla_my_robot.yaml`) :

```yaml
# ===== Configuration de l'execution =====
run_id: my_robot_training           # Nom de l'experience ; les checkpoints sont sauvegardes sous run_root_dir/run_id/
run_root_dir: results/Checkpoints   # Repertoire racine pour la sortie des checkpoints
seed: 42
trackers: [jsonl, wandb]            # Journalisation : jsonl (local) + wandb (en ligne)
wandb_entity: your_wandb_entity     # Votre nom d'utilisateur ou equipe wandb
wandb_project: my_robot_project
is_debug: false                     # Mettre a true pour utiliser des donnees minimales pour un debugging rapide

# ===== Configuration du framework de modele =====
framework:
  name: QwenOFT                     # Choisir : QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # Chemin du modele VLM de base
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # Dimension cachee du VLM (2048 pour Qwen3-VL-4B)
  dino:
    dino_backbone: dinov2_vits14    # Encodeur de vision optionnel pour les features spatiales

  action_model:
    action_model_type: DiT-B        # Type de modele d'action (DiT-B uniquement pour les frameworks GR00T/PI)
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # Dimension d'action = nombre d'articulations de votre robot (par ex., 7 articulations x 2 bras = 14)
    state_dim: 14                   # Dimension d'etat, generalement identique a action_dim
    future_action_window_size: 15   # Combien de pas futurs le modele predit (longueur du chunk d'action - 1)
    action_horizon: 16              # Longueur totale de la sequence d'action = futur + 1 (pas courant)
    past_action_window_size: 0      # Fenetre d'actions historiques (0 = pas d'historique)
    repeated_diffusion_steps: 8     # Repetitions d'echantillonnage de diffusion pendant l'entrainement (GR00T/PI uniquement)
    num_inference_timesteps: 4      # Etapes de diffusion a l'inference (moins = plus rapide, moins precis)
    num_target_vision_tokens: 32    # Nombre de tokens de vision compresses du VLM
    # Parametres internes du Transformer DiT (generalement pas besoin de modifier) :
    diffusion_model_cfg:
      cross_attention_dim: 2048     # Doit correspondre au hidden_dim du VLM
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== Configuration des datasets =====
datasets:
  # Donnees VLM (optionnel, uniquement necessaire pour le co-entrainement)
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # Nom du dataset enregistre dans qwen_data_config.py
    per_device_batch_size: 4

  # Donnees VLA (donnees de manipulation robotique, requis)
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # Repertoire racine du dataset
    data_mix: my_dataset            # Nom de la mixture enregistre dans mixtures.py
    action_type: abs_qpos           # Type d'action : abs_qpos = position articulaire absolue (valeurs d'angle cible)
    default_image_resolution: [3, 224, 224]  # [canaux, hauteur, largeur]
    per_device_batch_size: 16
    load_all_data_for_training: true # Charger toutes les donnees d'entrainement en memoire au demarrage (entrainement plus rapide, mais utilise plus de RAM)
    obs: ["image_0"]                # Quelles cameras utiliser (image_0 = premiere camera de la liste video_keys du DataConfig)
    image_size: [224,224]
    video_backend: torchvision_av   # Backend de decodage video (torchvision_av ou decord)

# ===== Configuration du Trainer =====
trainer:
  epochs: 100
  max_train_steps: 100000           # Nombre maximal d'etapes d'entrainement (s'arrete ici independamment des epoques)
  num_warmup_steps: 5000            # Etapes de warmup du taux d'apprentissage
  save_interval: 5000               # Sauvegarder un checkpoint toutes les N etapes
  eval_interval: 100                # Evaluer sur l'ensemble de validation toutes les N etapes

  # Taux d'apprentissage par module : differents composants peuvent utiliser des taux differents
  learning_rate:
    base: 1e-05                     # LR par defaut (utilise pour les modules non specifies ci-dessous)
    qwen_vl_interface: 1.0e-05      # LR du backbone VLM
    action_model: 1.0e-04           # LR de la tete d'action (plus eleve car entraine depuis zero)

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # LR minimum pour la decroissance cosinus

  freeze_modules: ''                # Chemins de modules a geler (vide = tout entrainable)
  loss_scale:
    vla: 1.0                        # Poids de la loss VLA
    vlm: 0.1                        # Poids de la loss VLM (pour le co-entrainement)
  repeated_diffusion_steps: 4       # Repetitions d'echantillonnage de diffusion a l'entrainement (surcharge la valeur de action_model)
  max_grad_norm: 1.0                # Seuil de clipping du gradient
  gradient_accumulation_steps: 1    # Augmenter si la memoire GPU est insuffisante

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[A propos de action_dim et state_dim]
Ces valeurs dependent de votre materiel robotique. Exemples :
- Bras simple avec 7 articulations + 1 pince -> `action_dim: 8`, `state_dim: 8`
- Double bras avec 7 articulations chacun -> `action_dim: 14`, `state_dim: 14`
- Humanoide BEHAVIOR R1Pro -> `action_dim: 23`, `state_dim: 23`

Doit correspondre a la dimension totale des cles action/state definies dans votre DataConfig.
:::

| Framework | Tete d'action | Recommande pour |
|-----------|--------------|-----------------|
| `QwenOFT` | MLP | Inference rapide, taches simples |
| `QwenGR00T` | Flow-matching DiT | Manipulation complexe, haute precision |
| `QwenFast` | Tokens discrets | Prediction d'actions basee sur les tokens |
| `QwenPI` | Diffusion | Distributions d'actions multimodales |

Vous pouvez egalement choisir des modeles soutenus par la communaute, qui partagent le BaseFramework et peuvent etre adaptes simplement en modifiant la configuration.

## Etape 5 : Lancer l'entrainement

Creez un script d'entrainement (par exemple, `examples/MyRobot/train_files/run_train.sh`) :

```bash
#!/bin/bash

# ========== Parametre requis ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # Fichier de configuration d'entrainement (requis)

# ========== Surcharges optionnelles (le CLI a priorite sur les valeurs YAML) ==========
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# Creer le repertoire de sortie
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# Lancer l'entrainement
# --config_yaml est le seul argument requis ; tous les autres flags --xxx sont des surcharges CLI optionnelles.
# Si vous avez deja tout configure dans votre fichier YAML, vous pouvez omettre les flags de surcharge ci-dessous.
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

### Entrainement multi-noeud

Pour l'entrainement distribue multi-noeud :

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
  # ... autres arguments
```
