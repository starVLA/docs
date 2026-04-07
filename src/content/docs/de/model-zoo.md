---
title: Model Zoo
description: Veroeffentlichte modifizierte Modelle, Feinabstimmungs-Checkpoints und Datensaetze.
---

## Verfuegbare modifizierte Modelle

| Modell | Beschreibung | Link |
| --- | --- | --- |
| **Qwen2.5-VL-3B-Action** | Erweiterung des Qwen2.5-VL-Vokabulars um Fast-Tokens (spezielle Vokabularerweiterung zur Diskretisierung kontinuierlicher Aktionen in Tokens) | [Hugging Face](https://huggingface.co/StarVLA/Qwen2.5-VL-3B-Instruct-Action) |
| **Qwen3-VL-4B-Action** | Erweiterung des Qwen3-VL-Vokabulars um Fast-Tokens (wie oben) | [Hugging Face](https://huggingface.co/StarVLA/Qwen3-VL-4B-Instruct-Action) |
| **pi-fast** | pi-fast Action-Tokenizer-Gewichte | [Hugging Face](https://huggingface.co/StarVLA/pi-fast) |

## Feinabstimmungs-Checkpoints

### SimplerEnv / Bridge

Bridge ist ein WidowX-Tischmanipulationsdatensatz; Fractal ist Googles RT-1-Robotermanipulationsdatensatz.

| Modell | Framework | Basis-VLM | Beschreibung | WidowX | Link |
| --- | --- | --- | --- | --- | --- |
| **Qwen2.5-FAST-Bridge-RT-1** | QwenFast | Qwen2.5-VL-3B | Bridge + Fractal | 58.6 | [HF](https://huggingface.co/StarVLA/Qwen-FAST-Bridge-RT-1) |
| **Qwen2.5-OFT-Bridge-RT-1** | QwenOFT | Qwen2.5-VL-3B | Bridge + Fractal | 41.8 | [HF](https://huggingface.co/StarVLA/Qwen-OFT-Bridge-RT-1) |
| **Qwen2.5-PI-Bridge-RT-1** | QwenPI | Qwen2.5-VL-3B | Bridge + Fractal | 62.5 | [HF](https://huggingface.co/StarVLA/Qwen-PI-Bridge-RT-1) |
| **Qwen2.5-GR00T-Bridge-RT-1** | QwenGR00T | Qwen2.5-VL-3B | Bridge + Fractal | 63.6 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge-RT-1) |
| **Qwen-GR00T-Bridge** | QwenGR00T | Qwen2.5-VL-3B | Nur Bridge | 71.4 | [HF](https://huggingface.co/StarVLA/Qwen-GR00T-Bridge) |
| **Qwen3VL-OFT-Bridge-RT-1** | QwenOFT | Qwen3-VL-4B | Bridge + Fractal | 42.7 | [HF](https://huggingface.co/StarVLA/Qwen3VL-OFT-Bridge-RT-1) |
| **Qwen3VL-GR00T-Bridge-RT-1** | QwenGR00T | Qwen3-VL-4B | Bridge + Fractal | 65.3 | [HF](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1) |
| **Florence-GR00T-Bridge-RT-1** | QwenGR00T | Florence-2 | Bridge + Fractal (kleines Modell) | - | [HF](https://huggingface.co/StarVLA/Florence-GR00T-Bridge-RT-1) |

**WidowX-Spalte**: Erfolgsrate (%) bei WidowX-Roboteraufgaben in [SimplerEnv](/docs/de/benchmarks/simplerenv/). Hoeher ist besser.

### LIBERO

LIBERO umfasst 4 Aufgabensuiten (Spatial, Object, Goal, Long Horizon) mit insgesamt 40 Aufgaben. Alle Checkpoints werden gemeinsam auf allen 4 Suiten trainiert. Siehe [LIBERO-Evaluationsdokumentation](/docs/de/benchmarks/libero/).

| Modell | Framework | Basis-VLM | Link |
| --- | --- | --- | --- |
| **Qwen2.5-VL-FAST-LIBERO-4in1** | QwenFast | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-FAST-LIBERO-4in1) |
| **Qwen2.5-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-OFT-LIBERO-4in1) |
| **Qwen2.5-VL-GR00T-LIBERO-4in1** | QwenGR00T | Qwen2.5-VL-3B | [HF](https://huggingface.co/StarVLA/Qwen2.5-VL-GR00T-LIBERO-4in1) |
| **Qwen3-VL-OFT-LIBERO-4in1** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) |
| **Qwen3-VL-PI-LIBERO-4in1** | QwenPI | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-PI-LIBERO-4in1) |

### RoboCasa

RoboCasa GR1 Tischaufgaben mit 24 Pick-and-Place-Aufgaben. Siehe [RoboCasa-Evaluationsdokumentation](/docs/de/benchmarks/robocasa/).

| Modell | Framework | Basis-VLM | Link |
| --- | --- | --- | --- |
| **Qwen3-VL-GR00T-Robocasa-gr1** | QwenGR00T | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1) |
| **Qwen3-VL-OFT-Robocasa** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa) |

### RoboTwin

RoboTwin 2.0 Zweiarm-Manipulations-Benchmark mit 50 Aufgaben. Siehe [RoboTwin-Evaluationsdokumentation](/docs/de/benchmarks/robotwin/).

| Modell | Framework | Basis-VLM | Link |
| --- | --- | --- | --- |
| **Qwen3-VL-OFT-Robotwin2-All** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2-All) |
| **Qwen3-VL-OFT-Robotwin2** | QwenOFT | Qwen3-VL-4B | [HF](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robotwin2) |

### BEHAVIOR-1K

BEHAVIOR-1K Haushaltsaufgaben-Benchmark mit R1Pro-Humanoiden. Siehe [BEHAVIOR-Evaluationsdokumentation](/docs/de/benchmarks/behavior/).

| Modell | Beschreibung | Link |
| --- | --- | --- |
| **BEHAVIOR-QwenDual-taskall** | Gemeinsam auf allen 50 Aufgaben trainiert | [HF](https://huggingface.co/StarVLA/1120_BEHAVIOR_challenge_QwenDual_taskall) |
| **BEHAVIOR-QwenDual-task1** | Einzelaufgaben-Training | [HF](https://huggingface.co/StarVLA/1117_BEHAVIOR_challenge_QwenDual_task1) |
| **BEHAVIOR-QwenDual-task6-40k** | 6-Aufgaben gemeinsames Training | [HF](https://huggingface.co/StarVLA/1115_BEHAVIOR_rgp_dual_QwenDual_task6_40k) |
| **BEHAVIOR-rgp-seg** | Segmentierungs-Beobachtungsexperiment | [HF](https://huggingface.co/StarVLA/BEHAVIOR-qwendual-state-tast1-chunck50-BEHAVIOR-rgp-seg) |

---

## Datensaetze

### Trainingsdatensaetze

| Datensatz | Beschreibung | Link |
| --- | --- | --- |
| **LLaVA-OneVision-COCO** | Bild-Text-Datensatz fuer VLM-Co-Training (ShareGPT4V-COCO-Teilmenge) | [HF](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) |
| **RoboTwin-Clean** | RoboTwin 2.0 bereinigte Demonstrationen (50 pro Aufgabe) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Clean) |
| **RoboTwin-Randomized** | RoboTwin 2.0 randomisierte Demonstrationen (500 pro Aufgabe) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized) |
| **RoboTwin-Randomized-targz** | Wie oben, im tar.gz-Paketformat (fuer Massen-Download) | [HF](https://huggingface.co/datasets/StarVLA/RoboTwin-Randomized-targz) |

### BEHAVIOR-Daten

| Datensatz | Beschreibung | Link |
| --- | --- | --- |
| **BEHAVIOR-1K** | BEHAVIOR-1K-Benchmark-Simulationskonfigurationen | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K) |
| **BEHAVIOR-1K-datasets** | BEHAVIOR-1K-Trainingsdatensaetze | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets) |
| **BEHAVIOR-1K-datasets-assets** | BEHAVIOR-1K-Szenen- und Objekt-Assets | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-datasets-assets) |
| **BEHAVIOR-1K-VISUALIZATION-DEMO** | BEHAVIOR-1K-Visualisierungsdemos | [HF](https://huggingface.co/datasets/StarVLA/BEHAVIOR-1K-VISUALIZATION-DEMO) |
| **behavior-1k-task0** | Einzelaufgaben-Trainingsdatenbeispiel | [HF](https://huggingface.co/datasets/StarVLA/behavior-1k-task0) |

:::tip
Neben den oben genannten StarVLA-eigenen Datensaetzen werden haeufig folgende Drittanbieter-Datensaetze fuer das Training verwendet:
- **SimplerEnv/OXE**: [Bridge](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot), [Fractal](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)
- **LIBERO**: [Spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot), [Object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot), [Goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot), [10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)
- **RoboCasa**: [PhysicalAI-Robotics-GR00T-X](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim)
:::

---

## Wie Sie einen Checkpoint verwenden

Laden Sie einen Checkpoint herunter und starten Sie den Policy-Server:

```bash
# Herunterladen (erfordert huggingface_hub)
huggingface-cli download StarVLA/Qwen3VL-GR00T-Bridge-RT-1 --local-dir ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1

# Policy-Server starten
python deployment/model_server/server_policy.py \
    # steps_XXXXX ist die Trainingsschrittzahl — ersetzen Sie dies durch den tatsaechlichen Dateinamen aus Ihrem Download
    # z. B. steps_50000_pytorch_model.pt; fuehren Sie `ls` aus, um den genauen Dateinamen zu sehen
    --ckpt_path ./results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_XXXXX_pytorch_model.pt \
    --port 5694 \
    --use_bf16
```

Folgen Sie dann dem Evaluationsleitfaden fuer den Benchmark, den Sie testen moechten (z. B. [SimplerEnv](/docs/de/benchmarks/simplerenv/), [LIBERO](/docs/de/benchmarks/libero/), [RoboCasa](/docs/de/benchmarks/robocasa/), [RoboTwin](/docs/de/benchmarks/robotwin/), [BEHAVIOR](/docs/de/benchmarks/behavior/)).
