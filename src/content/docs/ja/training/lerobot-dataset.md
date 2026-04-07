---
title: 独自のLeRobotデータセットを使用
description: 独自のLeRobot形式データセットでStarVLAをトレーニングする方法。
---

このガイドでは、データ変換からモデルトレーニングまで、独自のロボティクスデータでStarVLAをトレーニングする完全なプロセスを説明します。

## 概要

ワークフローは以下の5つの主要なステップで構成されています：

1. **データをLeRobot形式に変換** - 生データを標準化されたLeRobot形式に変換
2. **ロボットタイプ設定の作成** - ロボットのデータモダリティ構造を定義
3. **データミックスの作成** - データセットをミクスチャーレジストリに登録
4. **トレーニング設定の作成** - トレーニングパラメータを設定
5. **トレーニングの実行** - トレーニングスクリプトを起動

## ステップ1: データをLeRobot形式に変換

StarVLAはVLAトレーニングにLeRobotデータセット形式を使用します。まずロボティクスデータをこの形式に変換する必要があります。

### LeRobotデータ構造

LeRobotデータセットには以下の特徴が必要です：

- **`observation.state`**: ロボットの状態（関節位置、エンドエフェクタの姿勢など）
- **`action`**: ロボットのアクション（関節コマンド、デルタ位置など）
- **`observation.images.*`**: カメラ画像（動画として保存）
- **`language_instruction`** または **`task`**: タスク説明テキスト

### 変換例

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# データセットの特徴を定義
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # 例: 6関節 + 1グリッパー
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # 高さ、幅、チャンネル
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# データセットの作成
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# データからフレームを追加
# 生データがエピソード（1回の完全なデモンストレーション）ごとに整理されており、
# 各エピソードが複数のフレームを含むと想定しています。
# 例: episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # `task`はLeRobotが内部的にエピソードをタスクごとにグループ化するための
            # 必須フィールドです。内容は通常language_instructionと同じです
            "task": frame["instruction"],
        })
    dataset.save_episode()

# データセットのファイナライズ
dataset.finalize()
```

:::tip
LeRobotの変換手順の詳細は[LeRobotドキュメント](https://github.com/huggingface/lerobot)を参照してください。
:::

### データセットディレクトリ構造

変換後のデータセットは以下の構造を持つ必要があります：

```
your_dataset_name/
├── meta/
│   ├── info.json
│   ├── episodes.jsonl
│   ├── stats.json
│   └── tasks.json
├── data/
│   └── chunk-000/
│       └── episode_000000.parquet
└── videos/
    └── chunk-000/
        └── observation.images.image/
            └── episode_000000.mp4
```

### Modality JSONファイル

トレーニングディレクトリに `modality.json` ファイルを作成し、LeRobotキーとStarVLAキーのマッピングを定義します。これは「変換テーブル」と考えてください。データセットの生のカラム名をStarVLAの統一された内部名に変換するので、異なるデータセットでもそれぞれの `modality.json` を提供するだけで同じコードで処理できます：

```json
{
    "state": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "action": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "video": {
        "camera_1": {"original_key": "observation.images.camera_1"},
        "camera_2": {"original_key": "observation.images.camera_2"}
    },
    "annotation": {
        "human.action.task_description": {"original_key": "language_instruction"}
    }
}
```

StarVLAはすべての組み込みベンチマーク用の `modality.json` ファイルを提供しています。各ベンチマークのexampleディレクトリで見つけることができます（例: `examples/LIBERO/train_files/modality.json`、`examples/SimplerEnv/train_files/modality.json`）。

## ステップ2: ロボットタイプ設定の作成

ロボットタイプ設定は、StarVLAがデータを読み取り処理する方法を定義します。`starVLA/dataloader/gr00t_lerobot/data_config.py` に新しい設定クラスを作成してください。

### 設定構造

```python
class MyRobotDataConfig:
    # 各モダリティのキーを定義
    video_keys = [
        "video.camera_1",      # observation.images.camera_1にマップ
        "video.camera_2",      # observation.images.camera_2にマップ
    ]
    state_keys = [
        "state.arm_joint",
        "state.gripper_joint",
    ]
    action_keys = [
        "action.arm_joint",
        "action.gripper_joint",
    ]
    language_keys = ["annotation.human.action.task_description"]

    # インデックス設定
    observation_indices = [0]        # 観測に使用するタイムステップ
    action_indices = list(range(8))  # アクションホライズン（8ステップ先を予測）

    def modality_config(self):
        """データ読み込みのためのモダリティ設定を定義。"""
        from starVLA.dataloader.gr00t_lerobot.datasets import ModalityConfig

        return {
            "video": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.video_keys,
            ),
            "state": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.state_keys,
            ),
            "action": ModalityConfig(
                delta_indices=self.action_indices,
                modality_keys=self.action_keys,
            ),
            "language": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.language_keys,
            ),
        }

    def transform(self):
        """データ変換を定義。"""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # 状態の変換
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # アクションの変換
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

