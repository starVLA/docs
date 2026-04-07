---
title: 자체 LeRobot 데이터셋 사용하기
description: 자체 LeRobot 형식 데이터셋으로 StarVLA를 학습합니다.
---

이 가이드는 데이터 변환부터 모델 학습까지, 자체 로보틱스 데이터로 StarVLA를 학습하는 전체 과정을 안내합니다.

## 개요

워크플로우는 다섯 가지 주요 단계로 구성됩니다:

1. **데이터를 LeRobot 형식으로 변환** - 원시 데이터를 표준화된 LeRobot 형식으로 변환
2. **로봇 유형 설정 생성** - 로봇 데이터의 모달리티 구조 정의
3. **데이터 믹스 생성** - 혼합 레지스트리에 데이터셋 등록
4. **학습 설정 생성** - 학습 파라미터 구성
5. **학습 실행** - 학습 스크립트 시작

## 1단계: 데이터를 LeRobot 형식으로 변환

StarVLA는 VLA 학습에 LeRobot 데이터셋 형식을 사용합니다. 먼저 로보틱스 데이터를 이 형식으로 변환해야 합니다.

### LeRobot 데이터 구조

LeRobot 데이터셋에는 다음 피처가 필요합니다:

- **`observation.state`**: 로봇 상태(관절 위치, 엔드 이펙터 포즈 등)
- **`action`**: 로봇 액션(관절 명령, 델타 위치 등)
- **`observation.images.*`**: 카메라 이미지(비디오로 저장)
- **`language_instruction`** 또는 **`task`**: 태스크 설명 텍스트

### 변환 예시

```python
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset
import numpy as np

# 데이터셋 피처 정의
FEATURES = {
    "observation.state": {
        "dtype": "float32",
        "shape": (7,),  # 예: 6개 관절 + 1개 그리퍼
        "names": ["state"],
    },
    "action": {
        "dtype": "float32",
        "shape": (7,),
        "names": ["action"],
    },
    "observation.images.image": {
        "dtype": "video",
        "shape": (480, 640, 3),  # 높이, 너비, 채널
        "names": ["height", "width", "channels"],
    },
    "language_instruction": {
        "dtype": "string",
        "shape": (1,),
        "names": ["instruction"],
    },
}

# 데이터셋 생성
dataset = LeRobotDataset.create(
    repo_id="my_robot_dataset",
    fps=15,
    robot_type="my_robot",
    features=FEATURES,
)

# 데이터에서 프레임 추가
# 원시 데이터가 에피소드(하나의 완전한 시연)별로 구성되어 있다고 가정합니다.
# 각 에피소드에는 여러 프레임이 포함됩니다.
# 예: episodes = [load_hdf5("demo_0.hdf5"), load_hdf5("demo_1.hdf5"), ...]
for episode in your_episodes:
    for frame in episode:
        dataset.add_frame({
            "observation.state": np.array(frame["state"], dtype=np.float32),
            "action": np.array(frame["action"], dtype=np.float32),
            "observation.images.image": frame["image"],
            "language_instruction": frame["instruction"],
            # `task`는 LeRobot이 내부적으로 에피소드를 태스크별로 그룹화하는 데
            # 사용하는 필수 필드입니다; 내용은 보통 language_instruction과 동일합니다
            "task": frame["instruction"],
        })
    dataset.save_episode()

# 데이터셋 마무리
dataset.finalize()
```

