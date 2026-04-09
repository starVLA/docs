---
title: 貢献ガイド
description: 問題の報告、変更の提案、StarVLAの引用方法について。
---

## 貢献方法

1. **まず問題を報告**: Issueを作成してください。明確化が必要な場合は、Discussionを開始してください。
2. **変更を提案**: IssueまたはCooperation Formでのスコープと設計の調整後に、PRを作成してください。
3. **サポートを受ける**: Cooperation Formを利用し、金曜午後のオフィスアワーに参加してライブディスカッションを行ってください。

Cooperation Form: https://forms.gle/R4VvgiVveULibTCCA

## PRチェックリスト

- 簡単な要約と関連するIssueへのリンクを記載してください。
- UIに関する変更にはスクリーンショットまたはGIFを添付してください。
- 送信前にローカルチェックを実行してください（例: メインリポジトリで `make check`）。

## 引用

StarVLA技術レポートはarXivで公開されています： [arxiv.org/abs/2604.05014](https://arxiv.org/abs/2604.05014)。

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

## ライセンスとリベースに関する注意事項

StarVLAはMITライセンスの下でリリースされており、商用利用、改変、配布、私的利用が許可されています。

上流のStarVLAからリベースする際は、説明的なコミットメッセージ（例: `chore: rebase from StarVLA`）を使用し、少なくとも最新の2つの上流コミットを個別に保持してください。
