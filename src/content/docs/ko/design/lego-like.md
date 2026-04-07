---
title: 레고 블록 설계
description: StarVLA를 쉽게 확장하고 디버깅할 수 있게 하는 모듈형 설계 원칙입니다.
---

## 서브모듈 스모크 테스트

StarVLA는 모듈형 모델 설계를 강조합니다. 각 주요 프레임워크 파일은 빠른 디버깅과 스모크 테스트를 위해 직접 실행할 수 있습니다:

```bash
# 모델 (설정 파일 위치: starVLA/config/training/starvla_cotrain_oxe.yaml)
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# 데이터로더
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**설계 규칙:** `starVLA/model/framework/<your_framework>.py`는 모델의 단일 외부 API 인터페이스입니다. 논문의 프레임워크 다이어그램을 반영해야 합니다.

## 명시적인 모델 경계

StarVLA는 탑다운 분해와 높은 응집도 / 낮은 결합도(각 모듈이 자신의 책임만 처리하며 모듈 간 간섭이 없음) 원칙을 따릅니다. 데이터로더는 모델 특화 전처리 없이 원시적이고 모델에 구애받지 않는 딕셔너리를 반환해야 합니다.

일반적인 샘플에는 다음이 포함됩니다:

- `image`: `list[PIL.Image] | np.ndarray` — 카메라 이미지(하나 이상의 시점)
- `lang`: `str` — 자연어로 된 태스크 지시문(예: "빨간 블록을 상자에 넣으세요")
- `action`: `np.ndarray[T, action_dim]` — 로봇 액션 시퀀스(T 스텝, 각 스텝은 action_dim 관절 값)
- `state`: `Optional[np.ndarray[..., state_dim]]` — 로봇의 현재 센서 판독값(예: 관절 각도, 엔드 이펙터 위치; 선택 사항)

`framework.forward()`와 `framework.predict_action()` 모두 원시 입력에 대해 직접 작동합니다. 이를 통해 학습/테스트 경계가 명시적으로 유지되어 수정이 용이합니다.

## 유연한 설정 시스템

StarVLA는 OmegaConf(커맨드 라인에서 설정 값 오버라이드를 지원하는 YAML 설정 관리 라이브러리)로 구동되는 단일 전역 설정 객체를 사용합니다. 파라미터는 확장 가능한 딕셔너리를 통해 전달되며, 오버라이드 및 제어된 중복이 가능합니다.

예시(CLI 오버라이드):

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**참고:** `framework.action_model.new_module`은 전역 설정에 키만 추가합니다. 실제 동작은 사용자의 Framework 구현에서 정의합니다.

## 새로운 프레임워크 추가 방법

자체 모델 아키텍처를 통합하고 싶으신가요? 세 단계만 거치면 됩니다:

1. **프레임워크 파일 생성**: `starVLA/model/framework/` 아래에 `YourFramework.py`를 추가하고, 기본 클래스를 상속하여 `forward()` 및 `predict_action()` 메서드를 구현합니다.
2. **스모크 테스트 작성**: 파일 끝에 `if __name__ == "__main__":` 진입점을 추가하여 가짜 데이터로 순전파와 액션 예측이 작동하는지 확인합니다.
3. **설정에 등록**: 학습 YAML 설정에서 `framework.name: YourFramework`를 설정하여 기존 학습 및 평가 파이프라인에 연결합니다.

`QwenGR00T.py` 또는 `QwenOFT.py`를 템플릿으로 사용하세요.
