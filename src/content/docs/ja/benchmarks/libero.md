---
title: LIBERO評価
description: LIBEROでのStarVLA実験結果の再現（セットアップ、評価ワークフロー、トレーニングに関する注意事項）。
---

**LIBERO**は、4つのタスクスイート（Spatial、Object、Goal、Long Horizon）、合計40タスクからなるテーブルトップロボット操作ベンチマークです。Frankaロボットアームを使用して、VLAモデルの空間理解、物体認識、目標推論、長期操作の能力をテストします。

このドキュメントでは、LIBEROでの**実験結果**を再現するための手順を提供します。
評価プロセスは以下の2つの主要な部分で構成されています：

1. `LIBERO` 環境と依存関係のセットアップ。
2. `starVLA` と `LIBERO` の両方の環境でサービスを起動して評価を実行。

このワークフローは **NVIDIA A100** と **RTX 4090** GPUの両方で正常に動作することを確認しています。

---

## LIBERO評価

### 0. チェックポイントのダウンロード

コミュニティの評価を容易にするため、Hugging Faceに事前学習済みチェックポイントのコレクションを提供しています: [StarVLA/bench-libero](https://huggingface.co/collections/StarVLA/libero)。LIBEROでの対応する結果は以下の表にまとめられています。

#### 実験結果

| モデル                | Steps | Epochs | Spatial | Object | Goal | Long | Avg  |
|----------------------|-------|--------|---------|--------|------|------|------|
| $\pi_0$+FAST         | -     | -      | 96.4    | 96.8   | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT          | 175K  | 223    | 97.6    | 98.4   | 97.9 | 94.5 | 97.1 |
| $\pi_0$              | -     | -      | 96.8    | 98.8   | 95.8 | 85.2 | 94.1 |
| GR00T-N1.5           | 20K   | 203    | 92.0    | 92.0   | 86.0 | 76.0 | 86.5 |
| **Qwen2.5-VL-FAST**  | 30K   | 9.54   | 97.3    | 97.2   | 96.1 | 90.2 | 95.2 |
| **Qwen2.5-VL-OFT**   | 30K   | 9.54   | 97.4    | 98.0   | 96.8 | 92.0 | 96.1 |
| **Qwen2.5-VL-GR00T** | 30K   | 9.54   | 97.8    | 98.2   | 94.6 | 90.8 | 95.4 |
| **Qwen3-VL-FAST**    | 30K   | 9.54   | 97.3    | 97.4   | 96.3 | 90.6 | 95.4 |
| **Qwen3-VL-OFT**     | 30K   | 9.54   | 97.8    | 98.6   | 96.2 | 93.8 | 96.6 |
| **Qwen3-VL-GR00T**   | 30K   | 9.54   | 97.8    | 98.8   | 97.4 | 92.0 | 96.5 |

4つのスイートすべてに対して1つのポリシーをトレーニングしています。すべてのスコアは各タスクスイート500回の試行の平均です（10タスク x 50エピソード）。

---

### 1. 環境セットアップ

環境をセットアップするには、まず公式の[LIBEROリポジトリ](https://github.com/Lifelong-Robot-Learning/LIBERO)に従って、ベースの `LIBERO` 環境をインストールしてください。

**よくある問題:** LIBEROのデフォルトはPython 3.8ですが、3.8から3.10間の構文の変更は大きいです。**Python 3.10を使用すると多くの問題を回避できることを確認しています**。

その後、`LIBERO` 環境内で以下の依存関係をインストールしてください：

```bash
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # シミュレーション環境との互換性のためにnumpyをダウングレード
```

---

### 2. 評価ワークフロー

**starVLAリポジトリのルートから**、**2つの別々のターミナル**を使用して評価を実行します。

:::note[2つのターミナルを使う理由]
モデル推論（starVLA環境）とシミュレーション（LIBERO環境）は、同じconda環境にインストールすると競合する異なるPythonパッケージバージョンに依存しています。別々のconda環境で別々のターミナルで実行することで、この問題を回避できます。
:::

- **starVLA環境**: 推論サーバーを実行します。
- **LIBERO環境**: シミュレーションを実行します。

#### ステップ1. サーバーの起動（starVLA環境）

最初のターミナルで `starVLA` conda環境をアクティベートして実行します：

```bash
bash examples/LIBERO/eval_files/run_policy_server.sh
```

**注意:** `examples/LIBERO/eval_files/run_policy_server.sh` で正しいチェックポイントパスを指定していることを確認してください。

---

#### ステップ2. シミュレーションの起動（LIBERO環境）

2番目のターミナルで `LIBERO` conda環境をアクティベートして実行します：

```bash
bash examples/LIBERO/eval_files/eval_libero.sh
```

**注意:** `eval_libero.sh` で以下の変数を正しく設定してください：

| 変数 | 意味 | 例 |
|----------|---------|---------|
| `LIBERO_HOME` | LIBEROリポジトリクローンへのパス | `/path/to/LIBERO` |
| `LIBERO_Python` | LIBERO conda環境のPythonパス | `$(which python)`（LIBERO環境内） |
| `your_ckpt` | StarVLAチェックポイントパス | `./results/Checkpoints/.../steps_30000_pytorch_model.pt` |
| `unnorm_key` | 非正規化統計を読み込むためのロボットタイプ名 | `franka`（LIBEROはFrankaアームを使用） |

`unnorm_key` は、トレーニング中に保存された正規化統計（最小/最大値など）を読み込み、正規化されたモデル出力を実際の関節角度に変換するために使用されます。

各結果は、以下に示すように可視化用の動画も保存されます：

![例](../../../../assets/LIBERO_example.gif)

---

## LIBEROトレーニング

### ステップ0: トレーニングデータセットのダウンロード

データセットを `playground/Datasets/LEROBOT_LIBERO_DATA` ディレクトリにダウンロードします：

- [LIBERO-spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [LIBERO-object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [LIBERO-goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [LIBERO-10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

各 `$LEROBOT_LIBERO_DATA/subset/meta/modality.json` に `modality.json` を配置してください。

以下を実行して素早く準備できます：

```bash
# DESTをデータを保存するディレクトリに設定
export DEST=/path/to/your/data/directory
bash examples/LIBERO/data_preparation.sh
```

### ステップ1: トレーニングの開始

必要なトレーニングファイルのほとんどは `examples/LIBERO/train_files/` にまとめられています。

以下のコマンドでトレーニングを開始します：

```bash
bash examples/LIBERO/train_files/run_libero_train.sh
```

**注意:** `examples/LIBERO/train_files/run_libero_train.sh` で正しいパスを指定していることを確認してください。
