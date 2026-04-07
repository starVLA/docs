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
