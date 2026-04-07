---
title: SimplerEnv 평가
description: SimplerEnv에서의 StarVLA 실험 결과를 재현합니다(설정, 평가 워크플로우, 학습 참고사항).
---

**SimplerEnv**는 WidowX 로봇 팔을 사용하는 ManiSkill 기반 시뮬레이션 환경으로, 테이블탑 조작 태스크(잡기, 놓기, 서랍 조작 등)를 수행합니다. Open X-Embodiment(OXE) 데이터셋으로 학습된 VLA 모델의 평가에 널리 사용됩니다.

이 문서는 SimplerEnv에서의 **실험 결과 재현** 방법을 안내합니다.

평가 과정은 크게 두 부분으로 구성됩니다:

1. `simpler_env` 환경 및 의존성 설정.
2. `starVLA`와 `simpler_env` 환경 모두에서 서비스를 시작하여 평가 실행.

이 워크플로우는 **NVIDIA A100** 및 **RTX 4090** GPU에서 정상 작동이 확인되었습니다.

---

## Experimental Results

### WidowX Robot (Visual Matching)

| Method | Steps | Put Spoon on Towel | Put Carrot on Plate | Stack Green Block on Yellow Block | Put Eggplant in Yellow Basket | Average |
|--------|-------|--------------------|--------------------|---------------------------------|------------------------------|---------|
| RT-1-X | - | 0.0 | 4.2 | 0.0 | 0.0 | 1.1 |
| Octo-Base | - | 15.8 | 12.5 | 0.0 | 41.7 | 17.5 |
| Octo-Small | - | 41.7 | 8.2 | 0.0 | 56.7 | 26.7 |
| OpenVLA | - | 4.2 | 0.0 | 0.0 | 12.5 | 4.2 |
| CogACT | - | 71.7 | 50.8 | 15.0 | 67.5 | 51.3 |
| SpatialVLA | - | 16.7 | 25.0 | 29.2 | **100.0** | 42.7 |
| π₀ | - | 29.1 | 0.0 | 16.6 | 62.5 | 27.1 |
| π₀-FAST | - | 29.1 | 21.9 | 10.8 | 66.6 | 48.3 |
| GR00T N1.5 | - | 75.3 | 54.3 | **57.0** | 61.3 | 61.9 |
| Magma | - | 37.5 | 31.0 | 12.7 | 60.5 | 35.8 |
| **StarVLA-FAST (Qwen3-VL)** | 15K | 18.8 | 31.3 | 4.2 | 71.9 | 31.6 |
| **StarVLA-OFT (Qwen3-VL)** | 65K | **90.3** | 38.5 | 29.7 | **100.0** | 64.6 |
| **StarVLA-π (Qwen3-VL)** | 40K | 78.1 | 46.9 | 30.2 | 88.5 | 60.9 |
| **StarVLA-GR00T (Qwen3-VL)** | 20K | 83.0 | 59.4 | 18.8 | **100.0** | 65.3 |
| **StarVLA-OFT (Cosmos-Predict2-2B)** | 30K | 66.8 | 62.6 | 25.3 | 90.2 | 61.2 |
| **StarVLA-π (Cosmos-Predict2-2B)** | 30K | 81.4 | 55.2 | 25.1 | 73.0 | 58.7 |
| **StarVLA-GR00T (Cosmos-Predict2-2B)** | 30K | 80.4 | **65.4** | 20.0 | 80.6 | 61.6 |

### Google Robot (Visual Matching)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 85.7 | 44.2 | **73.0** | 6.5 | 52.4 |
| RT-1-X | 56.7 | 31.7 | 59.7 | 21.3 | 42.4 |
| RT-2-X | 78.7 | 77.9 | 25.0 | 3.7 | 46.3 |
| OpenVLA | 18.0 | 56.3 | 63.0 | 0.0 | 34.3 |
| CogACT | 91.3 | 85.0 | 71.8 | 50.9 | 74.8 |
| SpatialVLA | 86.0 | 77.9 | 57.4 | - | 75.1 |
| π₀ | 72.7 | 65.3 | 38.3 | - | 58.8 |
| π₀-FAST | 75.3 | 67.5 | 42.9 | - | 61.9 |
| GR00T N1.5* | 51.7 | 54.0 | 27.8 | 7.4 | 35.2 |
| Magma | 83.7 | 65.4 | 56.0 | 6.4 | 52.9 |
| **StarVLA-OFT** | **95.3** | 75.0 | 68.8 | **66.1** | **76.0** |

### Google Robot (Variant Aggregation)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 89.8 | 50.0 | 32.3 | 2.6 | 43.7 |
| RT-1-X | 49.0 | 32.3 | 29.4 | 10.1 | 30.2 |
| RT-2-X | 82.3 | 79.2 | 35.3 | 20.6 | 54.4 |
| OpenVLA | 60.8 | 67.7 | 28.8 | 0.0 | 39.3 |
| CogACT | 89.6 | 80.8 | 28.3 | 46.6 | 61.3 |
| SpatialVLA | 88.0 | **82.5** | 41.8 | - | 70.7 |
| π₀ | 75.2 | 63.7 | 25.6 | - | 54.8 |
| π₀-FAST | 77.6 | 68.2 | 31.3 | - | 59.0 |
| GR00T N1.5 | 69.3 | 68.7 | 35.8 | 4.0 | 44.5 |
| Magma | 68.8 | 65.7 | **53.4** | 18.5 | 51.6 |
| **StarVLA-OFT** | 91.3 | 75.1 | 55.0 | **59.4** | **70.2** |

