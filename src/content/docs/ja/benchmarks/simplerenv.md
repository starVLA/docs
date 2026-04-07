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
