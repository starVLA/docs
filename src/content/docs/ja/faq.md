---
title: よくある質問
description: StarVLAの設計方針やトレーニングワークフローに関するよくある質問。
---

### なぜ前処理をデータローダーに入れないのですか？

プロファイリングではデータ前処理は全体の1%未満の時間しかかかりません。Framework内に前処理を保持することで、モデル固有の処理がデータローダーに影響を与えることなく実現できます。

### Qwen2.5-VL以外のバックボーンを使用できますか？

はい。新しいビジョンモジュールと言語モジュールを実装し、Framework内で組み合わせてください。Frameworkが生のアクションデータを処理するため、バックボーンの入れ替えは容易です。

### ビジョンタワーの抽象インターフェースがないのはなぜですか？

VLMをベースモデルとして使用し、VLMには独自のネイティブビジョンタワーが含まれることを想定しているため、追加の抽象インターフェースは不要です。

### ターミナルからパラメータをオーバーライドまたは追加できますか？

はい。StarVLAは `OmegaConf.load(args.config_yaml)` を単一の設定エントリとして使用します。CLIから値をオーバーライドできます：

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module` はグローバル設定にキーを追加するだけで、その動作はFrameworkの実装で定義されます。

### パラメータでVLMをフリーズできますか？

はい。モジュールパスをカンマ区切りのリストで指定してください：

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

ヒント: `print(your_model)` を実行してモジュールパスを確認してください。実装は `TrainerUtils.freeze_backbones` にあります。

### モジュールごとに異なる学習率を設定できますか？

はい。モジュールごとの辞書を使用してください：

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

詳細は `trainer_tools.build_param_lr_groups` を参照してください。

### チェックポイントからトレーニングを再開できますか？

はい。設定で最新のチェックポイントパスを指定してください：

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

`reload_modules` を空にするとモデル全体がロードされます。StarVLAはAcceleratorのチェックポイント機構を使用して、オプティマイザの状態、学習率スケジューラ、その他のトレーニング状態を完全に保存・復元するため、トレーニングがシームレスに再開されます。

### より小さなVLMでトレーニングする

Florence-2を使用する例：

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes=${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.name QwenGR00T \
  --framework.qwenvl.base_vlm microsoft/Florence-2-large \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id} \
  --wandb_project your_project \
  --wandb_entity your_name
```

注意: `--framework.qwenvl` は互換性のため、将来のリリースで統一される予定です。

### GPU 1台でトレーニングできますか？

はい。`--num_processes` を1に設定し、`per_device_batch_size` を小さくし（例: 1-2）、`gradient_accumulation_steps` を増やして補ってください。1 GPU でのトレーニングはかなり遅くなりますが、完全に動作します。より小さなモデル（例: Qwen2.5-VL-3B）から始めることをお勧めします。

### トレーニングにはどのくらい時間がかかりますか？

データセットのサイズ、GPU数、モデルの規模によります。参考値：
- **8xA800 + Qwen2.5-VL-3B + Bridgeデータセット**: 50kステップで約10-20時間。
- **1xRTX 4090 + Qwen2.5-VL-3B + 小規模データセット**: 数日かかる場合があります。

まず `is_debug: true` で数百ステップの簡易動作確認を行い、その後フルトレーニングを開始することをお勧めします。

### トレーニングをどのように監視しますか？

StarVLAは2つのログ方法をサポートしています（YAML設定の `trackers` フィールドで指定）：

- **jsonl**: トレーニングログがチェックポイントディレクトリの `log.jsonl` ファイルにJSON Lines形式で保存されます。スクリプトで解析・プロットできます。
- **wandb**: リアルタイムのオンラインモニタリング。設定に `wandb_entity` と `wandb_project` を記入すると、トレーニング開始後にメトリクス（損失曲線、学習率など）が自動的に [wandb.ai](https://wandb.ai) にアップロードされます。

両方を有効にすることをお勧めします: `trackers: [jsonl, wandb]`。