:::tip
자세한 LeRobot 변환 방법은 [LeRobot 문서](https://github.com/huggingface/lerobot)를 참조하세요.
:::

### 데이터셋 디렉토리 구조

변환 후 데이터셋은 다음 구조를 가져야 합니다:

```
your_dataset_name/
├── meta/
│   ├── info.json
│   ├── episodes.jsonl
│   ├── stats.json
│   └── tasks.json
├── data/
│   └── chunk-000/
│       └── episode_000000.parquet
└── videos/
    └── chunk-000/
        └── observation.images.image/
            └── episode_000000.mp4
```

### Modality JSON 파일

학습 디렉토리에 `modality.json` 파일을 생성하여 LeRobot 키와 StarVLA 키 간의 매핑을 정의합니다. 이것을 "변환 테이블"이라고 생각하세요 — 데이터셋의 원시 컬럼 이름을 StarVLA의 통합 내부 이름으로 변환하여, 서로 다른 데이터셋이 자체 `modality.json`만 제공하면 동일한 코드로 처리될 수 있습니다:

```json
{
    "state": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "action": {
        "arm_joint": {"start": 0, "end": 6},
        "gripper_joint": {"start": 6, "end": 7}
    },
    "video": {
        "camera_1": {"original_key": "observation.images.camera_1"},
        "camera_2": {"original_key": "observation.images.camera_2"}
    },
    "annotation": {
        "human.action.task_description": {"original_key": "language_instruction"}
    }
}
```

StarVLA는 모든 내장 벤치마크에 대해 `modality.json` 파일을 제공합니다. 각 벤치마크의 예제 디렉토리에서 찾을 수 있습니다(예: `examples/LIBERO/train_files/modality.json`, `examples/SimplerEnv/train_files/modality.json`).

## 2단계: 로봇 유형 설정 생성

로봇 유형 설정은 StarVLA가 데이터를 읽고 처리하는 방법을 정의합니다. `starVLA/dataloader/gr00t_lerobot/data_config.py`에 새 설정 클래스를 생성합니다.

### 설정 구조

```python
class MyRobotDataConfig:
    # 각 모달리티의 키 정의
    video_keys = [
        "video.camera_1",      # observation.images.camera_1에 매핑
        "video.camera_2",      # observation.images.camera_2에 매핑
    ]
    state_keys = [
        "state.arm_joint",
        "state.gripper_joint",
    ]
    action_keys = [
        "action.arm_joint",
        "action.gripper_joint",
    ]
    language_keys = ["annotation.human.action.task_description"]

    # 인덱스 설정
    observation_indices = [0]        # 관찰에 사용할 타임스텝
    action_indices = list(range(8))  # 액션 호라이즌 (미래 8스텝 예측)

    def modality_config(self):
        """데이터 로딩을 위한 모달리티 설정을 정의합니다."""
        from starVLA.dataloader.gr00t_lerobot.datasets import ModalityConfig

        return {
            "video": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.video_keys,
            ),
            "state": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.state_keys,
            ),
            "action": ModalityConfig(
                delta_indices=self.action_indices,
                modality_keys=self.action_keys,
            ),
            "language": ModalityConfig(
                delta_indices=self.observation_indices,
                modality_keys=self.language_keys,
            ),
        }

    def transform(self):
        """데이터 변환을 정의합니다."""
        from starVLA.dataloader.gr00t_lerobot.transform.base import ComposedModalityTransform
        from starVLA.dataloader.gr00t_lerobot.transform.state_action import (
            StateActionToTensor,
            StateActionTransform,
        )

        transforms = [
            # 상태 변환
            StateActionToTensor(apply_to=self.state_keys),
            StateActionTransform(
                apply_to=self.state_keys,
                normalization_modes={key: "min_max" for key in self.state_keys},
            ),
            # 액션 변환
            StateActionToTensor(apply_to=self.action_keys),
            StateActionTransform(
                apply_to=self.action_keys,
                normalization_modes={key: "min_max" for key in self.action_keys},
            ),
        ]
        return ComposedModalityTransform(transforms=transforms)
```

DataConfig에서 Modality가 구현하는 매핑 관계에 주목하세요. 예를 들어, 데이터셋에 팔, 그리퍼, 몸체, 바퀴를 포함하는 모든 자유도의 상태와 액션이 있는 경우, Modality는 각 인덱스 범위의 의미를 슬라이스(`start`와 `end` 키를 통해)한 다음 DataConfig에서 재조립하고 정리할 수 있습니다.

**구체적인 예시**: 로봇이 7-DOF 팔 + 1 그리퍼를 가지고 있고, 원시 상태가 8차원 벡터 `[j0, j1, j2, j3, j4, j5, j6, gripper]`라고 가정합니다. `modality.json`에서 이를 다음과 같이 분리합니다: 처음 7개 차원(관절 각도)은 `"arm_joint": {"start": 0, "end": 7}`, 8번째 차원(그리퍼 상태)은 `"gripper_joint": {"start": 7, "end": 8}`. 이를 통해 StarVLA가 어떤 차원이 팔 관절이고 어떤 것이 그리퍼인지 알 수 있어 각각에 대해 다른 정규화 전략을 적용할 수 있습니다.

### 설정 등록

`data_config.py` 하단의 `ROBOT_TYPE_CONFIG_MAP`에 설정을 추가합니다:

```python
ROBOT_TYPE_CONFIG_MAP = {
    # ... 기존 설정 ...
    "my_robot": MyRobotDataConfig(),
}
```

### 정규화 모드

`StateActionTransform`에 사용 가능한 정규화 모드:

| 모드 | 설명 |
|------|-------------|
| `min_max` | 최소/최대 통계를 사용하여 [-1, 1]로 정규화 |
| `q99` | 1번째 및 99번째 백분위수를 사용하여 정규화 (이상치에 강건) |
| `binary` | 이진 액션(예: 그리퍼 열기/닫기)을 {-1, 1}로 매핑 |
| `rotation_6d` | 회전을 6D 표현으로 변환 |
| `axis_angle` | 회전을 축-각도 표현으로 변환 |

:::tip
일반적인 StarVLA 설정에서는 State 또는 Action의 표현으로 절대 관절 위치(absolute Joint Position)를 사용합니다. 이 경우 Arm에는 `min_max`, Gripper에는 `binary`를 사용하는 것이 일반적으로 권장됩니다.
:::

## 3단계: 데이터 믹스 생성

`starVLA/dataloader/gr00t_lerobot/mixtures.py`에 데이터셋을 등록합니다:

```python
DATASET_NAMED_MIXTURES = {
    # ... 기존 믹스 ...

    # 단일 데이터셋
    "my_dataset": [
        ("my_dataset_name", 1.0, "my_robot"),
        # (데이터셋_폴더_이름, 샘플링_가중치, 로봇_유형_설정)
    ],

    # 다른 가중치를 가진 여러 데이터셋
    "my_mixed_dataset": [
        ("my_dataset_task1", 1.0, "my_robot"),
        ("my_dataset_task2", 0.5, "my_robot"),  # 절반 샘플링 가중치
        ("my_dataset_task3", 2.0, "my_robot"),  # 두 배 샘플링 가중치
    ],
}
```

### 데이터 디렉토리 구조

데이터는 다음과 같이 구성되어야 합니다:

```
playground/Datasets/MY_DATA_ROOT/
├── my_dataset_task1/
│   ├── meta/
│   ├── data/
│   └── videos/
├── my_dataset_task2/
│   ├── meta/
│   ├── data/
│   └── videos/
└── my_dataset_task3/
    ├── meta/
    ├── data/
    └── videos/
```

## 4단계: 학습 설정 생성

YAML 설정 파일을 생성합니다(예: `examples/MyRobot/train_files/starvla_my_robot.yaml`):

```yaml
# ===== 실행 설정 =====
run_id: my_robot_training           # 실험 이름; 체크포인트는 run_root_dir/run_id/에 저장
run_root_dir: results/Checkpoints   # 체크포인트 출력 루트 디렉토리
seed: 42
trackers: [jsonl, wandb]            # 로깅: jsonl (로컬) + wandb (온라인)
wandb_entity: your_wandb_entity     # wandb 사용자 이름 또는 팀
wandb_project: my_robot_project
is_debug: false                     # true로 설정 시 최소 데이터로 빠른 디버깅

# ===== 모델 프레임워크 설정 =====
framework:
  name: QwenOFT                     # 선택: QwenOFT / QwenGR00T / QwenFast / QwenPI
  qwenvl:
    base_vlm: ./playground/Pretrained_models/Qwen3-VL-4B-Instruct  # VLM 기본 모델 경로
    attn_implementation: flash_attention_2
    vl_hidden_dim: 2048             # VLM 히든 차원 (Qwen3-VL-4B는 2048)
  dino:
    dino_backbone: dinov2_vits14    # 공간 피처를 위한 선택적 추가 비전 인코더

  action_model:
    action_model_type: DiT-B        # 액션 모델 유형 (DiT-B는 GR00T/PI 프레임워크 전용)
    hidden_size: 1024
    max_seq_len: 1024
    action_dim: 14                  # 액션 차원 = 로봇의 관절 수 (예: 7개 관절 x 2개 팔 = 14)
    state_dim: 14                   # 상태 차원, 보통 action_dim과 동일
    future_action_window_size: 15   # 모델이 예측하는 미래 스텝 수 (액션 청크 길이 - 1)
    action_horizon: 16              # 총 액션 시퀀스 길이 = future + 1 (현재 스텝)
    past_action_window_size: 0      # 이전 액션 윈도우 (0 = 이력 없음)
    repeated_diffusion_steps: 8     # 학습 중 디퓨전 샘플링 반복 (GR00T/PI 전용)
    num_inference_timesteps: 4      # 추론 시 디퓨전 스텝 (적으면 빠르지만 덜 정밀)
    num_target_vision_tokens: 32    # VLM에서 압축된 비전 토큰 수
    # DiT Transformer 내부 (보통 수정 불필요):
    diffusion_model_cfg:
      cross_attention_dim: 2048     # VLM의 hidden_dim과 일치해야 함
      dropout: 0.2
      num_layers: 16
      output_dim: 2560

# ===== 데이터셋 설정 =====
datasets:
  # VLM 데이터 (선택 사항, 공동 학습 시에만 필요)
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco    # qwen_data_config.py에 등록된 데이터셋 이름
    per_device_batch_size: 4

  # VLA 데이터 (로봇 조작 데이터, 필수)
  vla_data:
    dataset_py: lerobot_datasets
    data_root_dir: playground/Datasets/MY_DATA_ROOT  # 데이터셋 루트 디렉토리
    data_mix: my_dataset            # mixtures.py에 등록된 믹스 이름
    action_type: abs_qpos           # 액션 유형: abs_qpos = 절대 관절 위치 (목표 각도 값)
    default_image_resolution: [3, 224, 224]  # [채널, 높이, 너비]
    per_device_batch_size: 16
    load_all_data_for_training: true # 시작 시 모든 학습 데이터를 메모리에 로드 (학습 속도 향상, RAM 더 사용)
    obs: ["image_0"]                # 사용할 카메라 (image_0 = DataConfig의 video_keys 목록 첫 번째 카메라)
    image_size: [224,224]
    video_backend: torchvision_av   # 비디오 디코드 백엔드 (torchvision_av 또는 decord)

# ===== 트레이너 설정 =====
trainer:
  epochs: 100
  max_train_steps: 100000           # 최대 학습 스텝 (에포크와 관계없이 여기서 중단)
  num_warmup_steps: 5000            # 학습률 워밍업 스텝
  save_interval: 5000               # N 스텝마다 체크포인트 저장
  eval_interval: 100                # N 스텝마다 검증 세트 평가

  # 모듈별 학습률: 서로 다른 컴포넌트에 다른 학습률 적용 가능
  learning_rate:
    base: 1e-05                     # 기본 LR (아래에 지정되지 않은 모듈에 사용)
    qwen_vl_interface: 1.0e-05      # VLM 백본 LR
    action_model: 1.0e-04           # 액션 헤드 LR (처음부터 학습하므로 높게)

  lr_scheduler_type: cosine_with_min_lr
  scheduler_specific_kwargs:
    min_lr: 5.0e-07                 # 코사인 감쇠 최소 LR

  freeze_modules: ''                # 동결할 모듈 경로 (비어있으면 = 모두 학습)
  loss_scale:
    vla: 1.0                        # VLA 손실 가중치
    vlm: 0.1                        # VLM 손실 가중치 (공동 학습용)
  repeated_diffusion_steps: 4       # 학습 시 디퓨전 샘플링 반복 (action_model 값 오버라이드)
  max_grad_norm: 1.0                # 그래디언트 클리핑 임계값
  gradient_accumulation_steps: 1    # GPU 메모리 부족 시 증가

  optimizer:
    name: AdamW
    betas: [0.9, 0.95]
    eps: 1.0e-08
    weight_decay: 1.0e-08
```

:::tip[action_dim과 state_dim에 대해]
이 값은 로봇 하드웨어에 따라 다릅니다. 예시:
- 7개 관절 + 1개 그리퍼의 단일 팔 → `action_dim: 8`, `state_dim: 8`
- 각 7개 관절의 양팔 → `action_dim: 14`, `state_dim: 14`
- BEHAVIOR R1Pro 휴머노이드 → `action_dim: 23`, `state_dim: 23`

DataConfig에서 정의한 액션/상태 키의 총 차원과 일치해야 합니다.
:::

| 프레임워크 | 액션 헤드 | 적합한 용도 |
|-----------|-------------|----------|
| `QwenOFT` | MLP | 빠른 추론, 단순한 태스크 |
| `QwenGR00T` | Flow-matching DiT | 복잡한 조작, 높은 정밀도 |
| `QwenFast` | 이산 토큰 | 토큰 기반 액션 예측 |
| `QwenPI` | 디퓨전 | 멀티모달 액션 분포 |

커뮤니티 지원 모델도 선택할 수 있으며, BaseFramework를 공유하므로 설정 수정만으로 적용할 수 있습니다.

## 5단계: 학습 실행

학습 스크립트를 생성합니다(예: `examples/MyRobot/train_files/run_train.sh`):

```bash
#!/bin/bash

# ========== 필수 파라미터 ==========
config_yaml=./examples/MyRobot/train_files/starvla_my_robot.yaml  # 학습 설정 파일 (필수)

# ========== 선택적 오버라이드 (CLI가 YAML 값보다 우선) ==========
Framework_name=QwenOFT
base_vlm=playground/Pretrained_models/Qwen2.5-VL-3B-Instruct
data_root=playground/Datasets/MY_DATA_ROOT
data_mix=my_dataset
run_root_dir=./results/Checkpoints
run_id=my_robot_experiment

# 출력 디렉토리 생성
output_dir=${run_root_dir}/${run_id}
mkdir -p ${output_dir}
cp $0 ${output_dir}/

# 학습 시작
# --config_yaml은 유일한 필수 인자입니다; 다른 --xxx 플래그는 모두 선택적 CLI 오버라이드입니다.
# YAML 파일에 모든 설정을 완료했다면 아래 오버라이드 플래그를 생략할 수 있습니다.
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  --framework.name ${Framework_name} \
  --framework.qwenvl.base_vlm ${base_vlm} \
  --datasets.vla_data.data_root_dir ${data_root} \
  --datasets.vla_data.data_mix ${data_mix} \
  --datasets.vla_data.per_device_batch_size 4 \
  --trainer.max_train_steps 100000 \
  --trainer.save_interval 10000 \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id}
```

### 다중 노드 학습

다중 노드 분산 학습의 경우:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes ${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ${config_yaml} \
  # ... 기타 인자
```