*Note: All StarVLA Google Robot results use Qwen3-VL-4B as backbone. Numbers marked with \* denote our reimplementation.*

---

## SimplerEnv 평가

### 1. 환경 설정

환경 설정을 위해 먼저 공식 [SimplerEnv 저장소](https://github.com/simpler-env/SimplerEnv)를 참고하여 기본 `simpler_env` 환경을 설치하세요.

이후 `simpler_env` 환경 내에서 다음 의존성을 설치합니다:

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # 시뮬레이션 환경 호환을 위해 numpy 다운그레이드
```

**일반적인 문제:**
NVIDIA A100에서 SimplerEnv를 테스트할 때 다음 오류가 발생할 수 있습니다:
`libvulkan.so.1: cannot open shared object file: No such file or directory`
다음 링크를 참고하여 해결할 수 있습니다: [설치 가이드 - Vulkan 섹션](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### 검증

최소한의 환경 검증 스크립트를 제공합니다:

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

"✅ Env built successfully" 메시지가 표시되면 SimplerEnv가 올바르게 설치되어 사용할 준비가 된 것입니다.

---

### 2. 평가 워크플로우

**starVLA 저장소 루트에서** **두 개의 별도 터미널**을 사용하여 평가를 실행합니다.

:::note[왜 두 개의 터미널이 필요한가요?]
모델 추론(starVLA 환경)과 시뮬레이션(simpler_env 환경)은 서로 다른 Python 패키지 버전에 의존하며, 같은 conda 환경에 설치하면 충돌이 발생합니다. 별도의 터미널에서 별도의 conda 환경으로 실행하면 이를 피할 수 있습니다.
:::

- **starVLA 환경**: 정책 추론 서버를 실행합니다.
- **simpler_env 환경**: 시뮬레이션 평가 코드를 실행합니다.

#### 0단계. 체크포인트 다운로드

체크포인트를 다운로드합니다: [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### 1단계. 서버 시작 (starVLA 환경)

첫 번째 터미널에서 `starVLA` conda 환경을 활성화하고 실행합니다:

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**참고:** `examples/SimplerEnv/eval_files/run_policy_server.sh`를 열고, `your_ckpt` 변수를 실제 체크포인트 경로로 설정하세요. 예: `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`.

---

#### 2단계. 시뮬레이션 시작 (simpler_env 환경)

두 번째 터미널에서 `simpler_env` conda 환경을 활성화하고 실행합니다:

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

이 스크립트는 WidowX Robot 평가 태스크를 자동으로 시작하여 위에 보고된 벤치마크 결과를 재현합니다.

**참고:** `examples/SimplerEnv/start_simpler_env.sh`를 열고, `SimplerEnv_PATH` 변수를 SimplerEnv 저장소 클론 경로로 설정하세요(예: `/path/to/SimplerEnv`).

**일반적인 문제:**
정책 서버 실행 시 `NotImplementedError: Framework QwenGR00T is not implemented`가 발생하면, 이는 보통 Framework가 Python의 임포트 경로에 올바르게 등록되지 않았기 때문입니다. 먼저 스모크 테스트를 실행하여 올바른 등록을 트리거하세요:
```bash
python starVLA/model/framework/QwenGR00T.py
```
스모크 테스트가 통과하면 정책 서버를 재시작하세요.

---

## OXE 학습

### 데이터 준비

단계:
1. LeRobot 형식의 OXE 데이터셋을 다운로드합니다:
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. 각 `*lerobot/meta/modality.json`에 `modality.json`을 포함합니다:
   - [bridge modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - `modality.json`으로 이름을 변경하고 `bridge_orig_lerobot/meta/modality.json`에 배치
   - [fractal modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - `modality.json`으로 이름을 변경하고 `fractal20220817_data_lerobot/meta/modality.json`에 배치

3. 데이터셋 경로를 `config.yaml`에 추가합니다:
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### 데이터로더 확인

데이터로더를 확인하는 간단한 방법을 제공합니다. 배치 데이터를 로드할 수 있는지 확인하세요:

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### 프레임워크 준비

실행 전에 프레임워크가 가짜 데이터 예시로 `forward`와 `predict_action`을 수행할 수 있는지 확인해야 합니다.

다음 명령을 시도하세요:

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### 학습 시작

모든 준비가 완료되면 제공된 스크립트로 학습을 시작합니다:

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**참고:** 스크립트가 검증된 설정 경로를 명시적으로 사용하는지 확인하세요. 아직 전달되지 않았다면 `--config_yaml` 인자를 추가하세요.
