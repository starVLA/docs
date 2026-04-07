---
title: 평가 프레임워크
description: 실제 로봇 또는 시뮬레이션 평가를 위한 StarVLA 표준 추론 파이프라인입니다.
---

## 개요

StarVLA는 WebSocket(클라이언트와 서버 간 양방향 실시간 통신을 가능하게 하는 네트워크 프로토콜)을 통해 데이터를 터널링하여 실제 로봇 또는 시뮬레이션 평가를 위한 추론 파이프라인을 표준화합니다. 이를 통해 새로운 모델을 최소한의 변경으로 기존 평가 환경에 통합할 수 있습니다.

---

## 아키텍처

StarVLA 프레임워크는 **클라이언트-서버 아키텍처**를 사용하여 평가/배포 환경(클라이언트)과 정책 서버(모델 추론)를 분리합니다.

:::note[왜 클라이언트와 서버를 분리하나요?]
모델 추론과 시뮬레이션/실제 로봇 환경은 일반적으로 서로 다르거나 충돌하는 Python 패키지 버전(예: 서로 다른 numpy나 torch 버전)에 의존합니다. 두 프로세스를 독립적으로 분리하면 각각 자체 conda 환경을 사용하여 간섭 없이 실행할 수 있습니다. 실제로는 서버와 클라이언트를 별도의 두 터미널에서 시작하게 됩니다.
:::

- **정책 서버**: 모델을 로드하고, 관찰을 수신하며, 정규화된 액션을 출력합니다.
- **클라이언트**: 시뮬레이터 또는 실제 로봇과 인터페이스하며, 모델 출력을 후처리합니다:
  - **역정규화**: 모델의 [-1, 1] 정규화된 액션을 물리량(예: 관절 각도)으로 변환합니다.
  - **델타-절대값 변환**: 모델이 현재 위치 대비 증분 액션을 출력하는 경우, 현재 상태에 더하여 절대 목표 위치를 구합니다.
  - **액션 앙상블**: 모델이 여러 미래 스텝을 한 번에 예측할 수 있으며, 연속 호출에서 겹치는 예측을 가중 평균하여 더 부드럽게 실행합니다.

![정책 서버 아키텍처](../../../../assets/starVLA_PolicyServer.png)

### 컴포넌트 설명

| 컴포넌트 | 설명 |
|-----------|-------------|
| Sim / Real Controller | StarVLA 외부: 평가 환경이나 로봇 컨트롤러의 핵심 루프를 포함하며, 관찰 수집(`get_obs()`)과 액션 실행(`apply_action()`)을 처리합니다. |
| PolicyClient.py & WebSocket & PolicyServer | 표준 통신 흐름: 데이터 전송(터널링)을 담당하고 환경과 서버를 연결하는 클라이언트 측 래퍼입니다. |
| Framework.py | 모델 추론 핵심: 사용자 정의 모델 추론 함수(`Framework.predict_action`)를 포함하며, 액션 생성의 주요 로직입니다. |

---

## 데이터 프로토콜

최소 의사 코드 예시(평가 측 클라이언트):

```python
# 임포트 경로: from deployment.policy_client.policy_client import WebsocketClientPolicy
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

모델 서버의 경우, 다음과 같이 시작합니다:

```bash
#!/bin/bash
export PYTHONPATH=$(pwd):${PYTHONPATH}

# StarVLA conda Python을 지정합니다
# $(which python)은 현재 활성화된 conda 환경의 Python을 자동으로 가져옵니다
# 이 스크립트를 실행하기 전에 `conda activate starVLA`를 실행했는지 확인하세요
export star_vla_python=$(which python)
your_ckpt=results/Checkpoints/xxx.pt   # 체크포인트 경로로 교체하세요
gpu_id=0
port=5694

# export DEBUG=true
CUDA_VISIBLE_DEVICES=$gpu_id ${star_vla_python} deployment/model_server/server_policy.py \
    --ckpt_path ${your_ckpt} \
    --port ${port} \
    --use_bf16
```

### 참고사항

- `example`의 모든 필드가 JSON 직렬화 가능하거나 변환 가능한지 확인하세요(리스트, float, int, 문자열). 커스텀 객체는 명시적으로 변환하세요.
- 이미지는 `np.ndarray`로 전송해야 합니다. 전송 전에 `PIL.Image -> np.ndarray` 변환을 수행하고, 서버에서 필요한 경우 `to_pil_preserve`(`from starVLA.model.utils import to_pil_preserve`)를 사용하여 다시 변환하세요.
- 보조 메타데이터(에피소드 ID, 타임스탬프 등)는 전용 키에 보관하여 프레임워크가 충돌 없이 전달하거나 로깅할 수 있도록 하세요.

---

## PolicyClient 인터페이스 설계

![정책 인터페이스](../../../../assets/starVLA_PolicyInterface.png)

`*2model_interface.py` 인터페이스는 시뮬레이션 또는 실제 환경에서 발생하는 모든 변형을 래핑하고 추상화하도록 설계되었습니다. 또한 델타 액션을 절대 관절 위치로 변환하는 등 사용자 정의 컨트롤러도 지원합니다. `examples`에 있는 다양한 벤치마크의 구현을 참고하여 자체 배포 환경을 구축할 수 있습니다.

---

## 자주 묻는 질문

**Q: 왜 examples에 `model2{bench}_client.py` 같은 파일이 있나요?**

A: 이 파일들은 벤치마크별 맞춤 처리를 캡슐화합니다. 예를 들어 액션 앙상블, 델타 액션을 절대 액션으로 변환, 시뮬레이터 특이점 처리 등이 포함되어 있어 모델 서버가 범용으로 유지될 수 있습니다.

**Q: 왜 모델은 PIL 이미지를 기대하지만 전송에는 `ndarray`를 사용하나요?**

A: WebSocket 페이로드는 PIL 객체를 직접 직렬화할 수 없습니다. 클라이언트 측에서 `np.ndarray`로 변환하고, 모델이 필요한 경우 프레임워크 내부에서 PIL로 복원하세요.

환경별 요구사항에 대한 피드백은 이슈를 통해 환영합니다.
