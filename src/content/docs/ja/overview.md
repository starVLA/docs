---
title: プロジェクト概要
description: StarVLAとは何か、現在サポートしている機能、主要な機能へのリンク。
---

## ビジョン

StarVLAは、**Vision-Language Model（VLM）**を**Vision-Language-Action（VLA）モデル**に変換するための、レゴのようなモジュラーコードベースです。

簡単に言うと、VLMは画像とテキストを理解するモデルであり、VLAはさらにロボットのアクションを出力できるモデルです。StarVLAは、データ準備からモデルトレーニング、シミュレーション評価まで、この変換をエンドツーエンドで処理します。各コンポーネントは**個別にデバッグ可能で、プラグアンドプレイ**です。

## 主な特長

### VLAフレームワーク

StarVLAは、Qwen-VLベースのStarVLAモデルファミリーを4つの異なるアクション出力戦略で公式に提供しています：

| フレームワーク | アクション出力 | 参考 |
|-----------|--------------|-----------|
| **Qwen-FAST** | アクションを離散トークンにエンコードし、言語モデルで予測 | pi0-FAST |
| **Qwen-OFT** | VLM出力後のMLPヘッドで、連続的なアクション値を直接回帰 | OpenVLA-OFT |
| **Qwen-PI** | Flow-Matching（拡散ベース）手法で連続アクションを生成 | pi0 |
| **Qwen-GR00T** | デュアルシステム：高レベル推論用VLM + 高速アクション生成用DiT | GR00T-N1 |

**モジュラーの意味**: Frameworkでモデル構造を定義するだけで、共通のTrainer、Dataloader、評価・デプロイパイプラインを再利用できます。トレーニングループや評価コードを書き直す必要はありません。

### トレーニング戦略

- シングルタスク模倣学習（人間のデモンストレーションから学習 -- 報酬関数は不要）。
- マルチモーダル・マルチタスク共同トレーニング（複数のデータソースで同時にトレーニングし、モデルが以前学習した能力を忘れることを防止）。
- **\[計画中\]** 強化学習への適応。

### シミュレーションベンチマーク

サポート済みまたは計画中のベンチマーク：

- サポート済み: SimplerEnv, LIBERO, RoboCasa, RoboTwin, CALVIN, BEHAVIOR。
- 計画中: SO101, RLBench。

#### 主なベンチマーク結果

![SimplerEnvでのStarVLAの結果](../../../assets/starvla_simpleEnv.png)

![LIBEROでのStarVLAの結果](../../../assets/starvla_LIBERO.png)

![RoboCasaでのStarVLAの結果](../../../assets/stavla_RoboCasa.png)

### 結果とレポート

- **技術レポート**: [*StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing*](https://arxiv.org/abs/2604.05014)（arXiv:2604.05014）。
- **Overleafライブレポート**: 最新のベンチマークデータと分析を含む、継続的に更新される実験レポートPDF — https://www.overleaf.com/read/qqtwrnprctkf#d5bdce

## 次のステップ

- [クイックスタート](/docs/ja/getting-started/quick-start/)で環境をセットアップし、インストールを確認してください。
- [レゴ式設計](/docs/ja/design/lego-like/)で設計原則を確認してください。
- [モデルライブラリ](/docs/ja/model-zoo/)でチェックポイントを参照してください。

## コミュニティとリンク

- Hugging Face: https://huggingface.co/StarVLA
- WeChatグループ: https://github.com/starVLA/starVLA/issues/64#issuecomment-3715403845

---

**StarVLAベースのプロジェクト:**

- NeuroVLA: [A Brain-like Embodied Intelligence for Fluid and Fast Reflexive Robotics Control](https://github.com/guoweiyu/NeuroVLA)
- PhysBrain: [Human Egocentric Data as a Bridge from Vision Language Models to Physical Intelligence](https://zgc-embodyai.github.io/PhysBrain/)
- TwinBrainVLA: [Unleashing the Potential of Generalist VLMs for Embodied Tasks via Asymmetric Mixture-of-Transformers](https://github.com/ZGC-EmbodyAI/TwinBrainVLA)
- LangForce: [Bayesian Decomposition of Vision Language Action Models via Latent Action Queries](https://github.com/ZGC-EmbodyAI/LangForce)

---

**最新情報**

- **2025/12/25**: Behavior-1K、RoboTwin 2.0、CALVINのパイプラインが確立。コミュニティとベースラインの共有を予定。
- **2025/12/25**: RoboCasa評価サポートをリリース。事前学習なしでSOTAを達成。[RoboCasaドキュメント](/docs/ja/benchmarks/robocasa/)を参照してください。
- **2025/12/15**: リリース回帰チェック完了。継続的な更新は[デイリー開発ログ](https://github.com/starVLA/starVLA/issues/64#issue-3727060165)を参照。
- **2025/12/09**: VLM、VLA、VLA+VLM共同トレーニングのオープンソーストレーニング。[VLM共同トレーニングドキュメント](/docs/ja/training/cotrain-vlm/)を参照。
- **2025/11/12**: リソース制約のあるVLMトレーニング（単一A100）向けにFlorence-2サポートを追加。ワークフローについては[レゴ式設計](/docs/ja/design/lego-like/)を参照。
- **2025/10/30**: LIBEROのトレーニングおよび評価ガイドをリリース。
- **2025/10/25**: コミュニティのフィードバックに基づき、スクリプトリンクとパッケージングを整備。
