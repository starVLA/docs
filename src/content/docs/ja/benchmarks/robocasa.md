---
title: RoboCasa評価
description: RoboCasa GR1テーブルトップタスクでのStarVLA実験結果の再現。
---

**RoboCasa**は大規模な家事シミュレーションベンチマークです。ここでは [GR1 Tabletop Tasks](https://github.com/robocasa/robocasa-gr1-tabletop-tasks) サブセットを使用し、Fourier GR1ヒューマノイドロボット（上半身、双腕）による24のテーブルトップPick-and-Placeタスクを行います。

このドキュメントでは**実験結果**を再現するための手順を提供します。

評価プロセスは以下の2つの主要な部分で構成されています：

1. `robocasa` 環境と依存関係のセットアップ。
2. `starVLA` と `robocasa` の両方の環境でサービスを起動して評価を実行。

:::note[2つのターミナルを使う理由]
モデル推論（starVLA環境）とシミュレーション（robocasa環境）は、同じconda環境にインストールすると競合する異なるPythonパッケージバージョンに依存しています。別々のconda環境で別々のターミナルで実行することで、この問題を回避できます。
:::

このワークフローは **NVIDIA A100** GPUで正常に動作することを確認しています。

---

## 実験結果

| Task | GR00T-N1.6 | Qwen3GR00T | Qwen3PI | Qwen3OFT | Qwen3FAST |
|------|------------|------------|---------|----------|-----------|
| **PnP Bottle To Cabinet Close** | 51.5 | 46.0 | 26.0 | 30.0 | 38.0 |
| **PnP Can To Drawer Close** | 13.0 | 80.0 | 62.0 | 76.0 | 44.0 |
| **PnP Cup To Drawer Close** | 8.5 | 54.0 | 42.0 | 44.0 | 56.0 |
| **PnP Milk To Microwave Close** | 14.0 | 48.0 | 50.0 | 44.0 | 44.0 |
| **PnP Potato To Microwave Close** | 41.5 | 28.0 | 42.0 | 32.0 | 14.0 |
| **PnP Wine To Cabinet Close** | 16.5 | 46.0 | 32.0 | 36.0 | 14.0 |
| **PnP Novel From Cuttingboard To Basket** | 58.0 | 48.0 | 40.0 | 50.0 | 54.0 |
| **PnP Novel From Cuttingboard To Cardboardbox** | 46.5 | 40.0 | 46.0 | 40.0 | 42.0 |
| **PnP Novel From Cuttingboard To Pan** | 68.5 | 68.0 | 60.0 | 70.0 | 58.0 |
| **PnP Novel From Cuttingboard To Pot** | 65.0 | 52.0 | 40.0 | 54.0 | 58.0 |
| **PnP Novel From Cuttingboard To Tieredbasket** | 46.5 | 56.0 | 44.0 | 38.0 | 40.0 |
| **PnP Novel From Placemat To Basket** | 58.5 | 42.0 | 44.0 | 32.0 | 36.0 |
| **PnP Novel From Placemat To Bowl** | 57.5 | 44.0 | 52.0 | 58.0 | 38.0 |
| **PnP Novel From Placemat To Plate** | 63.0 | 48.0 | 50.0 | 52.0 | 42.0 |
| **PnP Novel From Placemat To Tieredshelf** | 28.5 | 18.0 | 28.0 | 24.0 | 18.0 |
| **PnP Novel From Plate To Bowl** | 57.0 | 60.0 | 52.0 | 60.0 | 52.0 |
| **PnP Novel From Plate To Cardboardbox** | 43.5 | 50.0 | 40.0 | 50.0 | 30.0 |
| **PnP Novel From Plate To Pan** | 51.0 | 54.0 | 36.0 | 66.0 | 48.0 |
| **PnP Novel From Plate To Plate** | 78.7 | 70.0 | 48.0 | 68.0 | 50.0 |
| **PnP Novel From Tray To Cardboardbox** | 51.5 | 38.0 | 34.0 | 44.0 | 28.0 |
| **PnP Novel From Tray To Plate** | 71.0 | 56.0 | 64.0 | 56.0 | 34.0 |
| **PnP Novel From Tray To Pot** | 64.5 | 50.0 | 44.0 | 62.0 | 46.0 |
| **PnP Novel From Tray To Tieredbasket** | 57.0 | 36.0 | 50.0 | 54.0 | 36.0 |
| **PnP Novel From Tray To Tieredshelf** | 31.5 | 16.0 | 28.0 | 30.0 | 16.0 |
| **平均** | **47.6** | **47.8** | **43.9** | **48.8** | **39.0** |

*注意: すべての値は成功率（%）です。24タスクすべてに対して単一のモデルでトレーニングされています。結果はタスクあたり50回のロールアウトで報告されています。*

---

## RoboCasa評価

### 0. チェックポイントのダウンロード

まず、以下からチェックポイントをダウンロードします：
- [Qwen3VL-GR00T](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1)
- [Qwen3VL-OFT](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa)

### 1. 環境セットアップ

環境をセットアップするには、まず[公式RoboCasaインストールガイド](https://github.com/robocasa/robocasa-gr1-tabletop-tasks?tab=readme-ov-file#getting-started)に従って、ベースの `robocasa-gr1-tabletop-tasks` 環境をインストールしてください。

次にソケットサポートをインストールします：

```bash
pip install tyro
```

---

### 2. 評価ワークフロー

#### ステップ1. サーバーの起動（starVLA環境）

最初のターミナルで `starVLA` conda環境をアクティベートして実行します：

```bash
python deployment/model_server/server_policy.py \
        --ckpt_path ${your_ckpt} \
        --port 5678 \
        --use_bf16
```

---

#### ステップ2. シミュレーションの起動（robocasa環境）

2番目のターミナルで `robocasa` conda環境をアクティベートして実行します：

```bash
export PYTHONPATH=$(pwd):${PYTHONPATH}
your_ckpt=StarVLA/Qwen3-VL-OFT-Robocasa/checkpoints/steps_90000_pytorch_model.pt

python examples/Robocasa_tabletop/eval_files/simulation_env.py\
   --args.env_name ${env_name} \
   --args.port 5678 \
   --args.n_episodes 50 \
   --args.n_envs 1 \
   --args.max_episode_steps 720 \
   --args.n_action_steps 12 \
   --args.video_out_path ${video_out_path} \
   --args.pretrained_path ${your_ckpt}
```

#### バッチ評価（オプション）

GPUが複数ある場合は、バッチ評価スクリプトを使用できます：

```bash
bash examples/Robocasa_tabletop/batch_eval_args.sh
```

**注意:** `batch_eval_args.sh` で正しいチェックポイントパスを指定していることを確認してください。

---

## トレーニング結果の再現

### ステップ0: トレーニングデータセットのダウンロード

[HuggingFace](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)からPhysicalAI-Robotics-GR00T-X-Embodiment-Simディレクトリのデータセットを `playground/Datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim` ディレクトリにダウンロードします。

関連するファインチューニングフォルダのみをダウンロードするには、[GR00T-N1.5](https://github.com/NVIDIA/Isaac-GR00T/tree/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/examples/RoboCasa#-1-dataset-preparation)リポジトリの手順を参照してください。

または、スクリプトを使用して `*_1000` フォルダをダウンロードします：

```bash
python examples/Robocasa_tabletop/download_gr00t_ft_data.py
```

### ステップ1: トレーニングの開始

パラメータ `data_mix` を変更することで異なるデータセットを選択でき、以下のスクリプトを使用して `*_1000` データセットのファインチューニングを行えます：

```bash
bash examples/Robocasa_tabletop/train_files/run_robocasa.sh
```
