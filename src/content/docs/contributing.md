---
title: Contributing
description: How to report issues, propose changes, and cite StarVLA.
---

## How to Contribute

1. **Report issues first**: Open an Issue. If it needs clarification, start a Discussion.
2. **Propose changes**: Open a PR after aligning scope and design via an Issue or a short sync (Cooperation Form).
3. **Get unblocked**: Use the Cooperation Form and join office hours (Friday afternoons) for live discussion.

Cooperation Form: https://forms.gle/R4VvgiVveULibTCCA

## PR Checklist

- Provide a short summary and link to the related Issue.
- Include screenshots or GIFs for visual changes.
- Run local checks before submitting (e.g., `make check` in the main repo).

## Citation

The StarVLA technical report is available on arXiv: [arxiv.org/abs/2604.05014](https://arxiv.org/abs/2604.05014).

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

## License & Rebase Notes

StarVLA is released under the MIT License, which permits commercial use, modification, distribution, and private use.

When rebasing from upstream StarVLA, use descriptive commit messages (e.g., `chore: rebase from StarVLA`) and keep at least the two latest upstream commits as separate.
