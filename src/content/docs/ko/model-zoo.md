---
title: 모델 저장소
description: 공개된 수정 모델, 파인튜닝 체크포인트 및 데이터셋 목록입니다.
---

## 사용 가능한 수정 모델

| 모델 | 설명 | 링크 |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Qwen2.5-VL 어휘에 fast 토큰 추가(연속 액션을 토큰으로 이산화하기 위한 특수 어휘 확장) | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Qwen3-VL 어휘에 fast 토큰 추가(위와 동일) | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | pi-fast 액션 토크나이저 가중치 | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## 파인튜닝 체크포인트

### SimplerEnv / Bridge

Bridge는 WidowX 테이블탑 조작 데이터셋이고, Fractal은 Google의 RT-1 로봇 조작 데이터셋입니다.

| 모델 | 프레임워크 | 기본 VLM | 설명 | WidowX | 링크 |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | Bridge 단독 | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal(소형 모델) | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**WidowX 열**: [SimplerEnv](/docs/ko/benchmarks/simplerenv/) WidowX 로봇 태스크에서의 성공률(%). 높을수록 좋습니다.

### LIBERO

LIBERO는 4개의 태스크 세트(Spatial, Object, Goal, Long Horizon)로 구성되며 총 40개의 태스크가 있습니다. 모든 체크포인트는 4개 세트를 함께 학습한 것입니다. [LIBERO 평가 문서](/docs/ko/benchmarks/libero/)를 참조하세요.

| 모델 | 프레임워크 | 기본 VLM | 링크 |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

RoboCasa GR1 테이블탑 태스크로, 24개의 Pick-and-Place 태스크가 포함됩니다. [RoboCasa 평가 문서](/docs/ko/benchmarks/robocasa/)를 참조하세요.

| 모델 | 프레임워크 | 기본 VLM | 링크 |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

RoboTwin 2.0은 50개의 태스크를 포함하는 양팔 조작 벤치마크입니다. [RoboTwin 평가 문서](/docs/ko/benchmarks/robotwin/)를 참조하세요.

| 모델 | 프레임워크 | 기본 VLM | 링크 |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

R1Pro 휴머노이드 로봇을 사용하는 BEHAVIOR-1K 가정용 태스크 벤치마크입니다. [BEHAVIOR 평가 문서](/docs/ko/benchmarks/behavior/)를 참조하세요.

| 모델 | 설명 | 링크 |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | 50개 전체 태스크에 대해 공동 학습 | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | 단일 태스크 학습 | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | 6개 태스크 공동 학습 | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | 세그멘테이션 관찰 실험 | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## 데이터셋

### 학습 데이터셋

| 데이터셋 | 설명 | 링크 |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | VLM 공동 학습을 위한 이미지-텍스트 데이터셋(ShareGPT4V-COCO 서브셋) | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | RoboTwin 2.0 클린 시연(태스크당 50개) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | RoboTwin 2.0 랜덤화된 시연(태스크당 500개) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | 위와 동일, tar.gz 패키지 형식(대량 다운로드용) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### BEHAVIOR 데이터

| 데이터셋 | 설명 | 링크 |
| --- | --- | --- |
| **BEHAVIOR-1K** | BEHAVIOR-1K 벤치마크 시뮬레이션 설정 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | BEHAVIOR-1K 학습 데이터셋 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | BEHAVIOR-1K 씬 및 오브젝트 에셋 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | BEHAVIOR-1K 시각화 데모 | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | 단일 태스크 학습 데이터 샘플 | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
위의 StarVLA 자체 데이터셋 외에도, 학습에 자주 사용되는 서드파티 데이터셋은 다음과 같습니다:
- **SimplerEnv/OXE**: [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot), [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO**: [Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot), [Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot), [Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot), [10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa**: [PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## 체크포인트 사용 방법

체크포인트를 다운로드하고 정책 서버를 실행합니다:

```bash
# 다운로드 (huggingface_hub 필요)
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# 정책 서버 시작
python deployment/model_server/server_policy.py \
    # steps_XXXXX는 학습 스텝 수입니다 — 다운로드한 실제 파일명으로 교체하세요
    # 예: steps_50000_pytorch_model.pt; `ls`로 정확한 파일명을 확인하세요
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

그런 다음 테스트하려는 벤치마크의 평가 가이드를 따르세요(예: [SimplerEnv](/docs/ko/benchmarks/simplerenv/), [LIBERO](/docs/ko/benchmarks/libero/), [RoboCasa](/docs/ko/benchmarks/robocasa/), [RoboTwin](/docs/ko/benchmarks/robotwin/), [BEHAVIOR](/docs/ko/benchmarks/behavior/)).
