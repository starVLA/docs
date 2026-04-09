---
title: Mitwirken
description: Wie Sie Probleme melden, Aenderungen vorschlagen und StarVLA zitieren.
---

## Wie Sie mitwirken koennen

1. **Probleme zuerst melden**: Eroeffnen Sie ein Issue. Falls Klaerungsbedarf besteht, starten Sie eine Discussion.
2. **Aenderungen vorschlagen**: Eroeffnen Sie einen PR, nachdem Umfang und Design ueber ein Issue oder eine kurze Abstimmung (Kooperationsformular) abgestimmt wurden.
3. **Hilfe erhalten**: Nutzen Sie das Kooperationsformular und nehmen Sie an den Sprechstunden (freitagnachmittags) fuer Live-Diskussionen teil.

Kooperationsformular: https://forms.gle/R4VvgiVveULibTCCA

## PR-Checkliste

- Geben Sie eine kurze Zusammenfassung an und verlinken Sie das zugehoerige Issue.
- Fuegen Sie Screenshots oder GIFs fuer visuelle Aenderungen bei.
- Fuehren Sie vor dem Einreichen lokale Pruefungen durch (z. B. `make check` im Haupt-Repository).

## Zitation

Der technische Bericht von StarVLA ist auf arXiv verfuegbar: [arxiv.org/abs/2604.05014](https://arxiv.org/abs/2604.05014).

```bibtex
@misc{starvla,
      title={StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing},
      author={StarVLA Community},
      year={2026},
      eprint={2604.05014},
      archivePrefix={arXiv},
      primaryClass={cs.RO},
      url={https://arxiv.org/abs/2604.05014},
}
```

## Lizenz & Rebase-Hinweise

StarVLA wird unter der MIT-Lizenz veroeffentlicht, die kommerzielle Nutzung, Modifikation, Verteilung und private Nutzung erlaubt.

Beim Rebase von Upstream-StarVLA verwenden Sie beschreibende Commit-Nachrichten (z. B. `chore: rebase from StarVLA`) und behalten Sie mindestens die beiden letzten Upstream-Commits als separate Commits bei.
