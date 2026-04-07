---
title: FAQ
description: Haeufige Fragen zu StarVLA-Designentscheidungen und dem Trainings-Workflow.
---

### Warum wird die Vorverarbeitung nicht in den Dataloader verlagert?

Die Datenvorverarbeitung nimmt beim Profiling weniger als 1% der Zeit ein. Wird sie innerhalb des Frameworks belassen, ermoeglicht dies modellspezifische Behandlung, ohne Annahmen in den Dataloader einfliessen zu lassen.

### Kann ich ein anderes Backbone als Qwen2.5-VL verwenden?

Ja. Implementieren Sie neue Vision- und Sprachmodule und kombinieren Sie diese innerhalb eines Frameworks. Da das Framework rohe Aktionsdaten verarbeitet, ist der Austausch von Backbones unkompliziert.

### Warum gibt es kein abstraktes Interface fuer den Vision Tower?

Wir gehen davon aus, dass VLMs das Basismodell darstellen und ihren eigenen nativen Vision Tower mitbringen, sodass ein zusaetzliches abstraktes Interface nicht erforderlich ist.

### Kann ich Parameter ueber das Terminal ueberschreiben oder hinzufuegen?

Ja. StarVLA verwendet `OmegaConf.load(args.config_yaml)` als einzigen Konfigurationseinstiegspunkt. Sie koennen Werte ueber die Kommandozeile ueberschreiben:

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

`framework.action_model.new_module` fuegt lediglich einen Schluessel zur globalen Konfiguration hinzu; das Verhalten wird durch Ihr Framework definiert.

### Kann ich das VLM ueber Parameter einfrieren?

Ja. Verwenden Sie eine kommagetrennte Liste von Modulpfaden:

```
--trainer.freeze_modules "qwen_vl_interface.model.model.visual,dino_encoder"
```

Tipp: Fuehren Sie `print(your_model)` aus, um die Modulpfade zu ueberpruefen. Die Implementierung befindet sich in `TrainerUtils.freeze_backbones`.

### Kann ich verschiedene Lernraten fuer verschiedene Module festlegen?

Ja. Verwenden Sie ein modulspezifisches Dictionary:

```yaml
trainer:
  learning_rate:
    base: 1e-05
    qwen_vl_interface: 1.0e-05
    action_model: 1.0e-04
```

Siehe `trainer_tools.build_param_lr_groups` als Referenz.

### Kann ich das Training von einem Checkpoint aus fortsetzen?

Ja. Geben Sie den Pfad des neuesten Checkpoints in der Konfiguration an:

```yaml
trainer:
  pretrained_checkpoint: path_to_steps_10000.pt
  reload_modules: "action_model"
```

Ein leeres `reload_modules` laedt das vollstaendige Modell. StarVLA nutzt den Checkpoint-Mechanismus von Accelerator, um Optimizer-Zustand, Lernraten-Scheduler und weiteren Trainingszustand vollstaendig zu speichern und wiederherzustellen, sodass das Training nahtlos fortgesetzt wird.

### Mit einem kleineren VLM trainieren

Beispiel mit Florence-2:

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

Hinweis: `--framework.qwenvl` wird aus Kompatibilitaetsgruenden in einer zukuenftigen Version vereinheitlicht.

### Kann ich mit nur 1 GPU trainieren?

Ja. Setzen Sie `--num_processes` auf 1, reduzieren Sie `per_device_batch_size` (z. B. auf 1-2) und erhoehen Sie `gradient_accumulation_steps` zum Ausgleich. Training mit einer einzelnen GPU ist deutlich langsamer, aber voll funktionsfaehig. Wir empfehlen, mit einem kleineren Modell zu beginnen (z. B. Qwen2.5-VL-3B).

### Wie lange dauert das Training?

Das haengt von der Datensatzgroesse, der GPU-Anzahl und der Modellgroesse ab. Als Referenz:
- **8xA800 + Qwen2.5-VL-3B + Bridge-Datensatz**: ca. 10-20 Stunden fuer 50.000 Schritte.
- **1xRTX 4090 + Qwen2.5-VL-3B + kleiner Datensatz**: kann mehrere Tage dauern.

Wir empfehlen, zunaechst einen schnellen Plausibilitaetstest mit `is_debug: true` fuer einige hundert Schritte durchzufuehren und dann das vollstaendige Training zu starten.

### Wie ueberwache ich das Training?

StarVLA unterstuetzt zwei Protokollierungsmethoden (angegeben im Feld `trackers` Ihrer YAML-Konfiguration):

- **jsonl**: Trainingsprotokolle werden als JSON Lines in einer Datei `log.jsonl` im Checkpoint-Verzeichnis gespeichert. Sie koennen diese mit Skripten parsen und visualisieren.
- **wandb**: Echtzeit-Online-Ueberwachung. Tragen Sie `wandb_entity` und `wandb_project` in Ihrer Konfiguration ein, und Metriken (Verlustkurven, Lernraten usw.) werden automatisch auf [wandb.ai](https://wandb.ai) hochgeladen, sobald das Training beginnt.

Wir empfehlen, beide zu aktivieren: `trackers: [jsonl, wandb]`.
