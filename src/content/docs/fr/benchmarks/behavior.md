---
title: Evaluation BEHAVIOR-1K
description: Executer le framework StarVLA avec le benchmark BEHAVIOR-1K.
---

:::caution[En cours de construction]
Ce document est en cours de developpement actif.
:::

**BEHAVIOR-1K** est un benchmark de simulation de taches menageres par Stanford, comprenant 1000 activites quotidiennes (cuisine, menage, rangement, etc.). Nous suivons la structure du [2025 BEHAVIOR Challenge](https://behavior.stanford.edu/challenge/index.html) pour entrainer et evaluer sur 50 taches menageres completes. Il utilise le robot humanoide R1Pro (bras doubles + base + torse, espace d'action a 23 dimensions).

Le processus d'evaluation se compose de deux parties principales :

1. Configuration de l'environnement `behavior` et de ses dependances.
2. Execution de l'evaluation en lancant les services dans les environnements `starVLA` et `behavior`.

:::note[Pourquoi deux terminaux ?]
L'inference du modele (environnement starVLA) et la simulation (environnement behavior) dependent de versions differentes de packages Python qui entreraient en conflit si installees dans le meme environnement conda. Les executer dans des terminaux separes avec des environnements conda distincts evite ce probleme.
:::

:::note[Pre-requis GPU]
Le simulateur de BEHAVIOR (OmniGibson) necessite le **ray tracing materiel (RT Cores)** pour le rendu. Les GPU suivants **ne peuvent pas etre utilises** : A100, H100 (ils ne disposent pas de RT Cores).

**Recommande** : RTX 3090, RTX 4090 ou autres GPU des series GeForce RTX / Quadro RTX.

Voir [cette issue](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1872#issuecomment-3455002820) et [cette discussion](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1875#issuecomment-3444246495) pour plus de details.
:::

---

## Evaluation BEHAVIOR

### 1. Configuration de l'environnement

Pour configurer l'environnement conda pour `behavior` :

```bash
git clone https://github.com/StanfordVL/BEHAVIOR-1K.git
conda create -n behavior python=3.10 -y
conda activate behavior
cd BEHAVIOR-1K
pip install "setuptools<=79"
# --omnigibson : Installer le simulateur OmniGibson (moteur physique de BEHAVIOR)
# --bddl : Installer BDDL (Behavior Domain Definition Language pour les definitions de taches)
# --joylo : Installer JoyLo (interface de controle par teleoperation)
# --dataset : Telecharger les assets du dataset BEHAVIOR (scenes, modeles d'objets, etc.)
./setup.sh --omnigibson --bddl --joylo --dataset
conda install -c conda-forge libglu
pip install rich omegaconf hydra-core msgpack websockets av pandas google-auth
```

Egalement dans l'environnement starVLA :

```bash
pip install websockets
```

---

### 2. Workflow d'evaluation

Etapes :
1. Telecharger le checkpoint
2. Choisissez le script ci-dessous selon vos besoins

#### (A) Script d'evaluation parallele

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval.sh
```

Avant d'executer `start_parallel_eval.sh`, definissez les chemins suivants :
- `star_vla_python` : Interpreteur Python pour l'environnement StarVLA
- `sim_python` : Interpreteur Python pour l'environnement Behavior
- `TASKS_JSONL_PATH` : Fichier de description des taches telecharge depuis le [dataset d'entrainement](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos) (inclus dans `examples/Behavior/tasks.jsonl`)
- `BEHAVIOR_ASSET_PATH` : Chemin local vers les assets behavior (par defaut dans `BEHAVIOR-1K/datasets` apres l'installation avec `./setup.sh`)

#### (B) Debugging avec des terminaux separes

Pour faciliter le debugging, vous pouvez egalement demarrer le client (environnement d'evaluation) et le serveur (politique) dans deux terminaux separes :

```bash
bash examples/Behavior/start_server.sh
bash examples/Behavior/start_client.sh
```

Les fichiers de debugging ci-dessus effectueront l'evaluation sur l'ensemble d'entrainement.

#### (C) Evaluation par tache (securisee en memoire)

Pour prevenir le debordement de memoire, nous avons implemente un autre fichier `start_parallel_eval_per_task.sh` :

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval_per_task.sh
```

- Le script executera l'evaluation pour chaque tache dans `INSTANCE_NAMES` de maniere iterative
- Pour chaque tache, il allouera toutes les instances de `TEST_EVAL_INSTANCE_IDS` sur les GPU
- Il attendra que la tache precedente soit terminee avant de passer a la suivante

---

## Notes

### Types de Wrapper

1. **RGBLowResWrapper** : Utilise uniquement le RGB comme observation visuelle avec des resolutions de camera de 224x224. N'utiliser que le RGB basse resolution peut aider a accelerer le simulateur et reduire le temps d'evaluation. Ce wrapper peut etre utilise dans la categorie standard.

2. **DefaultWrapper** : Wrapper avec la configuration d'observation par defaut utilisee pendant la collecte de donnees (RGB + profondeur + segmentation, 720p pour la camera de tete et 480p pour la camera de poignet). Ce wrapper peut etre utilise dans la categorie standard, mais l'evaluation sera considerablement plus lente par rapport a RGBLowResWrapper.

3. **RichObservationWrapper** : Charge des modalites d'observation supplementaires, telles que les normales et le flux optique, ainsi que des informations privilegiees sur la tache. Ce wrapper ne peut etre utilise que dans la categorie avec informations privilegiees.

### Dimensions d'action

BEHAVIOR a action dim = 23 :

```python
"R1Pro": {
    "base": np.s_[0:3],           # Indices 0-2
    "torso": np.s_[3:7],          # Indices 3-6
    "left_arm": np.s_[7:14],      # Indices 7-13
    "left_gripper": np.s_[14:15], # Index 14
    "right_arm": np.s_[15:22],    # Indices 15-21
    "right_gripper": np.s_[22:23] # Index 22
}
```

### Sauvegarde video

La video sera sauvegardee au format `{task_name}_{idx}_{epi}.mp4`, ou `idx` est le numero d'instance et `epi` le numero d'episode.

### Problemes courants

**Segmentation fault (core dumped) :** Une cause probable est que Vulkan n'est pas correctement installe. Consultez [ce lien](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan).

**ImportError: libGL.so.1: cannot open shared object file:**
```bash
apt-get install ffmpeg libsm6 libxext6 -y
```
