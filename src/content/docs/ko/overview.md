---
title: 프로젝트 개요
description: StarVLA의 정의, 현재 지원 기능 및 핵심 기능의 위치를 안내합니다.
---

## 비전

StarVLA는 **Vision-Language Model(VLM)**을 **Vision-Language-Action(VLA) 모델**로 개발하기 위한 레고 블록 방식의 모듈형 코드베이스입니다.

요약하면: VLM은 이미지와 텍스트를 이해하고, VLA는 여기에 로봇 동작 출력을 추가합니다. StarVLA는 데이터 준비, 모델 학습, 시뮬레이션 평가에 이르는 전 과정을 처리하며, 각 구성 요소는 **독립적으로 디버깅하고 플러그 앤 플레이 방식으로 교체**할 수 있습니다.

## 주요 기능

### VLA 프레임워크

StarVLA는 Qwen-VL 기반의 StarVLA Model Family를 공식적으로 제공하며, 4가지 액션 출력 전략을 지원합니다:

| 프레임워크 | 액션 출력 방식 | 참조 |
|-----------|--------------|-----------|
| **Qwen-FAST** | 액션을 이산 토큰으로 인코딩하여 언어 모델이 예측 | pi0-FAST |
| **Qwen-OFT** | VLM 출력 이후 MLP 헤드로 연속 액션 값을 직접 회귀 | OpenVLA-OFT |
| **Qwen-PI** | Flow-Matching(확산 기반) 방식으로 연속 액션 생성 | pi0 |
| **Qwen-GR00T** | 이중 시스템: VLM으로 고수준 추론 + DiT로 빠른 액션 생성 | GR00T-N1 |

**모듈화의 장점**: Framework에서 모델 구조만 정의하면, 공유 Trainer, Dataloader, 평가/배포 파이프라인을 재사용할 수 있습니다. 학습 루프나 평가 코드를 새로 작성할 필요가 없습니다.

### 학습 전략

- 단일 태스크 모방 학습(사람의 시연으로부터 학습 — 보상 함수 불필요).
- 멀티모달 다중 태스크 공동 학습(여러 데이터 소스로 동시 학습하여 모델이 이전에 습득한 능력을 잊지 않도록 함).
- **\[계획 중\]** 강화 학습 적용.

### 시뮬레이션 벤치마크

지원 또는 계획 중인 벤치마크:

- 지원 중: SimplerEnv, LIBERO, RoboCasa, RoboTwin, CALVIN, BEHAVIOR.
- 계획 중: SO101, RLBench.

#### 주요 벤치마크 결과

![SimplerEnv에서의 StarVLA 결과.](../../../assets/starvla_simpleEnv.png)

![LIBERO에서의 StarVLA 결과.](../../../assets/starvla_LIBERO.png)

![RoboCasa에서의 StarVLA 결과.](../../../assets/stavla_RoboCasa.png)

### 결과 및 리포트

결과는 실시간 Overleaf 리포트에서 지속적으로 추적됩니다(최신 벤치마크 데이터와 분석이 포함된 실험 보고서 PDF): https://www.overleaf.com/read/qqtwrnprctkf#d5bdce

## 다음 단계

- [빠른 시작](/docs/ko/getting-started/quick-start/)에서 환경 설정 및 설치 확인을 진행하세요.
- [레고 블록 설계](/docs/ko/design/lego-like/)에서 설계 원칙을 살펴보세요.
- [모델 저장소](/docs/ko/model-zoo/)에서 체크포인트를 확인하세요.

## 커뮤니티 및 링크

- Hugging Face: https://huggingface.co/StarVLA
- WeChat 그룹: https://github.com/starVLA/starVLA/issues/64#issuecomment-3715403845

---

**StarVLA 기반 프로젝트:**

- NeuroVLA: [A Brain-like Embodied Intelligence for Fluid and Fast Reflexive Robotics Control](https://github.com/guoweiyu/NeuroVLA)
- PhysBrain: [Human Egocentric Data as a Bridge from Vision Language Models to Physical Intelligence](https://zgc-embodyai.github.io/PhysBrain/)
- TwinBrainVLA: [Unleashing the Potential of Generalist VLMs for Embodied Tasks via Asymmetric Mixture-of-Transformers](https://github.com/ZGC-EmbodyAI/TwinBrainVLA)
- LangForce: [Bayesian Decomposition of Vision Language Action Models via Latent Action Queries](https://github.com/ZGC-EmbodyAI/LangForce)

---

**최근 업데이트**

- **2025/12/25**: Behavior-1K, RoboTwin 2.0, CALVIN 파이프라인 구축 완료; 커뮤니티와 베이스라인 공유 예정.
- **2025/12/25**: RoboCasa 평가 지원 공개, 사전 학습 없이 SOTA 달성. [RoboCasa 문서](/docs/ko/benchmarks/robocasa/)를 참조하세요.
- **2025/12/15**: 릴리스 회귀 테스트 완료; [일일 개발 로그](https://github.com/starVLA/starVLA/issues/64#issue-3727060165)에서 업데이트를 확인할 수 있습니다.
- **2025/12/09**: VLM, VLA, VLA+VLM 공동 학습을 위한 오픈소스 학습 코드 공개. [VLM 공동 학습 문서](/docs/ko/training/cotrain-vlm/)를 참조하세요.
- **2025/11/12**: 자원 제약 환경에서의 VLM 학습을 위한 Florence-2 지원 추가(단일 A100). 워크플로우 관련 사항은 [레고 블록 설계](/docs/ko/design/lego-like/)를 참조하세요.
- **2025/10/30**: LIBERO 학습 및 평가 가이드 공개.
- **2025/10/25**: 커뮤니티 피드백을 반영하여 스크립트 링크 및 패키징 개선.
