---
title: 評価フレームワーク
description: StarVLAの標準化された推論パイプライン。実ロボットまたはシミュレーション評価に対応。
---

## 概要

StarVLAは、WebSocket（クライアントとサーバー間の双方向リアルタイム通信を可能にするネットワークプロトコル）を通じてデータをトンネリングすることで、実ロボットまたはシミュレーション評価の推論パイプラインを標準化しています。これにより、新しいモデルを最小限の変更で既存の評価環境に統合できます。

---

## アーキテクチャ

StarVLAフレームワークは、**クライアント-サーバーアーキテクチャ**を使用して、評価・デプロイ環境（クライアント）とポリシーサーバー（モデル推論）を分離しています。

:::note[クライアントとサーバーを分離する理由]
モデル推論とシミュレーション/実ロボット環境は、通常異なるまたは競合するPythonパッケージバージョン（例: 異なるnumpyやtorchのバージョン）に依存しています。2つの独立したプロセスに分割することで、それぞれが干渉なく独自のconda環境を使用できます。実際には、サーバーとクライアントを2つの別々のターミナルで起動します。
:::

- **ポリシーサーバー**: モデルをロードし、観測を受信し、正規化されたアクションを出力します。
- **クライアント**: シミュレーターまたは実ロボットとインターフェースし、モデル出力を後処理します：
  - **非正規化**: モデルの[-1, 1]正規化アクションを物理量（例: 関節角度）に変換します。
  - **デルタから絶対値へ**: モデルが現在位置に対する相対的な増分アクションを出力する場合、現在の状態に加算して絶対的な目標位置を取得します。
  - **アクションアンサンブル**: モデルは複数の将来のステップを一度に予測する場合があります。連続する呼び出しからの重複する予測を加重平均して、よりスムーズな実行を実現します。

![ポリシーサーバーアーキテクチャ](../../../../assets/starVLA_PolicyServer.png)

### コンポーネントの説明

| コンポーネント | 説明 |
|-----------|-------------|
| Sim / Real Controller | StarVLAの外部: 評価環境またはロボットコントローラーのコアループを含み、観測の収集（`get_obs()`）とアクションの実行（`apply_action()`）を処理します。 |
| PolicyClient.py & WebSocket & PolicyServer | 標準通信フロー: データ伝送（トンネリング）と環境とサーバーのインターフェースを担当するクライアント側ラッパー。 |
| Framework.py | モデル推論コア: ユーザー定義のモデル推論関数（`Framework.predict_action`）を含み、アクション生成のメインロジックです。 |

---

## データプロトコル

最小限の疑似コード例（評価側クライアント）：

```python
# インポートパス: from deployment.policy_client.policy_client import WebsocketClientPolicy
import WebsocketClientPolicy

client = WebsocketClientPolicy(
    host="127.0.0.1",
    port=10092
)

while True:
    images = capture_multiview()          # returns List[np.ndarray]
    lang = get_instruction()              # may come from task scripts
    example = {
        "image": images,
        "lang": lang,
    }

    result = client.predict_action(example)  # --> forwarded to framework.predict_action
    action = result["normalized_actions"][0] # take the first item in the batch
    apply_action(action)
```

モデルサーバーについては、以下のコマンドで起動するだけです：

```bash
#!/bin/bash
export PYTHONPATH=$(pwd):${PYTHONPATH}

# StarVLAのconda Pythonを指定
# $(which python) は現在アクティブなconda環境のPythonを自動的に取得します
# このスクリプトを実行する前に `conda activate starVLA` を実行していることを確認してください
export star_vla_python=$(which python)
your_ckpt=results/Checkpoints/xxx.pt   # チェックポイントパスに置き換えてください
gpu_id=0
port=5694

# export DEBUG=true
CUDA_VISIBLE_DEVICES=$gpu_id ${star_vla_python} deployment/model_server/server_policy.py \
    --ckpt_path ${your_ckpt} \
    --port ${port} \
    --use_bf16
```

### 注意事項

- `example` のすべてのフィールドがJSON直列化可能または変換可能であること（リスト、浮動小数点、整数、文字列）を確認してください。カスタムオブジェクトは明示的に変換してください。
- 画像は `np.ndarray` として送信する必要があります。送信前に `PIL.Image -> np.ndarray` 変換を行い、必要に応じてサーバー側で `to_pil_preserve`（`from starVLA.model.utils import to_pil_preserve`）を使用してPILに戻してください。
- 補助メタデータ（エピソードID、タイムスタンプなど）は専用のキーに保持し、Frameworkが衝突なく転送またはログに記録できるようにしてください。

---

## PolicyClientインターフェース設計

![ポリシーインターフェース](../../../../assets/starVLA_PolicyInterface.png)

`*2model_interface.py` インターフェースは、シミュレーションまたは実世界の環境から生じるあらゆるバリエーションをラップし抽象化するように設計されています。また、デルタアクションから絶対的な関節位置への変換などのユーザー定義コントローラーもサポートしています。各ベンチマークの実装は `examples` を参照して、独自のデプロイを構築してください。

---

## FAQ

**Q: なぜexamplesに `model2{bench}_client.py` のようなファイルがあるのですか？**

A: ベンチマーク固有の調整（アクションアンサンブル、デルタアクションから絶対アクションへの変換、シミュレーター固有の問題への対応など）をカプセル化しており、モデルサーバーを汎用的に保つためです。

**Q: なぜモデルはPIL画像を期待するのに、転送では `ndarray` を使うのですか？**

A: WebSocketペイロードはPILオブジェクトを直接シリアライズできません。クライアント側で `np.ndarray` に変換し、モデルが必要とする場合はFramework内でPILに戻してください。

環境固有のニーズに関するフィードバックはIssueにてお待ちしています。
