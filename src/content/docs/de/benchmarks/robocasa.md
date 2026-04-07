---
title: RoboCasa-Evaluation
description: Reproduzieren Sie die experimentellen Ergebnisse von StarVLA auf den RoboCasa GR1 Tischaufgaben.
---

**RoboCasa** ist ein umfangreicher Haushalts-Simulations-Benchmark. Hier verwenden wir die Teilmenge [GR1 Tabletop Tasks](https://github.com/robocasa/robocasa-gr1-tabletop-tasks) mit 24 Tisch-Pick-and-Place-Aufgaben, die von einem Fourier GR1-Humanoiden (Oberkoerper, zwei Arme) ausgefuehrt werden.

Dieses Dokument enthaelt Anweisungen zur Reproduktion unserer **experimentellen Ergebnisse**.

Der Evaluationsprozess besteht aus zwei Hauptteilen:

1. Einrichten der `robocasa`-Umgebung und Abhaengigkeiten.
2. Ausfuehren der Evaluation durch Starten von Diensten in sowohl der `starVLA`- als auch der `robocasa`-Umgebung.

:::note[Warum zwei Terminals?]
Modellinferenz (starVLA-Umgebung) und die Simulation (robocasa-Umgebung) haengen von verschiedenen Python-Paketversionen ab, die in Konflikt stehen wuerden, wenn sie in derselben Conda-Umgebung installiert waeren. Das Ausfuehren in separaten Terminals mit separaten Conda-Umgebungen vermeidet dies.
:::

Wir haben verifiziert, dass dieser Workflow erfolgreich auf **NVIDIA A100** GPUs laeuft.

---

## Experimentelle Ergebnisse

| Aufgabe | GR00T-N1.6 | Qwen3GR00T | Qwen3PI | Qwen3OFT | Qwen3FAST |
|------|------------|------------|---------|----------|-----------|
| **PnP Bottle To Cabinet Close** | 51.5 | 46.0 | 26.0 | 30.0 | 38.0 |
| **PnP Can To Drawer Close** | 13.0 | 80.0 | 62.0 | 76.0 | 44.0 |
| **PnP Cup To Drawer Close** | 8.5 | 54.0 | 42.0 | 44.0 | 56.0 |
| **PnP Milk To Microwave Close** | 14.0 | 48.0 | 50.0 | 44.0 | 44.0 |
| **PnP Potato To Microwave Close** | 41.5 | 28.0 | 42.0 | 32.0 | 14.0 |
| **PnP Wine To Cabinet Close** | 16.5 | 46.0 | 32.0 | 36.0 | 14.0 |
| **PnP Novel From Cuttingboard To Basket** | 58.0 | 48.0 | 40.0 | 50.0 | 54.0 |
| **PnP Novel From Cuttingboard To Cardboardbox** | 46.5 | 40.0 | 46.0 | 40.0 | 42.0 |
| **PnP Novel From Cuttingboard To Pan** | 68.5 | 68.0 | 60.0 | 70.0 | 58.0 |
| **PnP Novel From Cuttingboard To Pot** | 65.0 | 52.0 | 40.0 | 54.0 | 58.0 |
| **PnP Novel From Cuttingboard To Tieredbasket** | 46.5 | 56.0 | 44.0 | 38.0 | 40.0 |
| **PnP Novel From Placemat To Basket** | 58.5 | 42.0 | 44.0 | 32.0 | 36.0 |
| **PnP Novel From Placemat To Bowl** | 57.5 | 44.0 | 52.0 | 58.0 | 38.0 |
| **PnP Novel From Placemat To Plate** | 63.0 | 48.0 | 50.0 | 52.0 | 42.0 |
| **PnP Novel From Placemat To Tieredshelf** | 28.5 | 18.0 | 28.0 | 24.0 | 18.0 |
| **PnP Novel From Plate To Bowl** | 57.0 | 60.0 | 52.0 | 60.0 | 52.0 |
| **PnP Novel From Plate To Cardboardbox** | 43.5 | 50.0 | 40.0 | 50.0 | 30.0 |
| **PnP Novel From Plate To Pan** | 51.0 | 54.0 | 36.0 | 66.0 | 48.0 |
| **PnP Novel From Plate To Plate** | 78.7 | 70.0 | 48.0 | 68.0 | 50.0 |
| **PnP Novel From Tray To Cardboardbox** | 51.5 | 38.0 | 34.0 | 44.0 | 28.0 |
| **PnP Novel From Tray To Plate** | 71.0 | 56.0 | 64.0 | 56.0 | 34.0 |
| **PnP Novel From Tray To Pot** | 64.5 | 50.0 | 44.0 | 62.0 | 46.0 |
| **PnP Novel From Tray To Tieredbasket** | 57.0 | 36.0 | 50.0 | 54.0 | 36.0 |
| **PnP Novel From Tray To Tieredshelf** | 31.5 | 16.0 | 28.0 | 30.0 | 16.0 |
| **Durchschnitt** | **47.6** | **47.8** | **43.9** | **48.8** | **39.0** |

*Hinweis: Alle Werte sind Erfolgsraten in Prozent (%). Ein einzelnes Modell wurde fuer alle 24 Aufgaben trainiert. Die Ergebnisse basieren auf 50 Durchlaeufen pro Aufgabe.*

---

## RoboCasa-Evaluation

### 0. Checkpoints herunterladen

Laden Sie zunaechst die Checkpoints herunter von:
- [Qwen3VL-GR00T](https://huggingface.co/StarVLA/Qwen3-VL-GR00T-Robocasa-gr1)
- [Qwen3VL-OFT](https://huggingface.co/StarVLA/Qwen3-VL-OFT-Robocasa)

### 1. Umgebungseinrichtung

Um die Umgebung einzurichten, folgen Sie zunaechst der [offiziellen RoboCasa-Installationsanleitung](https://github.com/robocasa/robocasa-gr1-tabletop-tasks?tab=readme-ov-file#getting-started), um die Basis-`robocasa-gr1-tabletop-tasks`-Umgebung zu installieren.

Installieren Sie dann die Socket-Unterstuetzung:

```bash
pip install tyro
```

---

### 2. Evaluations-Workflow

#### Schritt 1. Server starten (starVLA-Umgebung)

Aktivieren Sie im ersten Terminal die `starVLA`-Conda-Umgebung und fuehren Sie aus:

```bash
python deployment/model_server/server_policy.py \
        --ckpt_path ${your_ckpt} \
        --port 5678 \
        --use_bf16
```

---

#### Schritt 2. Simulation starten (robocasa-Umgebung)

Aktivieren Sie im zweiten Terminal die `robocasa`-Conda-Umgebung und fuehren Sie aus:

```bash
export PYTHONPATH=$(pwd):${PYTHONPATH}
your_ckpt=StarVLA/Qwen3-VL-OFT-Robocasa/checkpoints/steps_90000_pytorch_model.pt

python examples/Robocasa_tabletop/eval_files/simulation_env.py\
   --args.env_name ${env_name} \
   --args.port 5678 \
   --args.n_episodes 50 \
   --args.n_envs 1 \
   --args.max_episode_steps 720 \
   --args.n_action_steps 12 \
   --args.video_out_path ${video_out_path} \
   --args.pretrained_path ${your_ckpt}
```

#### Batch-Evaluation (Optional)

Falls Sie mehr GPUs haben, koennen Sie das Batch-Evaluationsskript verwenden:

```bash
bash examples/Robocasa_tabletop/batch_eval_args.sh
```

**Hinweis:** Stellen Sie bitte sicher, dass Sie den korrekten Checkpoint-Pfad in `batch_eval_args.sh` angeben.

---

## Trainingsergebnisse reproduzieren

### Schritt 0: Trainingsdatensatz herunterladen

Laden Sie die PhysicalAI-Robotics-GR00T-X-Embodiment-Sim-Verzeichnisdatensaetze von [HuggingFace](https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim) in das Verzeichnis `playground/Datasets/nvidia/PhysicalAI-Robotics-GR00T-X-Embodiment-Sim` herunter.

Um nur die relevanten Feinabstimmungsordner herunterzuladen, koennen Sie sich an die Anleitung des [GR00T-N1.5](https://github.com/NVIDIA/Isaac-GR00T/tree/4af2b622892f7dcb5aae5a3fb70bcb02dc217b96/examples/RoboCasa#-1-dataset-preparation)-Repositorys halten.

Oder verwenden Sie das Skript, um die `*_1000`-Ordner herunterzuladen:

```bash
python examples/Robocasa_tabletop/download_gr00t_ft_data.py
```

### Schritt 1: Training starten

Verschiedene Datensaetze koennen durch Aendern des Parameters `data_mix` ausgewaehlt werden. Das folgende Skript kann zur Feinabstimmung der `*_1000`-Datensaetze verwendet werden:

```bash
bash examples/Robocasa_tabletop/train_files/run_robocasa.sh
```
