---
title: BEHAVIOR-1K 평가
description: BEHAVIOR-1K 벤치마크에서 StarVLA 프레임워크를 실행합니다.
---

:::caution[작성 중]
이 문서는 현재 활발히 작성 중입니다.
:::

**BEHAVIOR-1K**는 Stanford에서 만든 가정용 태스크 시뮬레이션 벤치마크로, 1000가지 일상 활동(요리, 청소, 정리 등)을 포함합니다. [2025 BEHAVIOR Challenge](https://behavior.stanford.edu/challenge/index.html) 구조를 따라 50개의 전체 가정용 태스크에 대해 학습 및 평가합니다. R1Pro 휴머노이드 로봇(양팔 + 베이스 + 몸통, 23차원 액션 공간)을 사용합니다.

평가 과정은 크게 두 부분으로 구성됩니다:

1. `behavior` 환경 및 의존성 설정.
2. `starVLA`와 `behavior` 환경 모두에서 서비스를 시작하여 평가 실행.

:::note[왜 두 개의 터미널이 필요한가요?]
모델 추론(starVLA 환경)과 시뮬레이션(behavior 환경)은 서로 다른 Python 패키지 버전에 의존하며, 같은 conda 환경에 설치하면 충돌이 발생합니다. 별도의 터미널에서 별도의 conda 환경으로 실행하면 이를 피할 수 있습니다.
:::

:::note[GPU 요구사항]
BEHAVIOR의 시뮬레이터(OmniGibson)는 렌더링에 **하드웨어 레이 트레이싱(RT Cores)**이 필요합니다. 다음 GPU는 **사용할 수 없습니다**: A100, H100(RT Cores가 없음).

**권장**: RTX 3090, RTX 4090 또는 기타 GeForce RTX / Quadro RTX 시리즈 GPU.

자세한 내용은 [이 이슈](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1872#issuecomment-3455002820) 및 [이 토론](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1875#issuecomment-3444246495)을 참조하세요.
:::

---

## BEHAVIOR 평가

### 1. 환경 설정

`behavior` conda 환경 설정 방법:

```bash
git clone https://github.com/StanfordVL/BEHAVIOR-1K.git
conda create -n behavior python=3.10 -y
conda activate behavior
cd BEHAVIOR-1K
pip install "setuptools<=79"
# --omnigibson: OmniGibson 시뮬레이터 설치 (BEHAVIOR의 물리 엔진)
# --bddl: BDDL 설치 (태스크 정의를 위한 Behavior Domain Definition Language)
# --joylo: JoyLo 설치 (원격 조작 제어 인터페이스)
# --dataset: BEHAVIOR 데이터셋 에셋 다운로드 (씬, 오브젝트 모델 등)
./setup.sh --omnigibson --bddl --joylo --dataset
conda install -c conda-forge libglu
pip install rich omegaconf hydra-core msgpack websockets av pandas google-auth
```

starVLA 환경에서도 다음을 설치합니다:

```bash
pip install websockets
```

---

### 2. 평가 워크플로우

단계:
1. 체크포인트 다운로드
2. 필요에 따라 아래 스크립트 선택

#### (A) 병렬 평가 스크립트

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval.sh
```

`start_parallel_eval.sh`를 실행하기 전에 다음 경로를 설정하세요:
- `star_vla_python`: StarVLA 환경의 Python 인터프리터
- `sim_python`: Behavior 환경의 Python 인터프리터
- `TASKS_JSONL_PATH`: [학습 데이터셋](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos)에서 다운로드한 태스크 설명 파일 (`examples/Behavior/tasks.jsonl`에 포함)
- `BEHAVIOR_ASSET_PATH`: behavior 에셋 경로의 로컬 경로 (`./setup.sh`로 설치 시 기본값은 `BEHAVIOR-1K/datasets`)

#### (B) 별도 터미널에서 디버깅

디버깅을 용이하게 하기 위해, 클라이언트(평가 환경)와 서버(정책)를 두 개의 별도 터미널에서 시작할 수도 있습니다:

```bash
bash examples/Behavior/start_server.sh
bash examples/Behavior/start_client.sh
```

위의 디버깅 파일은 학습 세트에 대해 평가를 수행합니다.

#### (C) 태스크별 평가 (메모리 안전)

메모리 오버플로우를 방지하기 위해 `start_parallel_eval_per_task.sh`도 구현했습니다:

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval_per_task.sh
```

- 스크립트는 `INSTANCE_NAMES`의 각 태스크에 대해 순차적으로 평가를 실행합니다
- 각 태스크에 대해 `TEST_EVAL_INSTANCE_IDS`의 모든 인스턴스를 GPU에 분배합니다
- 이전 태스크가 완료될 때까지 기다린 후 다음 태스크를 진행합니다

---

## 참고사항

### 래퍼 유형

1. **RGBLowResWrapper**: RGB만 시각 관찰로 사용하며 카메라 해상도 224x224입니다. 저해상도 RGB만 사용하면 시뮬레이터 속도를 높이고 평가 시간을 줄일 수 있습니다. 이 래퍼는 표준 트랙에서 사용 가능합니다.

2. **DefaultWrapper**: 데이터 수집 시 사용된 기본 관찰 설정의 래퍼입니다(RGB + depth + segmentation, 헤드 카메라 720p 및 손목 카메라 480p). 이 래퍼는 표준 트랙에서 사용 가능하지만, RGBLowResWrapper에 비해 평가가 상당히 느립니다.

3. **RichObservationWrapper**: normal, flow 등의 추가 관찰 모달리티와 특권 태스크 정보를 로드합니다. 이 래퍼는 특권 정보 트랙에서만 사용할 수 있습니다.

### 액션 차원

BEHAVIOR의 액션 차원 = 23:

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

### 동영상 저장

동영상은 `{task_name}_{idx}_{epi}.mp4` 형식으로 저장되며, 여기서 `idx`는 인스턴스 번호, `epi`는 에피소드 번호입니다.

### 일반적인 문제

**Segmentation fault (core dumped):** Vulkan이 성공적으로 설치되지 않았을 가능성이 높습니다. [이 링크](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)를 확인하세요.

**ImportError: libGL.so.1: cannot open shared object file:**
```bash
apt-get install ffmpeg libsm6 libxext6 -y
```
