---
title: 자주 묻는 질문
description: StarVLA의 설계 선택과 학습 워크플로우에 관한 일반적인 질문과 답변입니다.
---

### 왜 전처리를 데이터로더에 넣지 않나요?

프로파일링에서 데이터 전처리는 전체 시간의 1% 미만을 차지합니다. 전처리를 Framework 내부에 유지하면 모델별 처리가 가능하며, 데이터로더에 모델 관련 가정이 스며드는 것을 방지할 수 있습니다.

### Qwen2.5-VL 이외의 백본을 사용할 수 있나요?

네. 새로운 비전 및 언어 모듈을 구현하고 Framework 내에서 조합하면 됩니다. Framework가 원시 액션 데이터를 직접 처리하므로 백본 교체가 간편합니다.

### 왜 비전 타워에 대한 추상 인터페이스가 없나요?

VLM이 기본 모델이 되고 자체 비전 타워를 포함할 것으로 예상하기 때문에, 별도의 추상 인터페이스가 필요하지 않습니다.

### 터미널에서 파라미터를 오버라이드하거나 추가할 수 있나요?

네. StarVLA는 `OmegaConf.load(args.config_yaml)`을 단일 설정 진입점으로 사용합니다. CLI에서 값을 오버라이드할 수 있습니다:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module`은 전역 설정에 키만 추가합니다. 실제 동작은 사용자의 Framework에서 정의합니다.

### VLM을 파라미터로 동결할 수 있나요?

네. 모듈 경로를 쉼표로 구분하여 지정합니다:

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

팁: `print(your_model)`을 실행하여 모듈 경로를 확인하세요. 구현은 `TrainerUtils.freeze_backbones`에 있습니다.

### 모듈별로 다른 학습률을 설정할 수 있나요?

네. 모듈별 딕셔너리를 사용합니다:

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

자세한 내용은 `trainer_tools.build_param_lr_groups`를 참조하세요.

### 체크포인트에서 학습을 재개할 수 있나요?

네. 설정 파일에서 최신 체크포인트 경로를 지정합니다:

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

`reload_modules`를 비워두면 전체 모델을 불러옵니다. StarVLA는 Accelerator의 체크포인트 메커니즘을 사용하여 옵티마이저 상태, 학습률 스케줄러 및 기타 학습 상태를 완전히 저장하고 복원하므로 학습이 원활하게 재개됩니다.

### 더 작은 VLM으로 학습하기

Florence-2를 사용하는 예시:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --main_process_ip $MASTER_ADDR \
  --main_process_port $MASTER_PORT \
  --machine_rank $SLURM_PROCID \
  --num_machines $SLURM_NNODES \
  --num_processes=${TOTAL_GPUS} \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.name QwenGR00T \
  --framework.qwenvl.base_vlm microsoft/Florence-2-large \
  --run_root_dir ${run_root_dir} \
  --run_id ${run_id} \
  --wandb_project your_project \
  --wandb_entity your_name
```

참고: `--framework.qwenvl`은 호환성을 위해 향후 릴리스에서 통합될 예정입니다.

### GPU 1개로도 학습할 수 있나요?

네. `--num_processes`를 1로 설정하고, `per_device_batch_size`를 줄이고(예: 1-2), 이를 보상하기 위해 `gradient_accumulation_steps`를 늘리세요. 단일 GPU 학습은 속도가 많이 느려지지만 완전히 작동합니다. 더 작은 모델(예: Qwen2.5-VL-3B)로 시작하는 것을 권장합니다.

### 학습에 얼마나 걸리나요?

데이터셋 크기, GPU 수, 모델 규모에 따라 다릅니다. 참고 사항:
- **8xA800 + Qwen2.5-VL-3B + Bridge 데이터셋**: 50k 스텝에 약 10-20시간.
- **1xRTX 4090 + Qwen2.5-VL-3B + 소규모 데이터셋**: 수일이 소요될 수 있습니다.

먼저 `is_debug: true`로 수백 스텝 정도 빠른 정상 동작 확인을 수행한 뒤 전체 학습을 시작하는 것을 권장합니다.

### 학습을 어떻게 모니터링하나요?

StarVLA는 두 가지 로깅 방법을 지원합니다(YAML 설정의 `trackers` 필드에서 지정):

- **jsonl**: 학습 로그가 체크포인트 디렉토리의 `log.jsonl` 파일에 JSON Lines 형식으로 저장됩니다. 스크립트로 파싱하고 시각화할 수 있습니다.
- **wandb**: 실시간 온라인 모니터링. 설정에서 `wandb_entity`와 `wandb_project`를 입력하면, 학습이 시작되면서 메트릭(손실 곡선, 학습률 등)이 자동으로 [wandb.ai](https://wandb.ai)에 업로드됩니다.

두 가지를 모두 활성화하는 것을 권장합니다: `trackers: [jsonl, wandb]`.
