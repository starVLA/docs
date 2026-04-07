---
title: SimplerEnv評価
description: SimplerEnvでのStarVLA実験結果の再現（セットアップ、評価ワークフロー、トレーニングに関する注意事項）。
---

**SimplerEnv**は、ManiSkillベースのシミュレーション環境で、WidowXロボットアームを使用したテーブルトップ操作タスク（把持、配置、引き出し操作など）を行います。Open X-Embodiment（OXE）データセットでトレーニングされたVLAモデルの評価に広く使用されています。

このドキュメントでは、SimplerEnvでの**実験結果**を再現するための手順を提供します。

評価プロセスは以下の2つの主要な部分で構成されています：

1. `simpler_env` 環境と依存関係のセットアップ。
2. `starVLA` と `simpler_env` の両方の環境でサービスを起動して評価を実行。

このワークフローは **NVIDIA A100** と **RTX 4090** GPUの両方で正常に動作することを確認しています。

---

## Experimental Results

### WidowX Robot (Visual Matching)

| Method | Steps | Put Spoon on Towel | Put Carrot on Plate | Stack Green Block on Yellow Block | Put Eggplant in Yellow Basket | Average |
|--------|-------|--------------------|--------------------|---------------------------------|------------------------------|---------|
| RT-1-X | - | 0.0 | 4.2 | 0.0 | 0.0 | 1.1 |
| Octo-Base | - | 15.8 | 12.5 | 0.0 | 41.7 | 17.5 |
| Octo-Small | - | 41.7 | 8.2 | 0.0 | 56.7 | 26.7 |
| OpenVLA | - | 4.2 | 0.0 | 0.0 | 12.5 | 4.2 |
| CogACT | - | 71.7 | 50.8 | 15.0 | 67.5 | 51.3 |
| SpatialVLA | - | 16.7 | 25.0 | 29.2 | **100.0** | 42.7 |
| π₀ | - | 29.1 | 0.0 | 16.6 | 62.5 | 27.1 |
| π₀-FAST | - | 29.1 | 21.9 | 10.8 | 66.6 | 48.3 |
| GR00T N1.5 | - | 75.3 | 54.3 | **57.0** | 61.3 | 61.9 |
| Magma | - | 37.5 | 31.0 | 12.7 | 60.5 | 35.8 |
| **StarVLA-FAST (Qwen3-VL)** | 15K | 18.8 | 31.3 | 4.2 | 71.9 | 31.6 |
| **StarVLA-OFT (Qwen3-VL)** | 65K | **90.3** | 38.5 | 29.7 | **100.0** | 64.6 |
| **StarVLA-π (Qwen3-VL)** | 40K | 78.1 | 46.9 | 30.2 | 88.5 | 60.9 |
| **StarVLA-GR00T (Qwen3-VL)** | 20K | 83.0 | 59.4 | 18.8 | **100.0** | 65.3 |
| **StarVLA-OFT (Cosmos-Predict2-2B)** | 30K | 66.8 | 62.6 | 25.3 | 90.2 | 61.2 |
| **StarVLA-π (Cosmos-Predict2-2B)** | 30K | 81.4 | 55.2 | 25.1 | 73.0 | 58.7 |
| **StarVLA-GR00T (Cosmos-Predict2-2B)** | 30K | 80.4 | **65.4** | 20.0 | 80.6 | 61.6 |

### Google Robot (Visual Matching)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 85.7 | 44.2 | **73.0** | 6.5 | 52.4 |
| RT-1-X | 56.7 | 31.7 | 59.7 | 21.3 | 42.4 |
| RT-2-X | 78.7 | 77.9 | 25.0 | 3.7 | 46.3 |
| OpenVLA | 18.0 | 56.3 | 63.0 | 0.0 | 34.3 |
| CogACT | 91.3 | 85.0 | 71.8 | 50.9 | 74.8 |
| SpatialVLA | 86.0 | 77.9 | 57.4 | - | 75.1 |
| π₀ | 72.7 | 65.3 | 38.3 | - | 58.8 |
| π₀-FAST | 75.3 | 67.5 | 42.9 | - | 61.9 |
| GR00T N1.5* | 51.7 | 54.0 | 27.8 | 7.4 | 35.2 |
| Magma | 83.7 | 65.4 | 56.0 | 6.4 | 52.9 |
| **StarVLA-OFT** | **95.3** | 75.0 | 68.8 | **66.1** | **76.0** |

