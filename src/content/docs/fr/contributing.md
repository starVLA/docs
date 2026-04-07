---
title: Contribuer
description: Comment signaler des problemes, proposer des modifications et citer StarVLA.
---

## Comment contribuer

1. **Signalez d'abord les problemes** : Ouvrez une Issue. Si une clarification est necessaire, lancez une Discussion.
2. **Proposez des modifications** : Ouvrez une PR apres avoir aligne le perimetre et la conception via une Issue ou une breve synchronisation (formulaire de cooperation).
3. **Debloquez-vous** : Utilisez le formulaire de cooperation et rejoignez les heures de permanence (vendredi apres-midi) pour une discussion en direct.

Formulaire de cooperation : https://forms.gle/R4VvgiVveULibTCCA

## Checklist pour les PR

- Fournissez un resume court et un lien vers l'Issue associee.
- Incluez des captures d'ecran ou des GIF pour les modifications visuelles.
- Executez les verifications locales avant de soumettre (par exemple, `make check` dans le depot principal).

## Citation

```bibtex
@misc{starvla2025,
  title  = {StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing},
  author = {starVLA Community},
  url = {https://github.com/starVLA/starVLA},
  year   = {2025}
}
```

## Licence et notes de rebase

StarVLA est publie sous la licence MIT, qui autorise l'utilisation commerciale, la modification, la distribution et l'utilisation privee.

Lors d'un rebase depuis le depot upstream StarVLA, utilisez des messages de commit descriptifs (par exemple, `chore: rebase from StarVLA`) et conservez au moins les deux derniers commits upstream separes.
