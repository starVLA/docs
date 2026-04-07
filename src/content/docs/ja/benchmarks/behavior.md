---
title: BEHAVIOR-1K評価
description: StarVLAフレームワークをBEHAVIOR-1Kベンチマークで実行。
---

:::caution[作成中]
このドキュメントは現在作成中です。
:::

**BEHAVIOR-1K**は、Stanfordによる家事タスクシミュレーションベンチマークで、1000の日常活動（料理、掃除、整理整頓など）を特徴としています。[2025 BEHAVIOR Challenge](https://behavior.stanford.edu/challenge/index.html)の構造に従い、50の完全な家事タスクでトレーニングと評価を行います。R1Proヒューマノイドロボット（双腕 + ベース + 胴体、23次元のアクション空間）を使用します。

評価プロセスは以下の2つの主要な部分で構成されています：

1. `behavior` 環境と依存関係のセットアップ。
2. `starVLA` と `behavior` の両方の環境でサービスを起動して評価を実行。

:::note[2つのターミナルを使う理由]
モデル推論（starVLA環境）とシミュレーション（behavior環境）は、同じconda環境にインストールすると競合する異なるPythonパッケージバージョンに依存しています。別々のconda環境で別々のターミナルで実行することで、この問題を回避できます。
:::

:::note[GPU要件]
BEHAVIORのシミュレーター（OmniGibson）はレンダリングに**ハードウェアレイトレーシング（RTコア）**が必要です。以下のGPUは**使用できません**: A100、H100（RTコアを持たないため）。

**推奨**: RTX 3090、RTX 4090、またはその他のGeForce RTX / Quadro RTXシリーズGPU。

詳細は[このIssue](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1872#issuecomment-3455002820)および[このディスカッション](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1875#issuecomment-3444246495)を参照してください。
:::

---

## BEHAVIOR評価

### 1. 環境セットアップ

`behavior` のconda環境をセットアップします：

```bash
git clone https://github.com/StanfordVL/BEHAVIOR-1K.git
conda create -n behavior python=3.10 -y
conda activate behavior
cd BEHAVIOR-1K
pip install "setuptools<=79"
# --omnigibson: OmniGibsonシミュレーターのインストール（BEHAVIORの物理エンジン）
# --bddl: BDDLのインストール（タスク定義用のBehavior Domain Definition Language）
# --joylo: JoyLoのインストール（テレオペレーション制御インターフェース）
# --dataset: BEHAVIORデータセットアセットのダウンロード（シーン、オブジェクトモデルなど）
./setup.sh --omnigibson --bddl --joylo --dataset
conda install -c conda-forge libglu
pip install rich omegaconf hydra-core msgpack websockets av pandas google-auth
```

starVLA環境でも以下を実行：

```bash
pip install websockets
```

---

### 2. 評価ワークフロー

手順：
1. チェックポイントをダウンロード
2. 必要に応じて以下のスクリプトを選択

#### (A) 並列評価スクリプト

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval.sh
```

`start_parallel_eval.sh` を実行する前に、以下のパスを設定してください：
- `star_vla_python`: StarVLA環境のPythonインタプリタ
- `sim_python`: Behavior環境のPythonインタプリタ
- `TASKS_JSONL_PATH`: [トレーニングデータセット](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos)からダウンロードしたタスク説明ファイル（`examples/Behavior/tasks.jsonl` に含まれています）
- `BEHAVIOR_ASSET_PATH`: behaviorアセットパスのローカルパス（`./setup.sh` でインストール後、デフォルトは `BEHAVIOR-1K/datasets`）

#### (B) 別々のターミナルでのデバッグ

デバッグを容易にするため、クライアント（評価環境）とサーバー（ポリシー）を2つの別々のターミナルで起動することもできます：

```bash
bash examples/Behavior/start_server.sh
bash examples/Behavior/start_client.sh
```

上記のデバッグファイルはトレーニングセットでの評価を実行します。

#### (C) タスクごとの評価（メモリセーフ）

メモリオーバーフローを防止するため、`start_parallel_eval_per_task.sh` も実装しています：

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval_per_task.sh
```

- スクリプトは `INSTANCE_NAMES` の各タスクに対して順次評価を実行します
- 各タスクについて、`TEST_EVAL_INSTANCE_IDS` のすべてのインスタンスをGPU間に割り当てます
- 前のタスクが完了するのを待ってから、次のタスクに進みます

---

## 注意事項

### ラッパータイプ

1. **RGBLowResWrapper**: RGBのみを視覚観測として使用し、カメラ解像度は224x224です。低解像度RGBのみの使用はシミュレーターの高速化と評価時間の短縮に役立ちます。このラッパーはスタンダードトラックで使用可能です。

2. **DefaultWrapper**: データ収集中に使用されるデフォルトの観測設定によるラッパー（RGB + 深度 + セグメンテーション、ヘッドカメラは720p、リストカメラは480p）。このラッパーはスタンダードトラックで使用可能ですが、RGBLowResWrapperと比較して評価がかなり遅くなります。

3. **RichObservationWrapper**: 法線やフローなどの追加観測モダリティ、および特権タスク情報を読み込みます。このラッパーは特権情報トラックでのみ使用可能です。

### アクション次元

BEHAVIORのアクション次元は23です：

```python
"R1Pro": {
    "base": np.s_[0:3],           # Indices 0-2
    "torso": np.s_[3:7],          # Indices 3-6
    "left_arm": np.s_[7:14],      # Indices 7-13
    "left_gripper": np.s_[14:15], # Index 14
    "right_arm": np.s_[15:22],    # Indices 15-21
    "right_gripper": np.s_[22:23] # Index 22
}
```

### 動画の保存

動画は `{task_name}_{idx}_{epi}.mp4` の形式で保存されます。`idx` はインスタンス番号、`epi` はエピソード番号です。

### よくある問題

**Segmentation fault (core dumped):** Vulkanが正しくインストールされていない可能性が高いです。[こちらのリンク](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)を確認してください。

**ImportError: libGL.so.1: cannot open shared object file:**
```bash
apt-get install ffmpeg libsm6 libxext6 -y
```