### Google Robot (Variant Aggregation)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 89.8 | 50.0 | 32.3 | 2.6 | 43.7 |
| RT-1-X | 49.0 | 32.3 | 29.4 | 10.1 | 30.2 |
| RT-2-X | 82.3 | 79.2 | 35.3 | 20.6 | 54.4 |
| OpenVLA | 60.8 | 67.7 | 28.8 | 0.0 | 39.3 |
| CogACT | 89.6 | 80.8 | 28.3 | 46.6 | 61.3 |
| SpatialVLA | 88.0 | **82.5** | 41.8 | - | 70.7 |
| π₀ | 75.2 | 63.7 | 25.6 | - | 54.8 |
| π₀-FAST | 77.6 | 68.2 | 31.3 | - | 59.0 |
| GR00T N1.5 | 69.3 | 68.7 | 35.8 | 4.0 | 44.5 |
| Magma | 68.8 | 65.7 | **53.4** | 18.5 | 51.6 |
| **StarVLA-OFT** | 91.3 | 75.1 | 55.0 | **59.4** | **70.2** |

*Note: All StarVLA Google Robot results use Qwen3-VL-4B as backbone. Numbers marked with \* denote our reimplementation.*

---

## SimplerEnv評価

### 1. 環境セットアップ

環境をセットアップするには、まず公式の[SimplerEnvリポジトリ](https://github.com/simpler-env/SimplerEnv)に従って、ベースの `simpler_env` 環境をインストールしてください。

その後、`simpler_env` 環境内で以下の依存関係をインストールしてください：

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # シミュレーション環境との互換性のためにnumpyをダウングレード
```

**よくある問題:**
NVIDIA A100でSimlerEnvをテストする際、以下のエラーが発生する場合があります：
`libvulkan.so.1: cannot open shared object file: No such file or directory`
修正方法はこちらを参照してください: [Installation Guide -- Vulkan Section](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### 動作確認

最小限の環境確認スクリプトを提供しています：

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

「Env built successfully」メッセージが表示されれば、SimplerEnvが正しくインストールされ、使用可能な状態です。

---

### 2. 評価ワークフロー

**starVLAリポジトリのルートから**、**2つの別々のターミナル**を使用して評価を実行します。

:::note[2つのターミナルを使う理由]
モデル推論（starVLA環境）とシミュレーション（simpler_env環境）は、同じconda環境にインストールすると競合する異なるPythonパッケージバージョンに依存しています。別々のconda環境で別々のターミナルで実行することで、この問題を回避できます。
:::

- **starVLA環境**: ポリシー推論サーバーを実行します。
- **simpler_env環境**: シミュレーション評価コードを実行します。

#### ステップ0. チェックポイントのダウンロード

チェックポイントをダウンロードします: [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### ステップ1. サーバーの起動（starVLA環境）

最初のターミナルで `starVLA` conda環境をアクティベートして実行します：

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**注意:** `examples/SimplerEnv/eval_files/run_policy_server.sh` を開き、`your_ckpt` 変数を実際のチェックポイントパスに設定してください。例: `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`

---

#### ステップ2. シミュレーションの起動（simpler_env環境）

2番目のターミナルで `simpler_env` conda環境をアクティベートして実行します：

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

このスクリプトはWidowXロボットの評価タスクを自動的に起動し、上記のベンチマーク結果を再現します。

**注意:** `examples/SimplerEnv/start_simpler_env.sh` を開き、`SimplerEnv_PATH` 変数をSimlerEnvリポジトリのクローンパスに設定してください（例: `/path/to/SimplerEnv`）。

**よくある問題:**
ポリシーサーバー実行時に `NotImplementedError: Framework QwenGR00T is not implemented` が発生した場合、Frameworkがまだ正しくPythonのインポートパスに登録されていない可能性があります。まずスモークテストを実行して正しい登録をトリガーしてください：
```bash
python starVLA/model/framework/QwenGR00T.py
```
スモークテストが成功したら、ポリシーサーバーを再起動してください。

---

## OXEでのトレーニング

### データ準備

手順：
1. LeRobot形式のOXEデータセットをダウンロード：
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. 各 `*lerobot/meta/modality.json` に `modality.json` を配置：
   - [bridge modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - `modality.json` にリネームして `bridge_orig_lerobot/meta/modality.json` として配置
   - [fractal modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - `modality.json` にリネームして `fractal20220817_data_lerobot/meta/modality.json` として配置

3. データセットパスを `config.yaml` に追加：
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### データローダーの確認

データローダーの確認方法を提供しています。バッチデータが読み込めることを確認してください：

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Frameworkの準備

実行前に、Frameworkがフェイクデータの例で `forward` と `predict_action` を実行できることを確認してください。

以下のコマンドを試してください：

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### トレーニングの開始

すべての準備が整ったら、提供されたスクリプトを使用してトレーニングを開始します：

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**注意:** スクリプトが検証済みの設定パスを明示的に使用していることを確認してください。まだ渡されていない場合は、`--config_yaml` 引数を追加してください。
