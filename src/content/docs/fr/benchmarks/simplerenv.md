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

## Experimental Results

### WidowX Robot (Visual Matching)

| Method | Steps | Put Spoon on Towel | Put Carrot on Plate | Stack Green Block on Yellow Block | Put Eggplant in Yellow Basket | Average |
|--------|-------|--------------------|--------------------|---------------------------------|------------------------------|---------|
| RT-1-X | - | 0.0 | 4.2 | 0.0 | 0.0 | 1.1 |
| Octo-Base | - | 15.8 | 12.5 | 0.0 | 41.7 | 17.5 |
| Octo-Small | - | 41.7 | 8.2 | 0.0 | 56.7 | 26.7 |
| OpenVLA | - | 4.2 | 0.0 | 0.0 | 12.5 | 4.2 |
| CogACT | - | 71.7 | 50.8 | 15.0 | 67.5 | 51.3 |
| SpatialVLA | - | 16.7 | 25.0 | 29.2 | **100.0** | 42.7 |
| π₀ | - | 29.1 | 0.0 | 16.6 | 62.5 | 27.1 |
| π₀-FAST | - | 29.1 | 21.9 | 10.8 | 66.6 | 48.3 |
| GR00T N1.5 | - | 75.3 | 54.3 | **57.0** | 61.3 | 61.9 |
| Magma | - | 37.5 | 31.0 | 12.7 | 60.5 | 35.8 |
| **StarVLA-FAST (Qwen3-VL)** | 15K | 18.8 | 31.3 | 4.2 | 71.9 | 31.6 |
| **StarVLA-OFT (Qwen3-VL)** | 65K | **90.3** | 38.5 | 29.7 | **100.0** | 64.6 |
| **StarVLA-π (Qwen3-VL)** | 40K | 78.1 | 46.9 | 30.2 | 88.5 | 60.9 |
| **StarVLA-GR00T (Qwen3-VL)** | 20K | 83.0 | 59.4 | 18.8 | **100.0** | 65.3 |
| **StarVLA-OFT (Cosmos-Predict2-2B)** | 30K | 66.8 | 62.6 | 25.3 | 90.2 | 61.2 |
| **StarVLA-π (Cosmos-Predict2-2B)** | 30K | 81.4 | 55.2 | 25.1 | 73.0 | 58.7 |
| **StarVLA-GR00T (Cosmos-Predict2-2B)** | 30K | 80.4 | **65.4** | 20.0 | 80.6 | 61.6 |

### Google Robot (Visual Matching)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 85.7 | 44.2 | **73.0** | 6.5 | 52.4 |
| RT-1-X | 56.7 | 31.7 | 59.7 | 21.3 | 42.4 |
| RT-2-X | 78.7 | 77.9 | 25.0 | 3.7 | 46.3 |
| OpenVLA | 18.0 | 56.3 | 63.0 | 0.0 | 34.3 |
| CogACT | 91.3 | 85.0 | 71.8 | 50.9 | 74.8 |
| SpatialVLA | 86.0 | 77.9 | 57.4 | - | 75.1 |
| π₀ | 72.7 | 65.3 | 38.3 | - | 58.8 |
| π₀-FAST | 75.3 | 67.5 | 42.9 | - | 61.9 |
| GR00T N1.5* | 51.7 | 54.0 | 27.8 | 7.4 | 35.2 |
| Magma | 83.7 | 65.4 | 56.0 | 6.4 | 52.9 |
| **StarVLA-OFT** | **95.3** | 75.0 | 68.8 | **66.1** | **76.0** |

### Google Robot (Variant Aggregation)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 89.8 | 50.0 | 32.3 | 2.6 | 43.7 |
| RT-1-X | 49.0 | 32.3 | 29.4 | 10.1 | 30.2 |
| RT-2-X | 82.3 | 79.2 | 35.3 | 20.6 | 54.4 |
| OpenVLA | 60.8 | 67.7 | 28.8 | 0.0 | 39.3 |
| CogACT | 89.6 | 80.8 | 28.3 | 46.6 | 61.3 |
| SpatialVLA | 88.0 | **82.5** | 41.8 | - | 70.7 |
| π₀ | 75.2 | 63.7 | 25.6 | - | 54.8 |
| π₀-FAST | 77.6 | 68.2 | 31.3 | - | 59.0 |
| GR00T N1.5 | 69.3 | 68.7 | 35.8 | 4.0 | 44.5 |
| Magma | 68.8 | 65.7 | **53.4** | 18.5 | 51.6 |
| **StarVLA-OFT** | 91.3 | 75.1 | 55.0 | **59.4** | **70.2** |

*Note: All StarVLA Google Robot results use Qwen3-VL-4B as backbone. Numbers marked with \* denote our reimplementation.*

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
