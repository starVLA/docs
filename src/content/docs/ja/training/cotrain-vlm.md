---
title: VLMデータとの共同トレーニング
description: VLM（Vision-Language Model）データを統合してStarVLAフレームワークを共同トレーニングする方法。
---

このガイドでは、VLM（Vision-Language Model）データを統合してStarVLA（Vision-Language-Action）フレームワークを共同トレーニングするプロセスを説明します。

**なぜ共同トレーニングするのか？** ロボット操作データのみでVLAをトレーニングすると、VLMバックボーンの視覚・言語理解能力が劣化する可能性があります。これは「壊滅的忘却」として知られています。ロボットデータだけでトレーニングすると、モデルは画像の解釈、質問への回答、複雑な指示の理解を忘れてしまう可能性があります。VLMデータ（画像QA、キャプショニングなど）を混合することで、ロボット制御を学習しながらモデルの一般的な理解力を維持します。

---

## 1. マルチモーダルデータの準備

VLMデータは[QwenVL Conversations JSONデータ構造](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune)に準拠する必要があります。

### 必須フォーマット

各データインスタンスは、**画像ファイルパス**と**人間-GPTの会話ターン**のリストをリンクするJSONオブジェクトです。

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
            // <image>はモデルに「ここに画像を挿入」と伝えるプレースホルダーです。
            // 実際の画像パスは外側の"image"フィールドで指定されます
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### クイックスタート

サンプルデータセット[LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO)をダウンロードできます。

`sharegpt4v_coco.zip` を解凍し、`playground/Datasets/LLaVA-OneVision-COCO` に配置してください。

結果として以下のファイル構造になります：

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. VLMデータセットの設定

カスタムVLMデータセットを追加するには、以下の手順に従ってください：

### 2.1 データセットの登録（Python）

`starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py` の `data_dict` にデータセットを追加して登録します：

```python
# 登録例
# json_rootとimage_rootはこのファイルの先頭で定義されており、
# デフォルトでplayground/Datasets/LLaVA-OneVision-COCO/以下のサブディレクトリになります:
#   json_root = "playground/Datasets/LLaVA-OneVision-COCO/llava_jsons"
#   image_root = "playground/Datasets/LLaVA-OneVision-COCO/images"

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # YAML設定でこの名前を使用
}
```

### 2.2 トレーニングYAMLの更新

トレーニングYAMLファイル（`your_train_config.yaml`）にVLMデータセット設定を含めます：

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # 2.1で登録した名前と一致させる
```

**ヒント:** VLMデータローダーを以下のコマンドで確認できます：

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. トレーニングの実行

VLMデータのみでトレーニングするか、VLAデータと*共同トレーニング*するかに応じて、適切なスクリプトを選択してください。

:::tip[選択方法]
- **VLMのみをファインチューニングしたい場合**（例: ロボットアクションなしのドメイン固有の画像テキストデータでファインチューニング）、**オプションA**を選択してください。
- **ロボットデータがあり、両方を同時にトレーニングしたい場合**（壊滅的忘却を防止しながら、モデルにロボット制御と視覚言語理解の両方を学習させる）、**オプションB**を選択してください。
:::

### オプションA: VLMデータのみでトレーニング

VLM固有の事前学習またはファインチューニングに使用します。

**スクリプト:** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### オプションB: VLMデータとVLAの共同トレーニング

ロボティクス（VLA）とマルチモーダル（VLM）データの両方で同時にモデルをトレーニングします。

**スクリプト:** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