DataConfigにおけるModalityのマッピング関係に注目してください。例えば、データセットにアーム、グリッパー、ボディ、ホイールのすべての自由度を含むstateとactionがある場合、Modalityは各インデックス範囲の意味をスライスし（`start`と`end`キーを使用）、DataConfigで再構成して整理できます。

**具体例**: ロボットが7自由度アーム + 1グリッパーを持ち、生のstateが8次元ベクトル `[j0, j1, j2, j3, j4, j5, j6, gripper]` だとします。`modality.json` では、最初の7次元（関節角度）を `"arm_joint": {"start": 0, "end": 7}`、8次元目（グリッパー状態）を `"gripper_joint": {"start": 7, "end": 8}` と分割します。これにより、StarVLAはどの次元がアーム関節で、どれがグリッパーかを認識し、それぞれに異なる正規化戦略を適用できます。

### 設定の登録

`data_config.py` の末尾にある `ROBOT_TYPE_CONFIG_MAP` に設定を追加します：

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... 既存の設定 ...
    "my_robot": MyRobotDataConfig(),
}
```

### 正規化モード

`StateActionTransform` で利用可能な正規化モード：

| モード | 説明 |
|------|-------------|
| `min_max` | 最小/最大統計を使用して[-1, 1]に正規化 |
| `q99` | 1パーセンタイルと99パーセンタイルを使用して正規化（外れ値に対してロバスト） |
| `binary` | バイナリアクション用に{-1, 1}にマッピング（例: グリッパーの開閉） |
| `rotation_6d` | 回転を6D表現に変換 |
| `axis_angle` | 回転を軸角度表現に変換 |

:::tip
StarVLAの一般的な設定では、StateまたはActionの表現として絶対関節位置を使用します。この場合、Armには `min_max`、Gripperには `binary` を使用することが一般的に推奨されます。
:::

## ステップ3: データミックスの作成

`starVLA/dataloader/gr00t_lerobot/mixtures.py` にデータセットを登録します：

```python
DATASET_NAMED_MIXTURES = {
    # ... 既存のミクスチャー ...

    # 単一データセット
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (データセットフォルダ名, サンプリング重み, ロボットタイプ設定)
    ],

    # 異なる重みの複数データセット
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # サンプリング重み半分
        ("my_dataset_task3", 2.0, "my_robot"),  # サンプリング重み2倍
    ],
}
```

### データディレクトリ構造

データは以下のように整理してください：

```
playground/Datasets/MY_DATA_ROOT/
├── my_dataset_task1/
│   ├── meta/
│   ├── data/
│   └── videos/
├── my_dataset_task2/
│   ├── meta/
│   ├── data/
│   └── videos/
└── my_dataset_task3/
    ├── meta/
    ├── data/
    └── videos/
```

## ステップ4: トレーニング設定の作成

YAML設定ファイル（例: `examples/MyRobot/train_files/starvla_my_robot.yaml`）を作成します：

```yaml
# ===== 実行設定 =====
run_id: my_robot_training           # 実験名; チェックポイントはrun_root_dir/run_id/に保存
run_root_dir: results/Checkpoints   # チェックポイント出力のルートディレクトリ
seed: 42
trackers: [jsonl, wandb]            # ログ: jsonl（ローカル）+ wandb（オンライン）
wandb_entity: your_wandb_entity     # wandbのユーザー名またはチーム
wandb_project: my_robot_project
is_debug: false                     # trueにすると最小限のデータでクイックデバッグ

