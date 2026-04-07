---
title: LIBERO 평가
description: LIBERO에서의 StarVLA 실험 결과를 재현합니다(설정, 평가 워크플로우, 학습 참고사항).
---

**LIBERO**는 4개의 태스크 세트(Spatial, Object, Goal, Long Horizon)로 구성된 테이블탑 로봇 조작 벤치마크로, 총 40개의 태스크가 있습니다. Franka 로봇 팔을 사용하여 VLA 모델의 공간 이해, 객체 인식, 목표 추론, 장기 조작 능력을 테스트합니다.

이 문서는 LIBERO에서의 **실험 결과 재현** 방법을 안내합니다.
평가 과정은 크게 두 부분으로 구성됩니다:

1. `LIBERO` 환경 및 의존성 설정.
2. `starVLA`와 `LIBERO` 환경 모두에서 서비스를 시작하여 평가 실행.

이 워크플로우는 **NVIDIA A100** 및 **RTX 4090** GPU에서 정상 작동이 확인되었습니다.

---

## LIBERO 평가

### 0. 체크포인트 다운로드

커뮤니티 평가를 용이하게 하기 위해 Hugging Face에 사전 학습된 체크포인트를 제공합니다: [🤗 StarVLA/bench-libero](https://huggingface.co/collections/StarVLA/libero). 해당 LIBERO 결과는 아래 표에 요약되어 있습니다.

#### 실험 결과

| 모델                | 스텝 | 에포크 | Spatial | Object | Goal | Long | 평균  |
|----------------------|-------|--------|---------|--------|------|------|------|
| $\pi_0$+FAST         | -     | -      | 96.4    | 96.8   | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT          | 175K  | 223    | 97.6    | 98.4   | 97.9 | 94.5 | 97.1 |
| $\pi_0$              | -     | -      | 96.8    | 98.8   | 95.8 | 85.2 | 94.1 |
| GR00T-N1.5           | 20K   | 203    | 92.0    | 92.0   | 86.0 | 76.0 | 86.5 |
| **Qwen2.5-VL-FAST**  | 30K   | 9.54   | 97.3    | 97.2   | 96.1 | 90.2 | 95.2 |
| **Qwen2.5-VL-OFT**   | 30K   | 9.54   | 97.4    | 98.0   | 96.8 | 92.0 | 96.1 |
| **Qwen2.5-VL-GR00T** | 30K   | 9.54   | 97.8    | 98.2   | 94.6 | 90.8 | 95.4 |
| **Qwen3-VL-FAST**    | 30K   | 9.54   | 97.3    | 97.4   | 96.3 | 90.6 | 95.4 |
| **Qwen3-VL-OFT**     | 30K   | 9.54   | 97.8    | 98.6   | 96.2 | 93.8 | 96.6 |
| **Qwen3-VL-GR00T**   | 30K   | 9.54   | 97.8    | 98.8   | 97.4 | 92.0 | 96.5 |

4개 세트 전체에 대해 하나의 정책을 학습했습니다. 모든 점수는 각 태스크 세트에 대해 500회 시행의 평균입니다(10개 태스크 x 50 에피소드).

---

### 1. 환경 설정

환경 설정을 위해 먼저 공식 [LIBERO 저장소](https://github.com/Lifelong-Robot-Learning/LIBERO)를 참고하여 기본 `LIBERO` 환경을 설치하세요.

⚠️ **일반적인 문제:** LIBERO는 기본적으로 Python 3.8을 사용하지만, 3.8과 3.10 사이의 문법 변경이 상당합니다. **Python 3.10 사용이 많은 문제를 방지하는 것으로 확인되었습니다**.

이후 `LIBERO` 환경 내에서 다음 의존성을 설치합니다:

```bash
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # 시뮬레이션 환경 호환을 위해 numpy 다운그레이드
```

---

### 2. 평가 워크플로우

**starVLA 저장소 루트에서** **두 개의 별도 터미널**을 사용하여 평가를 실행합니다.

:::note[왜 두 개의 터미널이 필요한가요?]
모델 추론(starVLA 환경)과 시뮬레이션(LIBERO 환경)은 서로 다른 Python 패키지 버전에 의존하며, 같은 conda 환경에 설치하면 충돌이 발생합니다. 별도의 터미널에서 별도의 conda 환경으로 실행하면 이를 피할 수 있습니다.
:::

- **starVLA 환경**: 추론 서버를 실행합니다.
- **LIBERO 환경**: 시뮬레이션을 실행합니다.

#### 1단계. 서버 시작 (starVLA 환경)

첫 번째 터미널에서 `starVLA` conda 환경을 활성화하고 실행합니다:

```bash
bash examples/LIBERO/eval_files/run_policy_server.sh
```

⚠️ **참고:** `examples/LIBERO/eval_files/run_policy_server.sh`에서 올바른 체크포인트 경로를 지정했는지 확인하세요.

---

#### 2단계. 시뮬레이션 시작 (LIBERO 환경)

두 번째 터미널에서 `LIBERO` conda 환경을 활성화하고 실행합니다:

```bash
bash examples/LIBERO/eval_files/eval_libero.sh
```

⚠️ **참고:** `eval_libero.sh`에서 다음 변수를 올바르게 설정했는지 확인하세요:

| 변수 | 의미 | 예시 |
|----------|---------|---------|
| `LIBERO_HOME` | LIBERO 저장소 클론 경로 | `/path/to/LIBERO` |
| `LIBERO_Python` | LIBERO conda 환경의 Python 경로 | `$(which python)` (LIBERO 환경 내에서) |
| `your_ckpt` | StarVLA 체크포인트 경로 | `./results/Checkpoints/.../steps_30000_pytorch_model.pt` |
| `unnorm_key` | 역정규화 통계 로딩을 위한 로봇 유형 이름 | `franka` (LIBERO는 Franka 팔 사용) |

`unnorm_key`는 학습 중 저장된 정규화 통계(최소/최대값 등)를 로드하여 정규화된 모델 출력을 실제 관절 각도로 변환하는 데 사용됩니다.

마지막으로, 각 결과는 시각화를 위한 동영상도 저장됩니다:

![예시](../../../../assets/LIBERO_example.gif)

---

## LIBERO 학습

### 0단계: 학습 데이터셋 다운로드

데이터셋을 `playground/Datasets/LEROBOT_LIBERO_DATA` 디렉토리에 다운로드합니다:

- [LIBERO-spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [LIBERO-object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [LIBERO-goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [LIBERO-10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

그리고 `modality.json`을 각 `$LEROBOT_LIBERO_DATA/subset/meta/modality.json`으로 이동합니다.

다음 스크립트를 실행하여 빠르게 준비할 수 있습니다:

```bash
# DEST를 데이터를 저장할 디렉토리로 설정
export DEST=/path/to/your/data/directory
bash examples/LIBERO/data_preparation.sh
```

### 1단계: 학습 시작

필요한 학습 파일 대부분이 `examples/LIBERO/train_files/`에 정리되어 있습니다.

다음 명령으로 학습을 시작합니다:

```bash
bash examples/LIBERO/train_files/run_libero_train.sh
```

⚠️ **참고:** `examples/LIBERO/train_files/run_libero_train.sh`에서 올바른 경로를 지정했는지 확인하세요.
