---
title: 评测框架
description: StarVLA 标准化推理流程，用于真实机器人或仿真评测。
---

## 概述

StarVLA 通过 WebSocket 隧道传输数据，标准化了真实机器人或仿真评测的推理流程，使新模型能够以最小的改动集成到现有评测环境中。

---

## 架构

StarVLA 框架使用客户端-服务器架构，将评测/部署环境（客户端）与策略服务器（模型）分离。其中策略服务器（模型）负责推理模型，而在客户端进行包括 unnormalize / delta-to-absolute / action ensemble 等内容。

![策略服务器架构](../../../../assets/starVLA_PolicyServer.png)

### 组件说明

| 组件 | 描述 |
|------|------|
| Sim / Real Controller | StarVLA 外部：包含评测环境或机器人控制器的核心循环，处理观测收集（`get_obs()`）和动作执行（`apply_action()`）。 |
| PolicyClient.py & WebSocket & PolicyServer | 标准通信流程：客户端包装器，负责数据传输（隧道）并将环境与服务器对接。 |
| Framework.py | 模型推理核心：包含用户定义的模型推理函数（`Framework.predict_action`），是生成动作的主要逻辑。 |

---

## 数据协议

最小化伪代码示例（评测端客户端）：

```python
import WebsocketClientPolicy

client = WebsocketClientPolicy(
    host="127.0.0.1",
    port=10092
)

while True:
    images = capture_multiview()          # 返回 List[np.ndarray]
    lang = get_instruction()              # 可能来自任务脚本
    example = {
        "image": images,
        "lang": lang,
    }

    result = client.predict_action(example)  # --> 转发到 framework.predict_action
    action = result["normalized_actions"][0] # 取批次中的第一项
    apply_action(action)
```

而对于 Model Server 只需要通过：

```bash
#!/bin/bash
export PYTHONPATH=$(pwd):${PYTHONPATH} # let LIBERO find the websocket tools from main repo
export star_vla_python=/root/miniconda3/envs/starvla/bin/python
your_ckpt=results/Checkpoints/xxx.pt
gpu_id=0
port=5694
################# star Policy Server ######################

# export DEBUG=true
CUDA_VISIBLE_DEVICES=$gpu_id ${star_vla_python} deployment/model_server/server_policy.py \
    --ckpt_path ${your_ckpt} \
    --port ${port} \
    --use_bf16
```

启动即可。

### 注意事项

- 确保 `example` 中的每个字段都是 JSON 可序列化或可转换的（列表、浮点数、整数、字符串）；需要显式转换自定义对象。
- 图像必须以 `np.ndarray` 发送。在传输前执行 `PIL.Image -> np.ndarray` 转换，如果模型需要，在服务器端转换回 PIL（`to_pil_preserve`）。
- 将辅助元数据（episode ID、时间戳等）保存在专用键中，以便框架可以转发或记录它们而不会产生冲突。

---

## PolicyClient 接口设计

![策略接口](../../../../assets/starVLA_PolicyInterface.png)

`*2model_interface.py` 接口旨在封装和抽象来自仿真或真实环境的任何变化。它还支持用户定义的控制器，例如将增量动作转换为绝对关节位置。你可以参考 `examples` 里面对于不同 Benchmark 的实现，来实现你的部署。

---

## 常见问题

**Q：为什么示例中包含 `model2{bench}_client.py` 这样的文件？**

A：它们封装了基准测试特定的对齐，例如动作集成、将增量动作转换为绝对动作、或桥接仿真器的特殊行为，使模型服务器可以保持通用。

**Q：为什么模型期望 PIL 图像而传输使用 `ndarray`？**

A：WebSocket 有效负载无法直接序列化 PIL 对象。在客户端转换为 `np.ndarray`，如果模型需要，在框架内部恢复为 PIL。

欢迎通过 issues 提供关于环境特定需求的反馈。
