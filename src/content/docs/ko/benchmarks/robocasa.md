---
title: RoboCasa 평가
description: RoboCasa GR1 테이블탑 태스크에서의 StarVLA 실험 결과를 재현합니다.
---

**RoboCasa**는 대규모 가정용 시뮬레이션 벤치마크입니다. 여기서는 Fourier GR1 휴머노이드 로봇(상체, 양팔)이 수행하는 24개의 테이블탑 Pick-and-Place 태스크로 구성된 [GR1 Tabletop Tasks](https://github.com/robocasa/robocasa-gr1-tabletop-tasks) 서브셋을 사용합니다.

이 문서는 **실험 결과 재현** 방법을 안내합니다.

평가 과정은 크게 두 부분으로 구성됩니다:

1. `robocasa` 환경 및 의존성 설정.
2. `starVLA`와 `robocasa` 환경 모두에서 서비스를 시작하여 평가 실행.

:::note[왜 두 개의 터미널이 필요한가요?]
모델 추론(starVLA 환경)과 시뮬레이션(robocasa 환경)은 서로 다른 Python 패키지 버전에 의존하며, 같은 conda 환경에 설치하면 충돌이 발생합니다. 별도의 터미널에서 별도의 conda 환경으로 실행하면 이를 피할 수 있습니다.
:::

이 워크플로우는 **NVIDIA A100** GPU에서 정상 작동이 확인되었습니다.

---

## 실험 결과

| 태스크 | GR00T-N1.6 | StarVLA-GR00T-Qwen3 | StarVLA-π-Qwen3 | StarVLA-OFT-Qwen3 | StarVLA-FAST-Qwen3 |
|------|------------|------------|---------|----------|-----------|
| **PnP Bottle To Cabinet Close** | 51.5 | 46.0 | 26.0 | 30.0 | 38.0 |
| **PnP Can To Drawer Close** | 13.0 | 80.0 | 62.0 | 76.0 | 44.0 |
| **PnP Cup To Drawer Close** | 8.5 | 54.0 | 42.0 | 44.0 | 56.0 |
| **PnP Milk To Microwave Close** | 14.0 | 48.0 | 50.0 | 44.0 | 44.0 |
| **PnP Potato To Microwave Close** | 41.5 | 28.0 | 42.0 | 32.0 | 14.0 |
| **PnP Wine To Cabinet Close** | 16.5 | 46.0 | 32.0 | 36.0 | 14.0 |
| **PnP Novel From Cuttingboard To Basket** | 58.0 | 48.0 | 40.0 | 50.0 | 54.0 |
| **PnP Novel From Cuttingboard To Cardboardbox** | 46.5 | 40.0 | 46.0 | 40.0 | 42.0 |
| **PnP Novel From Cuttingboard To Pan** | 68.5 | 68.0 | 60.0 | 70.0 | 58.0 |
| **PnP Novel From Cuttingboard To Pot** | 65.0 | 52.0 | 40.0 | 54.0 | 58.0 |
| **PnP Novel From Cuttingboard To Tieredbasket** | 46.5 | 56.0 | 44.0 | 38.0 | 40.0 |
| **PnP Novel From Placemat To Basket** | 58.5 | 42.0 | 44.0 | 32.0 | 36.0 |
| **PnP Novel From Placemat To Bowl** | 57.5 | 44.0 | 52.0 | 58.0 | 38.0 |
| **PnP Novel From Placemat To Plate** | 63.0 | 48.0 | 50.0 | 52.0 | 42.0 |
| **PnP Novel From Placemat To Tieredshelf** | 28.5 | 18.0 | 28.0 | 24.0 | 18.0 |
| **PnP Novel From Plate To Bowl** | 57.0 | 60.0 | 52.0 | 60.0 | 52.0 |
| **PnP Novel From Plate To Cardboardbox** | 43.5 | 50.0 | 40.0 | 50.0 | 30.0 |
| **PnP Novel From Plate To Pan** | 51.0 | 54.0 | 36.0 | 66.0 | 48.0 |
| **PnP Novel From Plate To Plate** | 78.7 | 70.0 | 48.0 | 68.0 | 50.0 |
| **PnP Novel From Tray To Cardboardbox** | 51.5 | 38.0 | 34.0 | 44.0 | 28.0 |
| **PnP Novel From Tray To Plate** | 71.0 | 56.0 | 64.0 | 56.0 | 34.0 |
| **PnP Novel From Tray To Pot** | 64.5 | 50.0 | 44.0 | 62.0 | 46.0 |
| **PnP Novel From Tray To Tieredbasket** | 57.0 | 36.0 | 50.0 | 54.0 | 36.0 |
| **PnP Novel From Tray To Tieredshelf** | 31.5 | 16.0 | 28.0 | 30.0 | 16.0 |
| **평균** | **47.6** | **47.8** | **43.9** | **48.8** | **39.0** |

*참고: 모든 값은 성공률(%)입니다. 단일 모델로 24개 전체 태스크를 학습했습니다. 결과는 태스크당 50회 롤아웃 기준입니다.*

---

## RoboCasa 평가

### 0. 체크포인트 다운로드

먼저 다음에서 체크포인트를 다운로드합니다:
- [Qwen3VL-GR00T](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1)
- [Qwen3VL-OFT](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa)

### 1. 환경 설정

환경 설정을 위해 먼저 [공식 RoboCasa 설치 가이드](https://github.com/robocasa/robocasa-gr1-tabletop-tasks?tab=readme-ov-file#getting-started)를 참고하여 기본 `robocasa-gr1-tabletop-tasks` 환경을 설치하세요.

그런 다음 소켓 지원을 설치합니다:

```bash
pip install tyro
```

---

### 2. 평가 워크플로우

#### 1단계. 서버 시작 (starVLA 환경)

첫 번째 터미널에서 `starVLA` conda 환경을 활성화하고 실행합니다:

```bash
python deployment/model_server/server_policy.py \
        --ckpt_path ${your_ckpt} \
        --port 5678 \
        --use_bf16
```

---

#### 2단계. 시뮬레이션 시작 (robocasa 환경)

두 번째 터미널에서 `robocasa` conda 환경을 활성화하고 실행합니다:

```bash
export PYTHONPATH=$(pwd):${PYTHONPATH}
your_ckpt=StarVLA/Qwen3-VL-OFT-Robocasa/checkpoints/steps_90000_pytorch_model.pt

python examples/Robocasa_tabletop/eval_files/simulation_env.py\
   --args.env_name ${env_name} \
   --args.port 5678 \
   --args.n_episodes 50 \
   --args.n_envs 1 \
   --args.max_episode_steps 720 \
   --args.n_action_steps 12 \
   --args.video_out_path ${video_out_path} \
   --args.pretrained_path ${your_ckpt}
```

#### 일괄 평가 (선택 사항)

GPU가 더 있다면 일괄 평가 스크립트를 사용할 수 있습니다:

```bash
bash examples/Robocasa_tabletop/batch_eval_args.sh
```

**참고:** `batch_eval_args.sh`에서 올바른 체크포인트 경로를 지정했는지 확인하세요.

---

## 학습 결과 재현

### 0단계: 학습 데이터셋 다운로드

[HuggingFace](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)에서 PhysicalAI-Robotics-GR00T-X-Embodiment-Sim 디렉토리 데이터셋을 `playground/Datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim` 디렉토리에 다운로드합니다.

관련 파인튜닝 폴더만 다운로드하려면 [GR00T-N1.5](https://github.com/NVIDIA/Isaac-GR00T/tree/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/examples/RoboCasa#-1-dataset-preparation) 저장소의 안내를 참고하세요.

또는 스크립트를 사용하여 `*_1000` 폴더를 다운로드합니다:

```bash
python examples/Robocasa_tabletop/download_gr00t_ft_data.py
```

### 1단계: 학습 시작

`data_mix` 파라미터를 수정하여 다양한 데이터셋을 선택할 수 있으며, 다음 스크립트로 `*_1000` 데이터셋을 파인튜닝할 수 있습니다:

```bash
bash examples/Robocasa_tabletop/train_files/run_robocasa.sh
```
