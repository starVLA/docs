---
title: Evaluation SimplerEnv
description: Reproduire les resultats experimentaux de StarVLA sur SimplerEnv (configuration, workflow d'evaluation et notes d'entrainement).
---

**SimplerEnv** est un environnement de simulation base sur ManiSkill utilisant le bras robotique WidowX pour des taches de manipulation sur table (saisie, placement, operations de tiroir, etc.). Il est largement utilise pour evaluer les modeles VLA entraines sur le dataset Open X-Embodiment (OXE).

Ce document fournit les instructions pour reproduire nos **resultats experimentaux** avec SimplerEnv.

Le processus d'evaluation se compose de deux parties principales :

1. Configuration de l'environnement `simpler_env` et de ses dependances.
2. Execution de l'evaluation en lancant les services dans les environnements `starVLA` et `simpler_env`.

Nous avons verifie que ce workflow fonctionne correctement sur les GPU **NVIDIA A100** et **RTX 4090**.

---

## Evaluation SimplerEnv

### 1. Configuration de l'environnement

Pour configurer l'environnement, veuillez d'abord suivre le [depot officiel SimplerEnv](https://github.com/simpler-env/SimplerEnv) pour installer l'environnement de base `simpler_env`.

Ensuite, dans l'environnement `simpler_env`, installez les dependances suivantes :

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Retrograder numpy pour la compatibilite avec l'environnement de simulation
```

**Problemes courants :**
Lors du test de SimplerEnv sur NVIDIA A100, vous pouvez rencontrer l'erreur suivante :
`libvulkan.so.1: cannot open shared object file: No such file or directory`
Vous pouvez consulter ce lien pour corriger le probleme : [Guide d'installation -- Section Vulkan](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### Verification

Nous fournissons un script minimal de verification de l'environnement :

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

Si vous voyez le message "Env built successfully", cela signifie que SimplerEnv est correctement installe et pret a l'utilisation.

---

### 2. Workflow d'evaluation

Executez l'evaluation **depuis la racine du depot starVLA** en utilisant **deux terminaux separes**, un pour chaque environnement.

:::note[Pourquoi deux terminaux ?]
L'inference du modele (environnement starVLA) et la simulation (environnement simpler_env) dependent de versions differentes de packages Python qui entreraient en conflit si installees dans le meme environnement conda. Les executer dans des terminaux separes avec des environnements conda distincts evite ce probleme.
:::

- **Environnement starVLA** : execute le serveur d'inference de politique.
- **Environnement simpler_env** : execute le code d'evaluation de la simulation.

#### Etape 0. Telecharger le checkpoint

Telechargez le checkpoint : [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Etape 1. Demarrer le serveur (environnement starVLA)

Dans le premier terminal, activez l'environnement conda `starVLA` et executez :

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**Note :** Ouvrez `examples/SimplerEnv/eval_files/run_policy_server.sh`, trouvez la variable `your_ckpt` et definissez-la sur le chemin reel de votre checkpoint, par exemple `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`.

---

#### Etape 2. Demarrer la simulation (environnement simpler_env)

Dans le second terminal, activez l'environnement conda `simpler_env` et executez :

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

Ce script lancera automatiquement les taches d'evaluation du robot WidowX, reproduisant les resultats de benchmark rapportes ci-dessus.

**Note :** Ouvrez `examples/SimplerEnv/start_simpler_env.sh`, trouvez la variable `SimplerEnv_PATH` et definissez-la sur le chemin de votre clone du depot SimplerEnv (par exemple `/path/to/SimplerEnv`).

**Problemes courants :**
Si vous rencontrez `NotImplementedError: Framework QwenGR00T is not implemented` lors de l'execution du serveur de politique, cela signifie generalement que le Framework n'a pas ete correctement enregistre dans le chemin d'import Python. Executez d'abord le test de fonctionnement pour declencher l'enregistrement correct :
```bash
python starVLA/model/framework/QwenGR00T.py
```
Si le test reussit, redemarrez le serveur de politique.

---

## Entrainement sur OXE

### Preparation des donnees

Etapes :
1. Telechargez un dataset OXE au format LeRobot :
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. Incluez `modality.json` dans chaque `*lerobot/meta/modality.json` :
   - [modality bridge](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - Renommez en `modality.json` et placez-le dans `bridge_orig_lerobot/meta/modality.json`
   - [modality fractal](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - Renommez en `modality.json` et placez-le dans `fractal20220817_data_lerobot/meta/modality.json`

3. Ajoutez le chemin de votre dataset a `config.yaml` :
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### Verifier votre dataloader

Nous fournissons un moyen simple de verifier votre dataloader. Assurez-vous de pouvoir charger des donnees par batch :

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Preparation du framework

Avant l'execution, vous devez vous assurer que votre framework peut effectuer `forward` et `predict_action` en utilisant un exemple de donnees fictives.

Essayez la commande suivante :

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Lancer l'entrainement

Une fois tout pret, utilisez notre script fourni pour lancer l'entrainement :

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**Note :** Assurez-vous que le script utilise explicitement le chemin de configuration valide. S'il n'est pas deja passe, ajoutez l'argument `--config_yaml`.
