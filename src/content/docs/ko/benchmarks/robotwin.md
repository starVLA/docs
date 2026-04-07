---
title: RoboTwin 평가
description: RoboTwin 2.0 벤치마크에서의 StarVLA 실험 결과를 재현합니다.
---

**RoboTwin 2.0**은 50개의 태스크와 2가지 난이도(Easy / Hard, 서로 다른 장면 랜덤화)를 갖춘 양팔 로봇 조작 벤치마크로, 잡기, 쌓기, 도구 사용 등 다양한 조작 유형을 다룹니다.

이 문서는 [RoboTwin 2.0](https://github.com/RoboTwin-Platform/RoboTwin)에서의 **실험 결과 재현** 방법을 안내합니다.

평가 과정은 크게 두 부분으로 구성됩니다:

1. `robotwin` 환경 및 의존성 설정.
2. `starVLA`와 `robotwin` 환경 모두에서 서비스를 시작하여 평가 실행.

:::note[왜 두 개의 터미널이 필요한가요?]
모델 추론(starVLA 환경)과 시뮬레이션(robotwin 환경)은 서로 다른 Python 패키지 버전에 의존하며, 같은 conda 환경에 설치하면 충돌이 발생합니다. 별도의 터미널에서 별도의 conda 환경으로 실행하면 이를 피할 수 있습니다.
:::

이 워크플로우는 **NVIDIA 4090** GPU에서 정상 작동이 확인되었습니다.

---

## 실험 결과

RoboTwin 2.0 벤치마크 50개 태스크 결과:

| Task Name | StarVLA-OFT Easy | StarVLA-OFT Hard | π0 Easy | π0 Hard | π0.5 Easy | π0.5 Hard | X-VLA Easy | X-VLA Hard | Motus Easy | Motus Hard | lingbot-vla w/o depth Easy | lingbot-vla w/o depth Hard | lingbot-vla w/ depth Easy | lingbot-vla w/ depth Hard |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Adjust Bottle | 100 | 99 | 99 | 95 | 100 | 99 | 100 | 99 | 89 | 93 | 100 | 100 | 100 | 100 |
| Beat Block Hammer | 93 | 92 | 79 | 84 | 96 | 93 | 92 | 88 | 95 | 88 | 87 | 91 | 92 | 89 |
| Blocks Ranking RGB | 99 | 98 | 80 | 63 | 92 | 85 | 83 | 83 | 99 | 97 | 92 | 91 | 92 | 91 |
| Blocks Ranking Size | 79 | 80 | 14 | 5 | 49 | 26 | 67 | 74 | 75 | 63 | 66 | 73 | 76 | 70 |
| Click Alarmclock | 58 | 51 | 77 | 68 | 98 | 89 | 99 | 99 | 100 | 100 | 93 | 26 | 97 | 43 |
| Click Bell | 23 | 27 | 71 | 48 | 99 | 66 | 100 | 100 | 100 | 100 | 32 | 19 | 43 | 36 |
| Dump Bin Bigbin | 91 | 94 | 88 | 83 | 92 | 97 | 79 | 77 | 95 | 91 | 97 | 92 | 97 | 97 |
| Grab Roller | 100 | 100 | 98 | 94 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 99 | 100 | 100 |
| Handover Block | 97 | 93 | 47 | 31 | 66 | 57 | 73 | 37 | 86 | 73 | 80 | 83 | 83 | 95 |
| Handover Mic | 98 | 96 | 97 | 97 | 98 | 97 | 0 | 0 | 78 | 63 | 94 | 98 | 94 | 99 |
| Hanging Mug | 34 | 29 | 14 | 11 | 18 | 17 | 23 | 27 | 38 | 38 | 32 | 27 | 34 | 53 |
| Lift Pot | 100 | 100 | 80 | 72 | 96 | 85 | 99 | 100 | 96 | 99 | 100 | 99 | 100 | 100 |
| Move Can Pot | 91 | 90 | 68 | 48 | 51 | 55 | 89 | 86 | 34 | 74 | 79 | 84 | 89 | 87 |
| Move Pillbottle Pad | 98 | 100 | 67 | 46 | 84 | 61 | 73 | 71 | 93 | 96 | 93 | 94 | 92 | 90 |
| Move Playingcard Away | 100 | 98 | 74 | 65 | 96 | 84 | 93 | 98 | 100 | 96 | 96 | 99 | 98 | 100 |
| Move Stapler Pad | 74 | 90 | 41 | 24 | 56 | 42 | 78 | 73 | 83 | 85 | 74 | 49 | 74 | 48 |
| Open Laptop | 98 | 100 | 71 | 81 | 90 | 96 | 93 | 100 | 95 | 91 | 96 | 96 | 98 | 96 |
| Open Microwave | 28 | 39 | 4 | 32 | 34 | 77 | 79 | 71 | 95 | 91 | 91 | 75 | 91 | 92 |
| Pick Diverse Bottles | 87 | 86 | 69 | 31 | 81 | 71 | 58 | 36 | 90 | 91 | 79 | 86 | 88 | 85 |
| Pick Dual Bottles | 91 | 93 | 59 | 37 | 93 | 63 | 47 | 36 | 96 | 90 | 82 | 95 | 99 | 90 |
| Place A2B Left | 90 | 95 | 43 | 47 | 87 | 82 | 48 | 49 | 82 | 79 | 86 | 83 | 89 | 85 |
| Place A2B Right | 88 | 95 | 39 | 34 | 87 | 84 | 36 | 36 | 90 | 87 | 74 | 77 | 80 | 80 |
| Place Bread Basket | 91 | 78 | 62 | 46 | 77 | 64 | 81 | 71 | 91 | 94 | 92 | 93 | 95 | 93 |
| Place Bread Skillet | 89 | 80 | 66 | 49 | 85 | 66 | 77 | 67 | 86 | 83 | 90 | 89 | 90 | 92 |
| Place Burger Fries | 100 | 100 | 81 | 76 | 94 | 87 | 94 | 94 | 98 | 98 | 95 | 96 | 98 | 94 |
| Place Can Basket | 75 | 75 | 55 | 46 | 62 | 62 | 49 | 52 | 81 | 76 | 68 | 78 | 75 | 72 |
| Place Cans Plasticbox | 100 | 99 | 63 | 45 | 94 | 84 | 97 | 98 | 98 | 94 | 97 | 100 | 100 | 98 |
| Place Container Plate | 99 | 99 | 97 | 92 | 99 | 95 | 97 | 95 | 98 | 99 | 99 | 99 | 99 | 100 |
| Place Dual Shoes | 91 | 89 | 59 | 51 | 75 | 75 | 79 | 88 | 93 | 87 | 80 | 83 | 87 | 86 |
| Place Empty Cup | 100 | 100 | 91 | 85 | 100 | 99 | 100 | 98 | 99 | 98 | 100 | 100 | 100 | 100 |
| Place Fan | 94 | 95 | 66 | 71 | 87 | 85 | 80 | 75 | 91 | 87 | 91 | 79 | 92 | 87 |
| Place Mouse Pad | 87 | 94 | 20 | 20 | 60 | 39 | 70 | 70 | 66 | 68 | 82 | 78 | 86 | 79 |
| Place Object Basket | 93 | 94 | 67 | 70 | 80 | 76 | 44 | 39 | 81 | 87 | 90 | 91 | 90 | 88 |
| Place Object Scale | 93 | 93 | 57 | 52 | 86 | 80 | 52 | 74 | 88 | 85 | 84 | 90 | 90 | 88 |
| Place Object Stand | 99 | 98 | 82 | 68 | 91 | 85 | 86 | 88 | 98 | 97 | 97 | 93 | 93 | 88 |
| Place Phone Stand | 86 | 95 | 49 | 53 | 81 | 81 | 88 | 87 | 87 | 86 | 92 | 93 | 90 | 87 |
| Place Shoe | 96 | 100 | 76 | 76 | 92 | 93 | 96 | 95 | 99 | 97 | 99 | 94 | 99 | 99 |
| Press Stapler | 99 | 96 | 44 | 37 | 87 | 83 | 92 | 98 | 93 | 98 | 90 | 88 | 86 | 93 |
| Put Bottles Dustbin | 90 | 85 | 65 | 56 | 84 | 79 | 74 | 77 | 81 | 79 | 88 | 92 | 92 | 93 |
| Put Object Cabinet | 89 | 91 | 73 | 60 | 80 | 79 | 46 | 48 | 88 | 71 | 92 | 86 | 85 | 88 |
| Rotate QRcode | 88 | 90 | 74 | 70 | 89 | 87 | 34 | 33 | 89 | 73 | 93 | 84 | 86 | 82 |
| Scan Object | 94 | 91 | 55 | 42 | 72 | 65 | 14 | 36 | 67 | 66 | 91 | 97 | 92 | 96 |
| Shake Bottle Horizontally | 100 | 100 | 98 | 92 | 99 | 99 | 100 | 100 | 100 | 98 | 100 | 100 | 99 | 98 |
| Shake Bottle | 100 | 100 | 94 | 91 | 99 | 97 | 99 | 100 | 100 | 97 | 99 | 100 | 100 | 99 |
| Stack Blocks Three | 94 | 86 | 72 | 52 | 91 | 76 | 6 | 10 | 91 | 95 | 92 | 99 | 96 | 95 |
| Stack Blocks Two | 100 | 100 | 93 | 79 | 97 | 100 | 92 | 87 | 100 | 98 | 100 | 100 | 100 | 99 |
| Stack Bowls Three | 95 | 91 | 77 | 75 | 77 | 71 | 76 | 86 | 79 | 87 | 72 | 83 | 71 | 77 |
| Stack Bowls Two | 99 | 100 | 94 | 95 | 95 | 96 | 96 | 93 | 98 | 98 | 92 | 95 | 90 | 97 |
| Stamp Seal | 86 | 90 | 46 | 33 | 79 | 55 | 76 | 82 | 93 | 92 | 76 | 86 | 74 | 77 |
| Turn Switch | 65 | 62 | 41 | 42 | 62 | 54 | 40 | 61 | 84 | 78 | 61 | 65 | 67 | 63 |
| **평균** | **88.18** | **88.32** | **65.92** | **58.40** | **82.74** | **76.76** | **72.80** | **72.84** | **88.66** | **87.02** | **86.50** | **85.34** | **88.56** | **86.68** |

*참고: 50개 전체 태스크를 단일 모델로 학습했으며, 태스크당 50개의 클린 시연과 500개의 랜덤화된 시연으로 공동 학습했습니다.*

---

## RoboTwin 평가

### 1. 환경 설정

환경 설정을 위해 먼저 [공식 RoboTwin 설치 가이드](https://robotwin-platform.github.io/doc/usage/robotwin-install.html)를 참고하여 기본 `robotwin` 환경을 설치하세요.

그런 다음 추가 요구사항을 설치합니다:

```bash
pip install -r examples/Robotwin/eval_files/requirements.txt
```

그리고 `examples/Robotwin/eval_files/eval.sh`에서 `ROBOTWIN_PATH`를 편집합니다.

---

### 2. 평가 워크플로우

#### 1단계. 서버 시작 (starVLA 환경)

첫 번째 터미널에서 `starVLA` conda 환경을 활성화하고 실행합니다:

```bash
bash examples/Robotwin/eval_files/run_policy_server.sh
```

`examples/Robotwin/eval_files/deploy_policy.yml`과 `examples/Robotwin/eval_files/run_policy_server.sh`에서 체크포인트 경로를 편집하세요.

---

#### 2단계. 시뮬레이션 시작 (robotwin 환경)

두 번째 터미널에서 `robotwin` conda 환경을 활성화하고 실행합니다:

```bash
conda activate robotwin
cd examples/Robotwin/eval_files
bash eval.sh task_name demo_clean my_test_v1 0 0
```

`eval.sh` 스크립트는 5개의 위치 인자를 받습니다:

| 위치 | 의미 | 예시 |
|----------|---------|---------|
| 1 | 태스크 이름 (아래 목록 참조) | `adjust_bottle` |
| 2 | 데이터 모드 (`demo_clean` 또는 `demo_randomized`) | `demo_clean` |
| 3 | 실험 이름 (로깅용) | `my_test_v1` |
| 4 | 시작 에피소드 인덱스 | `0` |
| 5 | 시뮬레이션용 GPU ID | `0` |

RoboTwin 2.0의 전체 태스크 목록:

```txt
adjust_bottle, beat_block_hammer, blocks_ranking_rgb, blocks_ranking_size,
click_alarmclock, click_bell, dump_bin_bigbin, grab_roller,
handover_block, handover_mic, hanging_mug, lift_pot,
move_can_pot, move_pillbottle_pad, move_playingcard_away, move_stapler_pad,
open_laptop, open_microwave, pick_diverse_bottles, pick_dual_bottles,
place_a2b_left, place_a2b_right, place_bread_basket, place_bread_skillet,
place_burger_fries, place_can_basket, place_cans_plasticbox, place_container_plate,
place_dual_shoes, place_empty_cup, place_fan, place_mouse_pad,
place_object_basket, place_object_scale, place_object_stand, place_phone_stand,
place_shoe, press_stapler, put_bottles_dustbin, put_object_cabinet,
rotate_qrcode, scan_object, shake_bottle_horizontally, shake_bottle,
stack_blocks_three, stack_blocks_two, stack_bowls_three, stack_bowls_two,
stamp_seal, turn_switch
```

모든 모드에는 `demo_clean`과 `demo_randomized`가 포함됩니다.
