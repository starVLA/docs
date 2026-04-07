---
title: LIBERO-Evaluation
description: Reproduzieren Sie die experimentellen Ergebnisse von StarVLA auf LIBERO (Einrichtung, Evaluations-Workflow und Trainingshinweise).
---

**LIBERO** ist ein Tischroboter-Manipulations-Benchmark mit 4 Aufgabensuiten (Spatial, Object, Goal, Long Horizon) und insgesamt 40 Aufgaben. Es testet VLA-Modelle auf raeumliches Verstaendnis, Objekterkennung, Zielschlussfolgerung und Langzeithorizont-Manipulation mit einem Franka-Roboterarm.

Dieses Dokument enthaelt Anweisungen zur Reproduktion unserer **experimentellen Ergebnisse** mit LIBERO.
Der Evaluationsprozess besteht aus zwei Hauptteilen:

1. Einrichten der `LIBERO`-Umgebung und Abhaengigkeiten.
2. Ausfuehren der Evaluation durch Starten von Diensten in sowohl der `starVLA`- als auch der `LIBERO`-Umgebung.

Wir haben verifiziert, dass dieser Workflow erfolgreich auf **NVIDIA A100** und **RTX 4090** GPUs laeuft.

---

## LIBERO-Evaluation

### 0. Checkpoints herunterladen

