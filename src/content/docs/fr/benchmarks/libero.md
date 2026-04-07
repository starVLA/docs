---
title: Evaluation LIBERO
description: Reproduire les resultats experimentaux de StarVLA sur LIBERO (configuration, workflow d'evaluation et notes d'entrainement).
---

**LIBERO** est un benchmark de manipulation robotique sur table avec 4 suites de taches (Spatial, Object, Goal, Long Horizon), totalisant 40 taches. Il evalue les modeles VLA sur la comprehension spatiale, la reconnaissance d'objets, le raisonnement sur les objectifs et la manipulation a long horizon en utilisant un bras robotique Franka.

Ce document fournit les instructions pour reproduire nos **resultats experimentaux** avec LIBERO.
Le processus d'evaluation se compose de deux parties principales :

1. Configuration de l'environnement `LIBERO` et de ses dependances.
2. Execution de l'evaluation en lancant les services dans les environnements `starVLA` et `LIBERO`.

Nous avons verifie que ce workflow fonctionne correctement sur les GPU **NVIDIA A100** et **RTX 4090**.

---

## Evaluation LIBERO

### 0. Telecharger les checkpoints

Nous fournissons une collection de checkpoints pre-entraines sur Hugging Face pour faciliter l'evaluation communautaire : [StarVLA/bench-libero](https://huggingface.co/collections/StarVLA/libero). Les resultats correspondants sur LIBERO sont resumes dans le tableau ci-dessous.

#### Resultats experimentaux

| Modele                | Etapes | Epoques | Spatial | Object | Goal | Long | Moy. |
|----------------------|--------|---------|---------|--------|------|------|------|
| $\pi_0$+FAST         | -     | -      | 96.4    | 96.8   | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT          | 175K  | 223    | 97.6    | 98.4   | 97.9 | 94.5 | 97.1 |
| $\pi_0$              | -     | -      | 96.8    | 98.8   | 95.8 | 85.2 | 94.1 |
| GR00T-N1.5           | 20K   | 203    | 92.0    | 92.0   | 86.0 | 76.0 | 86.5 |
| **Qwen2.5-VL-FAST**  | 30K   | 9.54   | 97.3    | 97.2   | 96.1 | 90.2 | 95.2 |
| **Qwen2.5-VL-OFT**   | 30K   | 9.54   | 97.4    | 98.0   | 96.8 | 92.0 | 96.1 |
| **Qwen2.5-VL-GR00T** | 30K   | 9.54   | 97.8    | 98.2   | 94.6 | 90.8 | 95.4 |
| **Qwen3-VL-FAST**    | 30K   | 9.54   | 97.3    | 97.4   | 96.3 | 90.6 | 95.4 |
| **Qwen3-VL-OFT**     | 30K   | 9.54   | 97.8    | 98.6   | 96.2 | 93.8 | 96.6 |
| **Qwen3-VL-GR00T**   | 30K   | 9.54   | 97.8    | 98.8   | 97.4 | 92.0 | 96.5 |

Nous entrainons une seule politique pour les 4 suites. Tous les scores sont moyennes sur 500 essais pour chaque suite de taches (10 taches x 50 episodes).

---

### 1. Configuration de l'environnement

Pour configurer l'environnement, veuillez d'abord suivre le [depot officiel LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO) pour installer l'environnement de base `LIBERO`.

**Probleme courant :** LIBERO utilise Python 3.8 par defaut, mais les changements de syntaxe entre 3.8 et 3.10 sont substantiels. **Nous avons verifie que l'utilisation de Python 3.10 evite de nombreux problemes**.

Ensuite, dans l'environnement `LIBERO`, installez les dependances suivantes :

```bash
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Retrograder numpy pour la compatibilite avec l'environnement de simulation
```

---

### 2. Workflow d'evaluation

Executez l'evaluation **depuis la racine du depot starVLA** en utilisant **deux terminaux separes**, un pour chaque environnement.

:::note[Pourquoi deux terminaux ?]
L'inference du modele (environnement starVLA) et la simulation (environnement LIBERO) dependent de versions differentes de packages Python qui entreraient en conflit si installees dans le meme environnement conda. Les executer dans des terminaux separes avec des environnements conda distincts evite ce probleme.
:::

- **Environnement starVLA** : execute le serveur d'inference.
- **Environnement LIBERO** : execute la simulation.

#### Etape 1. Demarrer le serveur (environnement starVLA)

Dans le premier terminal, activez l'environnement conda `starVLA` et executez :

```bash
bash examples/LIBERO/eval_files/run_policy_server.sh
```

**Note :** Veuillez vous assurer de specifier le bon chemin de checkpoint dans `examples/LIBERO/eval_files/run_policy_server.sh`

---

#### Etape 2. Demarrer la simulation (environnement LIBERO)

Dans le second terminal, activez l'environnement conda `LIBERO` et executez :

```bash
bash examples/LIBERO/eval_files/eval_libero.sh
```

**Note :** Assurez-vous de definir correctement les variables suivantes dans `eval_libero.sh` :

| Variable | Signification | Exemple |
|----------|--------------|---------|
| `LIBERO_HOME` | Chemin vers votre clone du depot LIBERO | `/path/to/LIBERO` |
| `LIBERO_Python` | Chemin Python de l'environnement conda LIBERO | `$(which python)` (dans l'env LIBERO) |
| `your_ckpt` | Chemin du checkpoint StarVLA | `./results/Checkpoints/.../steps_30000_pytorch_model.pt` |
| `unnorm_key` | Nom du type de robot pour charger les statistiques de denormalisation | `franka` (LIBERO utilise un bras Franka) |

`unnorm_key` est utilise pour charger les statistiques de normalisation (min/max, etc.) sauvegardees pendant l'entrainement, convertissant les sorties normalisees du modele en angles articulaires reels.

Enfin, chaque resultat sauvegardera egalement une video pour la visualisation, comme illustre ci-dessous :

![Exemple](../../../../assets/LIBERO_example.gif)

---

## Entrainement LIBERO

### Etape 0 : Telecharger le dataset d'entrainement

Telechargez les datasets dans le repertoire `playground/Datasets/LEROBOT_LIBERO_DATA` :

- [LIBERO-spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [LIBERO-object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [LIBERO-goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [LIBERO-10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

Et deplacez `modality.json` vers chaque `$LEROBOT_LIBERO_DATA/subset/meta/modality.json`.

Vous pouvez preparer rapidement ces donnees en executant :

```bash
# Definissez DEST sur le repertoire ou vous souhaitez stocker les donnees
export DEST=/path/to/your/data/directory
bash examples/LIBERO/data_preparation.sh
```

### Etape 1 : Lancer l'entrainement

La plupart des fichiers d'entrainement necessaires ont ete organises dans `examples/LIBERO/train_files/`.

Executez la commande suivante pour lancer l'entrainement :

```bash
bash examples/LIBERO/train_files/run_libero_train.sh
```

**Note :** Veuillez vous assurer de specifier le bon chemin dans `examples/LIBERO/train_files/run_libero_train.sh`
