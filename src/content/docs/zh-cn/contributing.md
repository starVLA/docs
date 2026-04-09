---
title: 贡献指南
description: 如何提问题、协作开发以及引用 StarVLA。
---

## 如何参与

1. **先提 Issue**：发现问题请先开 Issue，若需要更深入讨论可开启 Discussion。
2. **提交改动**：在 Issue 或合作沟通确认范围后再提交 PR。
3. **获取支持**：填写合作表单，周五下午有 office hours 可进行同步讨论。

合作表单： https://forms.gle/R4VvgiVveULibTCCA

## PR 提交检查

- 给出简短摘要并关联 Issue。
- 涉及界面或文档展示的改动请附截图或 GIF。
- 提交前建议本地检查（主仓库可运行 `make check`）。

## 引用

StarVLA 技术报告已发布于 arXiv：[arxiv.org/abs/2604.05014](https://arxiv.org/abs/2604.05014)。

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

## 许可与 Rebase 说明

StarVLA 采用 MIT License，可用于商业、修改、分发与私有使用。

从上游 StarVLA rebase 时，请使用清晰的提交信息（如 `chore: rebase from StarVLA`），并保持至少最近两个上游提交为独立提交。
