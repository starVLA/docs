---
title: 기여하기
description: 이슈 보고, 변경 제안 및 StarVLA 인용 방법을 안내합니다.
---

## 기여 방법

1. **먼저 이슈를 등록하세요**: Issue를 생성합니다. 추가 설명이 필요한 경우 Discussion을 시작하세요.
2. **변경 사항 제안**: Issue 또는 짧은 미팅(협력 양식)을 통해 범위와 설계를 맞춘 후 PR을 생성하세요.
3. **도움이 필요할 때**: 협력 양식을 작성하고 금요일 오후 오피스 아워에 참여하여 실시간으로 논의하세요.

협력 양식: https://forms.gle/R4VvgiVveULibTCCA

## PR 체크리스트

- 간단한 요약과 관련 Issue 링크를 포함하세요.
- 시각적 변경 사항에는 스크린샷이나 GIF를 첨부하세요.
- 제출 전 로컬 검사를 실행하세요(예: 메인 저장소에서 `make check`).

## 인용

```bibtex
@misc{starvla2025,
  title  = {StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing},
  author = {starVLA Community},
  url = {https://github.com/starVLA/starVLA},
  year   = {2025}
}
```

## 라이선스 및 리베이스 참고사항

StarVLA는 MIT 라이선스로 배포되며, 상업적 사용, 수정, 배포 및 개인 사용이 허용됩니다.

상위 StarVLA에서 리베이스할 때는 설명적인 커밋 메시지를 사용하고(예: `chore: rebase from StarVLA`), 최소 최근 2개의 상위 커밋을 별도로 유지하세요.