# ===== モデルフレームワーク設定 =====
framework:
  name: QwenOFT                     # 選択: QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # VLMベースモデルパス
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # VLM隠れ層の次元（Qwen3-VL-4Bの場合2048）
  dino:
    dino_backbone: dinov2_vits14    # オプションの追加ビジョンエンコーダー（空間特徴用）

  action_model:
    action_model_type: DiT-B        # アクションモデルタイプ（GR00T/PIフレームワークのみDiT-B）
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # アクション次元 = ロボットの関節数（例: 7関節 x 2腕 = 14）
    state_dim: 14                   # 状態次元、通常はaction_dimと同じ
    future_action_window_size: 15   # モデルが予測する将来のステップ数（アクションチャンク長 - 1）
    action_horizon: 16              # 総アクションシーケンス長 = future + 1（現在のステップ）
    past_action_window_size: 0      # 履歴アクションウィンドウ（0 = 履歴なし）
    repeated_diffusion_steps: 8     # トレーニング中の拡散サンプリング繰り返し（GR00T/PIのみ）
    num_inference_timesteps: 4      # 推論時の拡散ステップ数（少ない = 速いが精度低下）
    num_target_vision_tokens: 32    # VLMから圧縮されたビジョントークン数
    # DiT Transformerの内部設定（通常変更不要）:
    diffusion_model_cfg:
      cross_attention_dim: 2048     # VLMのhidden_dimと一致させる
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== データセット設定 =====
datasets:
  # VLMデータ（オプション、共同トレーニング時のみ必要）
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # qwen_data_config.pyで登録したデータセット名
    per_device_batch_size: 4

  # VLAデータ（ロボット操作データ、必須）
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # データセットのルートディレクトリ
    data_mix: my_dataset            # mixtures.pyで登録したミクスチャー名
    action_type: abs_qpos           # アクションタイプ: abs_qpos = 絶対関節位置（目標角度値）
    default_image_resolution: [3, 224, 224]  # [チャンネル、高さ、幅]
    per_device_batch_size: 16
    load_all_data_for_training: true # 起動時にすべてのトレーニングデータをメモリにロード（トレーニング高速化、ただしRAM使用量増加）
    obs: ["image_0"]                # 使用するカメラ（image_0 = DataConfigのvideo_keysリストの最初のカメラ）
    image_size: [224,224]
    video_backend: torchvision_av   # 動画デコードバックエンド（torchvision_avまたはdecord）

# ===== トレーナー設定 =====
trainer:
  epochs: 100
  max_train_steps: 100000           # 最大トレーニングステップ（エポックに関係なくここで停止）
  num_warmup_steps: 5000            # 学習率ウォームアップステップ
  save_interval: 5000               # Nステップごとにチェックポイントを保存
  eval_interval: 100                # Nステップごとにバリデーションセットで評価

  # モジュールごとの学習率: 異なるコンポーネントに異なる学習率を設定可能
  learning_rate:
    base: 1e-05                     # デフォルトLR（以下で指定されていないモジュールに使用）
    qwen_vl_interface: 1.0e-05      # VLMバックボーンのLR
    action_model: 1.0e-04           # アクションヘッドのLR（スクラッチからのトレーニングのため高め）

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # コサイン減衰の最小LR

  freeze_modules: ''                # フリーズするモジュールパス（空 = すべてトレーニング可能）
  loss_scale:
    vla: 1.0                        # VLA損失の重み
    vlm: 0.1                        # VLM損失の重み（共同トレーニング用）
  repeated_diffusion_steps: 4       # トレーニング時の拡散サンプリング繰り返し（action_modelの値をオーバーライド）
  max_grad_norm: 1.0                # 勾配クリッピングの閾値
  gradient_accumulation_steps: 1    # GPUメモリ不足の場合は増加

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[action_dimとstate_dimについて]
これらの値はロボットのハードウェアに依存します。例：
- 7関節 + 1グリッパーのシングルアーム → `action_dim: 8`、`state_dim: 8`
- 各7関節のデュアルアーム → `action_dim: 14`、`state_dim: 14`
- BEHAVIOR R1Proヒューマノイド → `action_dim: 23`、`state_dim: 23`

DataConfigで定義したアクション/ステートキーの合計次元と一致させる必要があります。
:::

| フレームワーク | アクションヘッド | 適した用途 |
|-----------|-------------|----------|
| `QwenOFT` | MLP | 高速推論、シンプルなタスク |
| `QwenGR00T` | Flow-matching DiT | 複雑な操作、高精度 |
| `QwenFast` | 離散トークン | トークンベースのアクション予測 |
| `QwenPI` | 拡散 | マルチモーダルアクション分布 |

コミュニティがサポートするモデルも選択できます。これらはBaseFrameworkを共有しており、設定を変更するだけで適応できます。

## ステップ5: トレーニングの実行

トレーニングスクリプト（例: `examples/MyRobot/train_files/run_train.sh`）を作成します：

```bash
#!/bin/bash

# ========== 必須パラメータ ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # トレーニング設定ファイル（必須）

# ========== オプションのオーバーライド（CLIがYAMLの値より優先） ==========
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# 出力ディレクトリの作成
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# トレーニングの起動
# --config_yamlが唯一の必須引数です。その他の--xxxフラグはオプションのCLIオーバーライドです。
# YAMLファイルですべてを設定済みの場合、以下のオーバーライドフラグは省略可能です。
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  --framework.name ${Framework_name} \
  --framework.qwenvl.base_vlm ${base_vlm} \
  --datasets.vla_data.data_root_dir ${data_root} \
  --datasets.vla_data.data_mix ${data_mix} \
  --datasets.vla_data.per_device_batch_size 4 \
  --trainer.max_train_steps 100000 \
  --trainer.save_interval 10000 \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id}
```

### マルチノードトレーニング

マルチノード分散トレーニングの場合：

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes ${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  # ... その他の引数
```
