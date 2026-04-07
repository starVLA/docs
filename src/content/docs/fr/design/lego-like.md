---
title: Conception modulaire
description: Les principes modulaires qui rendent StarVLA facile a etendre et a debugger.
---

## Tester n'importe quel sous-module

StarVLA met l'accent sur une conception modulaire des modeles. Chaque fichier de framework principal est executable pour un debugging rapide et des tests de fonctionnement :

```bash
# modele (fichier de configuration situe a starVLA/config/training/starvla_cotrain_oxe.yaml)
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# dataloader
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**Regle de conception :** `starVLA/model/framework/<votre_framework>.py` est la seule surface d'API externe du modele. Il doit refleter le diagramme du framework dans votre article.

## Frontieres explicites du modele

StarVLA suit une decomposition descendante et le principe de forte cohesion / faible couplage (chaque module gere sa propre responsabilite et les modules n'interferent pas entre eux). Le dataloader doit retourner un dictionnaire brut, agnostique au modele, sans preprocessing specifique au modele.

Un echantillon typique contient :

- `image` : `list[PIL.Image] | np.ndarray` -- images de cameras (un ou plusieurs points de vue)
- `lang` : `str` -- instruction de tache en langage naturel (par exemple, "put the red block in the box")
- `action` : `np.ndarray[T, action_dim]` -- sequence d'actions robotiques (T etapes, chacune avec action_dim valeurs articulaires)
- `state` : `Optional[np.ndarray[..., state_dim]]` -- lectures actuelles des capteurs du robot (par exemple, angles articulaires, position de l'effecteur terminal ; optionnel)

`framework.forward()` et `framework.predict_action()` operent directement sur les entrees brutes. Cela garde les frontieres entrainement/test explicites et faciles a modifier.

## Systeme de configuration flexible

StarVLA utilise un objet de configuration global unique alimente par OmegaConf (une bibliotheque de gestion de configuration YAML qui prend en charge la surcharge des valeurs de configuration depuis la ligne de commande). Les parametres sont passes via des dictionnaires extensibles, permettant des surcharges et une redondance controlee.

Exemple (surcharge via CLI) :

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**Note :** `framework.action_model.new_module` ne fait qu'ajouter des cles a la configuration globale. Son comportement est defini dans l'implementation de votre framework.

## Comment ajouter un nouveau framework

Vous souhaitez integrer votre propre architecture de modele ? Trois etapes suffisent :

1. **Creer un fichier de framework** : Ajoutez `VotreFramework.py` sous `starVLA/model/framework/`, heritez de la classe de base et implementez les methodes `forward()` et `predict_action()`.
2. **Ecrire un test de fonctionnement** : Ajoutez un point d'entree `if __name__ == "__main__":` a la fin du fichier pour verifier que la passe avant et la prediction d'actions fonctionnent avec des donnees fictives.
3. **Enregistrer dans la configuration** : Definissez `framework.name: VotreFramework` dans votre configuration YAML d'entrainement pour s'integrer au pipeline d'entrainement et d'evaluation existant.

Utilisez `QwenGR00T.py` ou `QwenOFT.py` comme modeles de reference.
