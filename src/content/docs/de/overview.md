---
title: Projektuebersicht
description: Was StarVLA ist, was es heute unterstuetzt und wo Sie die Kernfunktionen finden.
---

## Vision

StarVLA ist eine modulare Codebasis nach dem Baukastenprinzip zur Entwicklung von **Vision-Language-Modellen (VLMs)** zu **Vision-Language-Action-Modellen (VLA)**.

Kurz gesagt: VLMs verstehen Bilder und Text; VLAs geben zusaetzlich Roboter-Aktionen aus. StarVLA uebernimmt diese Transformation durchgaengig -- von der Datenvorbereitung ueber das Modelltraining bis zur Simulationsevaluation -- mit Komponenten, die **unabhaengig debuggbar und per Plug-and-Play einsetzbar** sind.

## Hauptmerkmale

### VLA-Frameworks

StarVLA stellt offiziell die auf Qwen-VL basierende StarVLA-Modellfamilie mit 4 verschiedenen Aktionsausgabestrategien bereit:

| Framework | Aktionsausgabe | Referenz |
|-----------|--------------|-----------|
| **Qwen-FAST** | Kodiert Aktionen als diskrete Tokens, die vom Sprachmodell vorhergesagt werden | pi0-FAST |
| **Qwen-OFT** | MLP-Kopf nach der VLM-Ausgabe, direkte Regression kontinuierlicher Aktionswerte | OpenVLA-OFT |
| **Qwen-PI** | Flow-Matching (diffusionsbasierte) Methode zur Erzeugung kontinuierlicher Aktionen | pi0 |
| **Qwen-GR00T** | Duales System: VLM fuer High-Level-Reasoning + DiT fuer schnelle Aktionsgenerierung | GR00T-N1 |

**Modularitaet bedeutet**: Sie muessen lediglich Ihre Modellstruktur in einem Framework definieren und koennen den gemeinsamen Trainer, Dataloader und die Evaluations-/Deployment-Pipeline wiederverwenden -- ohne Trainingsschleifen oder Evaluationscode neu schreiben zu muessen.

### Trainingsstrategien

- Einzelaufgaben-Imitationslernen (Lernen aus menschlichen Demonstrationen -- keine Belohnungsfunktion erforderlich).
- Multimodales Multi-Task-Co-Training (gleichzeitiges Training auf mehreren Datenquellen, um zu verhindern, dass das Modell zuvor erlernte Faehigkeiten vergisst).
- **\[Geplant\]** Anpassung durch Reinforcement Learning.

### Simulations-Benchmarks

Unterstuetzte oder geplante Benchmarks:

- Unterstuetzt: SimplerEnv, LIBERO, RoboCasa, RoboTwin, CALVIN, BEHAVIOR.
- Geplant: SO101, RLBench.

#### Ausgewaehlte Benchmark-Ergebnisse

![StarVLA-Ergebnisse auf SimplerEnv.](../../../assets/starvla_simpleEnv.png)

![StarVLA-Ergebnisse auf LIBERO.](../../../assets/starvla_LIBERO.png)

![StarVLA-Ergebnisse auf RoboCasa.](../../../assets/stavla_RoboCasa.png)

### Ergebnisse & Berichte

Die Ergebnisse werden kontinuierlich in einem Live-Overleaf-Bericht verfolgt (ein staendig aktualisiertes experimentelles Berichts-PDF mit den neuesten Benchmark-Daten und Analysen): https://www.overleaf.com/read/qqtwrnprctkf#d5bdce

## Naechste Schritte

- Richten Sie Ihre Umgebung ein und ueberpruefen Sie die Installation unter [Schnellstart](/docs/de/getting-started/quick-start/).
- Erkunden Sie die Designprinzipien unter [Baukastenprinzip](/docs/de/design/lego-like/).
- Durchsuchen Sie Checkpoints im [Model Zoo](/docs/de/model-zoo/).

## Community & Links

- Hugging Face: https://huggingface.co/StarVLA
- WeChat-Gruppe: https://github.com/starVLA/starVLA/issues/64#issuecomment-3715403845

---

**Auf StarVLA basierende Projekte:**

- NeuroVLA: [A Brain-like Embodied Intelligence for Fluid and Fast Reflexive Robotics Control](https://github.com/guoweiyu/NeuroVLA)
- PhysBrain: [Human Egocentric Data as a Bridge from Vision Language Models to Physical Intelligence](https://zgc-embodyai.github.io/PhysBrain/)
- TwinBrainVLA: [Unleashing the Potential of Generalist VLMs for Embodied Tasks via Asymmetric Mixture-of-Transformers](https://github.com/ZGC-EmbodyAI/TwinBrainVLA)
- LangForce: [Bayesian Decomposition of Vision Language Action Models via Latent Action Queries](https://github.com/ZGC-EmbodyAI/LangForce)

---

**Neueste Aktualisierungen**

- **2025/12/25**: Pipelines fuer Behavior-1K, RoboTwin 2.0 und CALVIN erstellt; Baselines sollen mit der Community geteilt werden.
- **2025/12/25**: RoboCasa-Evaluationsunterstuetzung veroeffentlicht, SOTA ohne Vortraining erreicht. Siehe die [RoboCasa-Dokumentation](/docs/de/benchmarks/robocasa/).
- **2025/12/15**: Release-Regressionspruefung abgeschlossen; laufende Aktualisierungen im [Taeglichen Entwicklungsprotokoll](https://github.com/starVLA/starVLA/issues/64#issue-3727060165).
- **2025/12/09**: Open-Source-Training fuer VLM, VLA und VLA+VLM-Co-Training. Siehe die [VLM-Co-Training-Dokumentation](/docs/de/training/cotrain-vlm/).
- **2025/11/12**: Florence-2-Unterstuetzung fuer ressourcenbeschraenktes VLM-Training (einzelne A100) hinzugefuegt. Siehe [Baukastenprinzip](/docs/de/design/lego-like/) fuer Workflow-Hinweise.
- **2025/10/30**: LIBERO-Trainings- und Evaluationsleitfaeden veroeffentlicht.
- **2025/10/25**: Skript-Links und Pakete basierend auf Community-Feedback verbessert.
