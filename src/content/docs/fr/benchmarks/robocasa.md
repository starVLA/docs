---
title: Evaluation RoboCasa
description: Reproduire les resultats experimentaux de StarVLA sur les taches RoboCasa GR1 Tabletop.
---

**RoboCasa** est un benchmark de simulation menagere a grande echelle. Nous utilisons ici le sous-ensemble [GR1 Tabletop Tasks](https://github.com/robocasa/robocasa-gr1-tabletop-tasks), comprenant 24 taches de Pick-and-Place sur table realisees par un robot humanoide Fourier GR1 (haut du corps, bras doubles).

Ce document fournit les instructions pour reproduire nos **resultats experimentaux**.

Le processus d'evaluation se compose de deux parties principales :

1. Configuration de l'environnement `robocasa` et de ses dependances.
2. Execution de l'evaluation en lancant les services dans les environnements `starVLA` et `robocasa`.

:::note[Pourquoi deux terminaux ?]
L'inference du modele (environnement starVLA) et la simulation (environnement robocasa) dependent de versions differentes de packages Python qui entreraient en conflit si installees dans le meme environnement conda. Les executer dans des terminaux separes avec des environnements conda distincts evite ce probleme.
:::

Nous avons verifie que ce workflow fonctionne correctement sur les GPU **NVIDIA A100**.

---

## Resultats experimentaux

| Tache | GR00T-N1.6 | Qwen3GR00T | Qwen3PI | Qwen3OFT | Qwen3FAST |
|-------|------------|------------|---------|----------|-----------|
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
| **Moyenne** | **47.6** | **47.8** | **43.9** | **48.8** | **39.0** |

*Note : Toutes les valeurs sont des taux de reussite en pourcentage (%). Un seul modele a ete entraine pour les 24 taches. Les resultats sont rapportes sur 50 episodes par tache.*

---

## Evaluation RoboCasa

### 0. Telecharger les checkpoints

Tout d'abord, telechargez les checkpoints depuis :
- [Qwen3VL-GR00T](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1)
- [Qwen3VL-OFT](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa)

### 1. Configuration de l'environnement

Pour configurer l'environnement, veuillez d'abord suivre le [guide d'installation officiel RoboCasa](https://github.com/robocasa/robocasa-gr1-tabletop-tasks?tab=readme-ov-file#getting-started) pour installer l'environnement de base `robocasa-gr1-tabletop-tasks`.

Puis installez le support socket :

```bash
pip install tyro
```

---

### 2. Workflow d'evaluation

#### Etape 1. Demarrer le serveur (environnement starVLA)

Dans le premier terminal, activez l'environnement conda `starVLA` et executez :

```bash
python deployment/model_server/server_policy.py \
        --ckpt_path ${your_ckpt} \
        --port 5678 \
        --use_bf16
```

---

#### Etape 2. Demarrer la simulation (environnement robocasa)

Dans le second terminal, activez l'environnement conda `robocasa` et executez :

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

#### Evaluation par lots (optionnel)

Si vous disposez de plus de GPU, vous pouvez utiliser le script d'evaluation par lots :

```bash
bash examples/Robocasa_tabletop/batch_eval_args.sh
```

**Note :** Veuillez vous assurer de specifier le bon chemin de checkpoint dans `batch_eval_args.sh`

---

## Reproduire les resultats d'entrainement

### Etape 0 : Telecharger le dataset d'entrainement

Telechargez les datasets du repertoire PhysicalAI-Robotics-GR00T-X-Embodiment-Sim depuis [HuggingFace](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim) vers le repertoire `playground/Datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim`.

Pour telecharger uniquement les dossiers de fine-tuning pertinents, vous pouvez consulter les instructions du depot [GR00T-N1.5](https://github.com/NVIDIA/Isaac-GR00T/tree/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/examples/RoboCasa#-1-dataset-preparation).

Ou utilisez le script pour telecharger les dossiers `*_1000` :

```bash
python examples/Robocasa_tabletop/download_gr00t_ft_data.py
```

### Etape 1 : Lancer l'entrainement

Differents datasets peuvent etre selectionnes en modifiant le parametre `data_mix`, et le script suivant peut etre utilise pour fine-tuner les datasets `*_1000` :

```bash
bash examples/Robocasa_tabletop/train_files/run_robocasa.sh
```
