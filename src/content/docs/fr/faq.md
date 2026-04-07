---
title: FAQ
description: Questions frequentes sur les choix de conception et le workflow d'entrainement de StarVLA.
---

### Pourquoi ne pas mettre le preprocessing dans le dataloader ?

Le preprocessing des donnees represente moins de 1% du temps dans le profiling. Le garder dans le Framework permet un traitement specifique au modele sans propager d'hypotheses dans le dataloader.

### Puis-je utiliser un backbone autre que Qwen2.5-VL ?

Oui. Implementez de nouveaux modules de vision et de langage et composez-les dans un Framework. Comme le Framework traite les donnees d'action brutes, le remplacement de backbones est simple.

### Pourquoi n'y a-t-il pas d'interface abstraite pour la tour de vision ?

Nous supposons que les VLM sont le modele de base et incluent leur propre tour de vision native, une interface abstraite supplementaire n'est donc pas necessaire.

### Puis-je surcharger ou ajouter des parametres via le terminal ?

Oui. StarVLA utilise `OmegaConf.load(args.config_yaml)` comme point d'entree unique de configuration. Vous pouvez surcharger les valeurs depuis la ligne de commande :

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module` ne fait qu'ajouter des cles a la configuration globale ; son comportement est defini par votre framework.

### Puis-je geler le VLM via les parametres ?

Oui. Utilisez une liste separee par des virgules de chemins de modules :

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

Astuce : executez `print(your_model)` pour verifier les chemins de modules. L'implementation se trouve dans `TrainerUtils.freeze_backbones`.

### Puis-je definir des taux d'apprentissage differents pour differents modules ?

Oui. Utilisez un dictionnaire par module :

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

Voir `trainer_tools.build_param_lr_groups` pour reference.

### Puis-je reprendre l'entrainement a partir d'un checkpoint ?

Oui. Specifiez le chemin du dernier checkpoint dans la configuration :

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

Un `reload_modules` vide charge le modele complet. StarVLA utilise le mecanisme de checkpointing d'Accelerator pour sauvegarder et restaurer entierement l'etat de l'optimiseur, le planificateur de taux d'apprentissage et les autres etats d'entrainement, afin que l'entrainement reprenne de maniere transparente.

### Entrainer avec un VLM plus petit

Exemple avec Florence-2 :

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes=${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.name QwenGR00T \
  --framework.qwenvl.base_vlm microsoft/Florence-2-large \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id} \
  --wandb_project your_project \
  --wandb_entity your_name
```

Note : `--framework.qwenvl` sera unifie dans une future version pour des raisons de compatibilite.

### Puis-je entrainer avec un seul GPU ?

Oui. Definissez `--num_processes` a 1, reduisez `per_device_batch_size` (par exemple a 1-2) et augmentez `gradient_accumulation_steps` pour compenser. L'entrainement sur un seul GPU sera beaucoup plus lent mais est entierement fonctionnel. Nous recommandons de commencer avec un modele plus petit (par exemple Qwen2.5-VL-3B).

### Combien de temps dure l'entrainement ?

Cela depend de la taille du dataset, du nombre de GPU et de l'echelle du modele. A titre de reference :
- **8xA800 + Qwen2.5-VL-3B + dataset Bridge** : environ 10-20 heures pour 50k etapes.
- **1xRTX 4090 + Qwen2.5-VL-3B + petit dataset** : peut prendre plusieurs jours.

Nous recommandons d'effectuer un test de validation rapide avec `is_debug: true` pendant quelques centaines d'etapes d'abord, puis de lancer l'entrainement complet.

### Comment suivre l'entrainement ?

StarVLA prend en charge deux methodes de journalisation (specifiees dans le champ `trackers` de votre configuration YAML) :

- **jsonl** : Les logs d'entrainement sont sauvegardes au format JSON Lines dans un fichier `log.jsonl` dans le repertoire de checkpoints. Vous pouvez les analyser et les tracer avec des scripts.
- **wandb** : Suivi en ligne en temps reel. Renseignez `wandb_entity` et `wandb_project` dans votre configuration, et les metriques (courbes de loss, taux d'apprentissage, etc.) seront automatiquement transmises a [wandb.ai](https://wandb.ai) des le debut de l'entrainement.

Nous recommandons d'activer les deux : `trackers: [jsonl, wandb]`.