Wir stellen eine Sammlung vortrainierter Checkpoints auf Hugging Face bereit, um die Evaluation durch die Community zu erleichtern: [🤗 StarVLA/bench-libero](https://huggingface.co/collections/StarVLA/libero). Die zugehoerigen Ergebnisse auf LIBERO sind in der folgenden Tabelle zusammengefasst.

#### Experimentelle Ergebnisse

| Modell                | Schritte | Epochen | Spatial | Object | Goal | Long | Durchschn. |
|----------------------|-------|--------|---------|--------|------|------|------|
| $\pi_0$+FAST         | -     | -      | 96.4    | 96.8   | 88.6 | 60.2 | 85.5 |
| OpenVLA-OFT          | 175K  | 223    | 97.6    | 98.4   | 97.9 | 94.5 | 97.1 |
| $\pi_0$              | -     | -      | 96.8    | 98.8   | 95.8 | 85.2 | 94.1 |
| GR00T-N1.5           | 20K   | 203    | 92.0    | 92.0   | 86.0 | 76.0 | 86.5 |
| **Qwen2.5-VL-FAST**  | 30K   | 9.54   | 97.3    | 97.2   | 96.1 | 90.2 | 95.2 |
| **Qwen2.5-VL-OFT**   | 30K   | 9.54   | 97.4    | 98.0   | 96.8 | 92.0 | 96.1 |
| **Qwen2.5-VL-GR00T** | 30K   | 9.54   | 97.8    | 98.2   | 94.6 | 90.8 | 95.4 |
| **Qwen3-VL-FAST**    | 30K   | 9.54   | 97.3    | 97.4   | 96.3 | 90.6 | 95.4 |
| **Qwen3-VL-OFT**     | 30K   | 9.54   | 97.8    | 98.6   | 96.2 | 93.8 | 96.6 |
| **Qwen3-VL-GR00T**   | 30K   | 9.54   | 97.8    | 98.8   | 97.4 | 92.0 | 96.5 |

Wir trainieren eine Policy fuer alle 4 Suiten. Alle Werte sind ueber 500 Durchlaeufe pro Aufgabensuite gemittelt (10 Aufgaben x 50 Episoden).

---

### 1. Umgebungseinrichtung

Um die Umgebung einzurichten, folgen Sie zunaechst dem offiziellen [LIBERO-Repository](https://github.com/Lifelong-Robot-Learning/LIBERO), um die Basis-`LIBERO`-Umgebung zu installieren.

⚠️ **Haeufiges Problem:** LIBERO verwendet standardmaessig Python 3.8, aber die Syntaxaenderungen zwischen 3.8 und 3.10 sind erheblich. **Wir haben verifiziert, dass Python 3.10 viele Probleme vermeidet**.

Installieren Sie danach innerhalb der `LIBERO`-Umgebung die folgenden Abhaengigkeiten:

```bash
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Downgrade numpy fuer Kompatibilitaet mit der Simulationsumgebung
```

---

### 2. Evaluations-Workflow

Fuehren Sie die Evaluation **vom Stammverzeichnis des starVLA-Repositorys** aus, unter Verwendung von **zwei separaten Terminals**, eines fuer jede Umgebung.

:::note[Warum zwei Terminals?]
Modellinferenz (starVLA-Umgebung) und die Simulation (LIBERO-Umgebung) haengen von verschiedenen Python-Paketversionen ab, die in Konflikt stehen wuerden, wenn sie in derselben Conda-Umgebung installiert waeren. Das Ausfuehren in separaten Terminals mit separaten Conda-Umgebungen vermeidet dies.
:::

- **starVLA-Umgebung**: fuehrt den Inferenz-Server aus.
- **LIBERO-Umgebung**: fuehrt die Simulation aus.

#### Schritt 1. Server starten (starVLA-Umgebung)

Aktivieren Sie im ersten Terminal die `starVLA`-Conda-Umgebung und fuehren Sie aus:

```bash
bash examples/LIBERO/eval_files/run_policy_server.sh
```

⚠️ **Hinweis:** Stellen Sie bitte sicher, dass Sie den korrekten Checkpoint-Pfad in `examples/LIBERO/eval_files/run_policy_server.sh` angeben.

---

#### Schritt 2. Simulation starten (LIBERO-Umgebung)

Aktivieren Sie im zweiten Terminal die `LIBERO`-Conda-Umgebung und fuehren Sie aus:

```bash
bash examples/LIBERO/eval_files/eval_libero.sh
```

⚠️ **Hinweis:** Stellen Sie sicher, dass Sie die folgenden Variablen in `eval_libero.sh` korrekt setzen:

| Variable | Bedeutung | Beispiel |
|----------|---------|---------|
| `LIBERO_HOME` | Pfad zu Ihrem LIBERO-Repository-Klon | `/path/to/LIBERO` |
| `LIBERO_Python` | Python-Pfad aus der LIBERO-Conda-Umgebung | `$(which python)` (innerhalb der LIBERO-Umgebung) |
| `your_ckpt` | StarVLA-Checkpoint-Pfad | `./results/Checkpoints/.../steps_30000_pytorch_model.pt` |
| `unnorm_key` | Robotertypname zum Laden der Unnormalisierungsstatistiken | `franka` (LIBERO verwendet den Franka-Arm) |

`unnorm_key` wird verwendet, um die waehrend des Trainings gespeicherten Normalisierungsstatistiken (Min/Max usw.) zu laden und normalisierte Modellausgaben zurueck in tatsaechliche Gelenkwinkel umzuwandeln.

Jedes Ergebnis speichert ausserdem ein Video zur Visualisierung, wie unten gezeigt:

![Beispiel](../../../../assets/LIBERO_example.gif)

---

## LIBERO-Training

### Schritt 0: Trainingsdatensatz herunterladen

Laden Sie die Datensaetze in das Verzeichnis `playground/Datasets/LEROBOT_LIBERO_DATA` herunter:

- [LIBERO-spatial](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_spatial_no_noops_1.0.0_lerobot)
- [LIBERO-object](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_object_no_noops_1.0.0_lerobot)
- [LIBERO-goal](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_goal_no_noops_1.0.0_lerobot)
- [LIBERO-10](https://huggingface.co/datasets/IPEC-COMMUNITY/libero_10_no_noops_1.0.0_lerobot)

Und verschieben Sie `modality.json` in jedes `$LEROBOT_LIBERO_DATA/subset/meta/modality.json`.

Sie koennen dies schnell vorbereiten, indem Sie ausfuehren:

```bash
# Setzen Sie DEST auf das Verzeichnis, in dem Sie die Daten speichern moechten
export DEST=/path/to/your/data/directory
bash examples/LIBERO/data_preparation.sh
```

### Schritt 1: Training starten

Die meisten erforderlichen Trainingsdateien sind in `examples/LIBERO/train_files/` organisiert.

Fuehren Sie den folgenden Befehl aus, um das Training zu starten:

```bash
bash examples/LIBERO/train_files/run_libero_train.sh
```

⚠️ **Hinweis:** Stellen Sie bitte sicher, dass Sie den korrekten Pfad in `examples/LIBERO/train_files/run_libero_train.sh` angeben.
