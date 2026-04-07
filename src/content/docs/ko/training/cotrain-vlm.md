---
title: VLM 데이터와 공동 학습
description: StarVLA 프레임워크의 공동 학습을 위해 VLM(Vision-Language Model) 데이터를 통합합니다.
---

이 가이드는 StarVLA(Vision-Language-Action) 프레임워크의 공동 학습을 위해 VLM(Vision-Language Model) 데이터를 통합하는 과정을 설명합니다.

**왜 공동 학습인가요?** VLA를 순수하게 로봇 조작 데이터만으로 학습하면 VLM 백본의 비전 및 언어 이해 능력이 저하될 수 있습니다. 이를 "파국적 망각(catastrophic forgetting)"이라 합니다: 로봇 데이터만으로 학습된 후 모델이 이미지를 해석하거나, 질문에 답하거나, 복잡한 명령을 이해하는 능력을 잊어버릴 수 있습니다. VLM 데이터(이미지 QA, 캡셔닝 등)를 혼합하면 로봇 제어를 배우면서 모델의 일반적인 이해 능력을 유지할 수 있습니다.

---

## 1. 멀티모달 데이터 준비

VLM 데이터는 [QwenVL Conversations JSON 데이터 구조](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune)를 따라야 합니다.

### 필수 형식

각 데이터 인스턴스는 **이미지 파일 경로**를 **사람-GPT 대화 턴** 목록에 연결하는 JSON 객체입니다.

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
            // <image>는 모델에 "여기에 이미지를 삽입"을 알려주는 플레이스홀더이며,
            // 실제 이미지 경로는 외부 "image" 필드에서 지정합니다
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### 빠른 시작

예시 데이터셋 [LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO)를 다운로드할 수 있습니다.

`sharegpt4v_coco.zip`을 압축 해제하고 `playground/Datasets/LLaVA-OneVision-COCO`에 배치합니다.

결과 파일 구조는 다음과 같습니다:

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. VLM 데이터셋 설정

커스텀 VLM 데이터셋을 추가하려면 다음 단계를 따르세요:

### 2.1 데이터셋 등록 (Python)

`starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py`의 `data_dict`에 데이터셋을 추가하여 등록합니다:

```python
# 등록 예시
# json_root과 image_root은 이 파일 상단에 정의되어 있으며,
# 기본값은 playground/Datasets/LLaVA-OneVision-COCO/ 하위 디렉토리입니다:
#   json_root = "playground/Datasets/LLaVA-OneVision-COCO/llava_jsons"
#   image_root = "playground/Datasets/LLaVA-OneVision-COCO/images"

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # YAML 설정에서 이 이름을 사용합니다
}
```

### 2.2 학습 YAML 업데이트

학습 YAML 파일(`your_train_config.yaml`)에 VLM 데이터셋 설정을 포함합니다:

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # 2.1에서 등록한 이름과 일치해야 합니다
```

**팁:** 다음을 실행하여 VLM 데이터로더를 확인할 수 있습니다:

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. 학습 실행

VLM 데이터만으로 학습할지 VLA 데이터와 *공동 학습*할지에 따라 적절한 스크립트를 선택합니다.

:::tip[어떻게 선택하나요?]
- **VLM만 파인튜닝하려는 경우**(예: 로봇 액션 없이 도메인 특화 이미지-텍스트 데이터로 파인튜닝), **옵션 A**를 선택하세요.
- **로봇 데이터가 있고 함께 학습하려는 경우**(파국적 망각을 방지하면서 모델이 로봇 제어와 시각-언어 이해를 동시에 학습), **옵션 B**를 선택하세요.
:::

### 옵션 A: VLM 데이터만으로 학습

VLM 전용 사전 학습 또는 파인튜닝에 사용합니다.

**스크립트:** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### 옵션 B: VLM 데이터와 VLA 공동 학습

로보틱스(VLA) 데이터와 멀티모달(VLM) 데이터를 동시에 학습합니다.

**스크립트:** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
