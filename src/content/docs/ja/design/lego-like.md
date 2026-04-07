---
title: レゴ式設計
description: StarVLAを簡単に拡張・デバッグできるモジュラー設計原則。
---

## サブモジュールのスモークテスト

StarVLAはモジュラーなモデル設計を重視しています。主要なFrameworkファイルはそれぞれ実行可能で、高速なデバッグとスモークテストが行えます：

```bash
# モデル（設定ファイルの場所: starVLA/config/training/starvla_cotrain_oxe.yaml）
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# データローダー
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**設計ルール:** `starVLA/model/framework/<your_framework>.py` はモデルの単一の外部APIサーフェスです。論文のフレームワーク図と対応するように設計してください。

## 明確なモデル境界

StarVLAはトップダウン分解と高凝集・低結合（各モジュールが自身の責務を担い、モジュール間で干渉しない）の原則に従っています。データローダーは、モデル固有の前処理を含まない、生のモデル非依存な辞書を返す必要があります。

一般的なサンプルには以下が含まれます：

- `image`: `list[PIL.Image] | np.ndarray` -- カメラ画像（1つまたは複数の視点）
- `lang`: `str` -- 自然言語によるタスク指示（例: "赤いブロックを箱に入れて"）
- `action`: `np.ndarray[T, action_dim]` -- ロボットアクションのシーケンス（Tステップ、各ステップにaction_dim個の関節値）
- `state`: `Optional[np.ndarray[..., state_dim]]` -- ロボットの現在のセンサー読み取り値（例: 関節角度、エンドエフェクタ位置、オプション）

`framework.forward()` と `framework.predict_action()` はどちらも生の入力に対して直接動作します。これにより、学習/テストの境界が明確になり、カスタマイズが容易になります。

## 柔軟な設定システム

StarVLAはOmegaConf（コマンドラインからの設定値のオーバーライドをサポートするYAML設定管理ライブラリ）を利用した単一のグローバル設定オブジェクトを使用します。パラメータは拡張可能な辞書で渡され、オーバーライドと制御された冗長性が可能です。

例（CLIによるオーバーライド）：

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**注意:** `framework.action_model.new_module` はグローバル設定にキーを追加するだけです。その動作はFrameworkの実装で定義されます。

## 新しいFrameworkの追加方法

独自のモデルアーキテクチャを統合したい場合、3つのステップだけです：

1. **Frameworkファイルを作成**: `starVLA/model/framework/` に `YourFramework.py` を追加し、基底クラスを継承して `forward()` と `predict_action()` メソッドを実装します。
2. **スモークテストを記述**: ファイルの末尾に `if __name__ == "__main__":` エントリポイントを追加し、フェイクデータでフォワードパスとアクション予測が正常に動作することを確認します。
3. **設定に登録**: トレーニングYAML設定で `framework.name: YourFramework` を設定し、既存のトレーニングと評価パイプラインに接続します。

`QwenGR00T.py` や `QwenOFT.py` をテンプレートとして使用してください。
