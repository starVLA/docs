---
title: Model Zoo
description: Modeles modifies publies, checkpoints de fine-tuning et datasets.
---

## Modeles modifies disponibles

| Modele | Description | Lien |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Extension du vocabulaire de Qwen2.5-VL avec des fast tokens (extension speciale du vocabulaire pour discretiser les actions continues en tokens) | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Extension du vocabulaire de Qwen3-VL avec des fast tokens (idem) | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | Poids du tokenizer d'actions pi-fast | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## Checkpoints de fine-tuning

### SimplerEnv / Bridge

Bridge est un dataset de manipulation sur table WidowX ; Fractal est le dataset de manipulation robotique RT-1 de Google.

| Modele | Framework | VLM de base | Description | WidowX | Lien |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | Bridge uniquement | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal (petit modele) | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**Colonne WidowX** : Taux de reussite (%) sur les taches du robot WidowX dans [SimplerEnv](/docs/fr/benchmarks/simplerenv/). Plus eleve = mieux.

### LIBERO

LIBERO comporte 4 suites de taches (Spatial, Object, Goal, Long Horizon) avec 40 taches au total. Tous les checkpoints sont entraines conjointement sur les 4 suites. Voir la [documentation d'evaluation LIBERO](/docs/fr/benchmarks/libero/).

| Modele | Framework | VLM de base | Lien |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

Taches RoboCasa GR1 Tabletop avec 24 taches de Pick-and-Place. Voir la [documentation d'evaluation RoboCasa](/docs/fr/benchmarks/robocasa/).

| Modele | Framework | VLM de base | Lien |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

Benchmark de manipulation bi-bras RoboTwin 2.0 avec 50 taches. Voir la [documentation d'evaluation RoboTwin](/docs/fr/benchmarks/robotwin/).

| Modele | Framework | VLM de base | Lien |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

Benchmark de taches menageres BEHAVIOR-1K utilisant le robot humanoide R1Pro. Voir la [documentation d'evaluation BEHAVIOR](/docs/fr/benchmarks/behavior/).

| Modele | Description | Lien |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | Entraine conjointement sur les 50 taches | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | Entrainement sur une seule tache | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | Entrainement conjoint sur 6 taches | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | Experience avec observation par segmentation | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## Datasets

### Datasets d'entrainement

| Dataset | Description | Lien |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | Dataset image-texte pour le co-entrainement VLM (sous-ensemble ShareGPT4V-COCO) | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | Demonstrations propres RoboTwin 2.0 (50 par tache) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | Demonstrations randomisees RoboTwin 2.0 (500 par tache) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | Idem, format tar.gz compresse (pour telechargement en masse) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### Donnees BEHAVIOR

| Dataset | Description | Lien |
| --- | --- | --- |
| **BEHAVIOR-1K** | Configurations de simulation du benchmark BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | Datasets d'entrainement BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | Assets de scenes et objets BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | Demos de visualisation BEHAVIOR-1K | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | Echantillon de donnees d'entrainement pour une seule tache | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
En plus des datasets propres a StarVLA ci-dessus, les datasets tiers couramment utilises pour l'entrainement incluent :
- **SimplerEnv/OXE** : [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot), [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO** : [Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot), [Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot), [Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot), [10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa** : [PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## Comment utiliser un checkpoint

Telechargez un checkpoint et lancez le serveur de politique :

```bash
# Telechargement (necessite huggingface_hub)
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# Demarrer le serveur de politique
python deployment/model_server/server_policy.py \
    # steps_XXXXX est le nombre d'etapes d'entrainement -- remplacez par le nom de fichier reel de votre telechargement
    # par ex. steps_50000_pytorch_model.pt ; executez `ls` pour voir le nom exact du fichier
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

Suivez ensuite le guide d'evaluation pour le benchmark que vous souhaitez tester (par exemple [SimplerEnv](/docs/fr/benchmarks/simplerenv/), [LIBERO](/docs/fr/benchmarks/libero/), [RoboCasa](/docs/fr/benchmarks/robocasa/), [RoboTwin](/docs/fr/benchmarks/robotwin/), [BEHAVIOR](/docs/fr/benchmarks/behavior/)).
