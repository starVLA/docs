---
title: モデルライブラリ
description: リリース済みの改変モデル、ファインチューニングのチェックポイント、データセット。
---

## 利用可能な改変モデル

| モデル | 説明 | リンク |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Qwen2.5-VLの語彙をFASTトークンで拡張（連続アクションをトークンに離散化するための特殊語彙拡張） | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Qwen3-VLの語彙をFASTトークンで拡張（同上） | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | pi-fastアクショントークナイザーの重み | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## ファインチューニングのチェックポイント

### SimplerEnv / Bridge

Bridgeは WidowX テーブルトップ操作データセットで、FractalはGoogleのRT-1ロボット操作データセットです。

| モデル | フレームワーク | ベースVLM | 説明 | WidowX | リンク |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | Bridgeのみ | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal（小型モデル） | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**WidowX列**: [SimplerEnv](/docs/ja/benchmarks/simplerenv/)でのWidowXロボットタスクの成功率（%）。高いほど良い結果です。

### LIBERO

LIBEROには4つのタスクスイート（Spatial、Object、Goal、Long Horizon）があり、合計40タスクです。すべてのチェックポイントは4つのスイート全体で共同トレーニングされています。[LIBERO評価ドキュメント](/docs/ja/benchmarks/libero/)を参照してください。

| モデル | フレームワーク | ベースVLM | リンク |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

RoboCasa GR1テーブルトップタスク、24のPick-and-Placeタスク。[RoboCasa評価ドキュメント](/docs/ja/benchmarks/robocasa/)を参照してください。

| モデル | フレームワーク | ベースVLM | リンク |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

RoboTwin 2.0双腕操作ベンチマーク、50タスク。[RoboTwin評価ドキュメント](/docs/ja/benchmarks/robotwin/)を参照してください。

| モデル | フレームワーク | ベースVLM | リンク |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

BEHAVIOR-1K家事タスクベンチマーク、R1Proヒューマノイドロボットを使用。[BEHAVIOR評価ドキュメント](/docs/ja/benchmarks/behavior/)を参照してください。

| モデル | 説明 | リンク |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | 全50タスクで共同トレーニング | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | シングルタスクトレーニング | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | 6タスク共同トレーニング | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | セグメンテーション観測実験 | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## データセット

### トレーニングデータセット

| データセット | 説明 | リンク |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | VLM共同トレーニング用の画像テキストデータセット（ShareGPT4V-COCOサブセット） | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | RoboTwin 2.0クリーンデモンストレーション（タスクあたり50件） | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | RoboTwin 2.0ランダム化デモンストレーション（タスクあたり500件） | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | 上記と同じ、tar.gzパック形式（一括ダウンロード用） | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### BEHAVIORデータ

| データセット | 説明 | リンク |
| --- | --- | --- |
| **BEHAVIOR-1K** | BEHAVIOR-1Kベンチマークシミュレーション設定 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | BEHAVIOR-1Kトレーニングデータセット | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | BEHAVIOR-1Kシーンおよびオブジェクトアセット | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | BEHAVIOR-1K可視化デモ | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | シングルタスクトレーニングデータサンプル | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
上記のStarVLA独自のデータセットに加え、トレーニングでよく使用されるサードパーティデータセットには以下があります：
- **SimplerEnv/OXE**: [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot), [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO**: [Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot), [Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot), [Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot), [10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa**: [PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## チェックポイントの使用方法

チェックポイントをダウンロードしてポリシーサーバーを実行します：

```bash
# ダウンロード（huggingface_hubが必要）
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# ポリシーサーバーの起動
python deployment/model_server/server_policy.py \
    # steps_XXXXXはトレーニングステップ数です -- ダウンロードしたファイルの実際のファイル名に置き換えてください
    # 例: steps_50000_pytorch_model.pt; `ls`で正確なファイル名を確認してください
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

その後、テストしたいベンチマークの評価ガイドに従ってください（例: [SimplerEnv](/docs/ja/benchmarks/simplerenv/)、[LIBERO](/docs/ja/benchmarks/libero/)、[RoboCasa](/docs/ja/benchmarks/robocasa/)、[RoboTwin](/docs/ja/benchmarks/robotwin/)、[BEHAVIOR](/docs/ja/benchmarks/behavior/)）。
