---
title: Co-entrainement avec des donnees VLM
description: Integrer des donnees VLM (Vision-Language Model) pour co-entrainer le framework StarVLA.
---

Ce guide decrit le processus d'integration de donnees VLM (Vision-Language Model) pour co-entrainer le framework StarVLA (Vision-Language-Action).

**Pourquoi le co-entrainement ?** Entrainer un VLA uniquement sur des donnees de manipulation robotique peut degrader la comprehension visuelle et linguistique du backbone VLM -- c'est ce qu'on appelle l'« oubli catastrophique » : apres un entrainement exclusif sur des donnees robotiques, le modele peut oublier comment interpreter des images, repondre a des questions ou comprendre des instructions complexes. Melanger des donnees VLM (QA sur images, legendes, etc.) preserve la comprehension generale du modele tout en apprenant le controle robotique.

---

## 1. Preparation des donnees multimodales

Les donnees VLM doivent respecter la [structure de donnees JSON de conversations QwenVL](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune).

### Format requis

Chaque instance de donnees est un objet JSON qui lie un **chemin de fichier image** a une liste de **tours de conversation humain-GPT**.

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
            // <image> est un placeholder qui indique au modele « inserer l'image ici » ;
            // le chemin reel de l'image est specifie dans le champ "image" externe
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### Demarrage rapide

Vous pouvez telecharger notre dataset d'exemple [LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO).

Decomposez `sharegpt4v_coco.zip` et placez-le dans `playground/Datasets/LLaVA-OneVision-COCO`.

La structure de fichiers resultante ressemblera a ceci :

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. Configuration du dataset VLM

Pour ajouter un dataset VLM personnalise, suivez ces etapes :

### 2.1 Enregistrer le dataset (Python)

Enregistrez votre dataset en l'ajoutant au `data_dict` dans `starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py` :

```python
# Exemple d'enregistrement
# json_root et image_root sont definis en haut de ce fichier,
# pointant par defaut vers des sous-repertoires de playground/Datasets/LLaVA-OneVision-COCO/ :
#   json_root = "playground/Datasets/LLaVA-OneVision-COCO/llava_jsons"
#   image_root = "playground/Datasets/LLaVA-OneVision-COCO/images"

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # Utilisez ce nom dans la configuration YAML
}
```

### 2.2 Mettre a jour le YAML d'entrainement

Incluez la configuration du dataset VLM dans votre fichier YAML d'entrainement (`your_train_config.yaml`) :

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # Doit correspondre au nom enregistre en 2.1
```

**Astuce :** Vous pouvez verifier le dataloader VLM en executant :

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. Execution de l'entrainement

Choisissez le script approprie selon que vous souhaitez entrainer *uniquement* sur des donnees VLM ou *co-entrainer* avec des donnees VLA.

:::tip[Comment choisir ?]
- **Si vous souhaitez uniquement fine-tuner le VLM** (par exemple, fine-tuner sur des donnees image-texte specifiques a un domaine sans actions robotiques), choisissez l'**Option A**.
- **Si vous avez des donnees robotiques et souhaitez les entrainer ensemble** (pour prevenir l'oubli catastrophique tout en apprenant a la fois le controle robotique et la comprehension visuelle-linguistique), choisissez l'**Option B**.
:::

### Option A : Entrainer avec des donnees VLM uniquement

Utilisez ceci pour le pre-entrainement ou le fine-tuning specifique au VLM.

**Script :** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### Option B : Co-entrainer VLA avec des donnees VLM

Ceci entraine simultanement le modele sur des donnees robotiques (VLA) et multimodales (VLM).

**Script :** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
