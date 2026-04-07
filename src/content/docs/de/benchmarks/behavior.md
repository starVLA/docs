---
title: BEHAVIOR-1K-Evaluation
description: StarVLA-Framework mit dem BEHAVIOR-1K-Benchmark ausfuehren.
---

:::caution[In Bearbeitung]
Dieses Dokument befindet sich in aktiver Entwicklung.
:::

**BEHAVIOR-1K** ist ein Haushaltsaufgaben-Simulations-Benchmark von Stanford mit 1000 Alltagsaktivitaeten (Kochen, Putzen, Aufraumen usw.). Wir folgen der Struktur der [2025 BEHAVIOR Challenge](https://behavior.stanford.edu/challenge/index.html), um auf 50 vollstaendigen Haushaltsaufgaben zu trainieren und zu evaluieren. Es verwendet den R1Pro-Humanoiden (zwei Arme + Basis + Torso, 23-dimensionaler Aktionsraum).

Der Evaluationsprozess besteht aus zwei Hauptteilen:

1. Einrichten der `behavior`-Umgebung und Abhaengigkeiten.
2. Ausfuehren der Evaluation durch Starten von Diensten in sowohl der `starVLA`- als auch der `behavior`-Umgebung.

:::note[Warum zwei Terminals?]
Modellinferenz (starVLA-Umgebung) und die Simulation (behavior-Umgebung) haengen von verschiedenen Python-Paketversionen ab, die in Konflikt stehen wuerden, wenn sie in derselben Conda-Umgebung installiert waeren. Das Ausfuehren in separaten Terminals mit separaten Conda-Umgebungen vermeidet dies.
:::

:::note[GPU-Anforderungen]
Der BEHAVIOR-Simulator (OmniGibson) erfordert **Hardware-Raytracing (RT Cores)** fuer das Rendering. Die folgenden GPUs **koennen nicht verwendet werden**: A100, H100 (ihnen fehlen RT Cores).

**Empfohlen**: RTX 3090, RTX 4090 oder andere GeForce RTX / Quadro RTX Serien-GPUs.

Weitere Details finden Sie in [diesem Issue](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1872#issuecomment-3455002820) und [dieser Diskussion](https://github.com/StanfordVL/BEHAVIOR-1K/issues/1875#issuecomment-3444246495).
:::

---

## BEHAVIOR-Evaluation

### 1. Umgebungseinrichtung

Um die Conda-Umgebung fuer `behavior` einzurichten:

```bash
git clone https://github.com/StanfordVL/BEHAVIOR-1K.git
conda create -n behavior python=3.10 -y
conda activate behavior
cd BEHAVIOR-1K
pip install "setuptools<=79"
# --omnigibson: OmniGibson-Simulator installieren (BEHAVIORs Physik-Engine)
# --bddl: BDDL installieren (Behavior Domain Definition Language fuer Aufgabendefinitionen)
# --joylo: JoyLo installieren (Teleoperations-Steuerungsinterface)
# --dataset: BEHAVIOR-Datensatz-Assets herunterladen (Szenen, Objektmodelle usw.)
./setup.sh --omnigibson --bddl --joylo --dataset
conda install -c conda-forge libglu
pip install rich omegaconf hydra-core msgpack websockets av pandas google-auth
```

Ebenfalls in der starVLA-Umgebung:

```bash
pip install websockets
```

---

### 2. Evaluations-Workflow

Schritte:
1. Checkpoint herunterladen
2. Waehlen Sie das passende Skript gemaess Ihrem Bedarf

#### (A) Paralleles Evaluationsskript

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval.sh
```

Bevor Sie `start_parallel_eval.sh` ausfuehren, setzen Sie die folgenden Pfade:
- `star_vla_python`: Python-Interpreter fuer die StarVLA-Umgebung
- `sim_python`: Python-Interpreter fuer die Behavior-Umgebung
- `TASKS_JSONL_PATH`: Aufgabenbeschreibungsdatei, heruntergeladen vom [Trainingsdatensatz](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos) (enthalten unter `examples/Behavior/tasks.jsonl`)
- `BEHAVIOR_ASSET_PATH`: Lokaler Pfad zum Behavior-Asset-Verzeichnis (Standard ist `BEHAVIOR-1K/datasets` nach der Installation mit `./setup.sh`)

#### (B) Debugging mit separaten Terminals

Zum einfacheren Debugging koennen Sie Client (Evaluationsumgebung) und Server (Policy) auch in zwei separaten Terminals starten:

```bash
bash examples/Behavior/start_server.sh
bash examples/Behavior/start_client.sh
```

Die obigen Debugging-Dateien fuehren die Evaluation auf dem Trainingsset durch.

#### (C) Aufgabenweise Evaluation (speichersicher)

Um Speicherueberlauf zu verhindern, haben wir eine weitere Datei `start_parallel_eval_per_task.sh` implementiert:

```bash
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 bash examples/Behavior/start_parallel_eval_per_task.sh
```

- Das Skript fuehrt die Evaluation fuer jede Aufgabe in `INSTANCE_NAMES` iterativ durch
- Fuer jede Aufgabe werden alle Instanzen aus `TEST_EVAL_INSTANCE_IDS` auf die GPUs verteilt
- Es wird gewartet, bis die vorherige Aufgabe abgeschlossen ist, bevor zur naechsten uebergegangen wird

---

## Hinweise

### Wrapper-Typen

1. **RGBLowResWrapper**: Verwendet nur RGB als visuelle Beobachtung und Kameraaufloesungen von 224x224. Die alleinige Verwendung von niedrigaufloesenden RGB-Bildern kann den Simulator beschleunigen und die Evaluationszeit verkuerzen. Dieser Wrapper ist im Standard-Track zulaessig.

2. **DefaultWrapper**: Wrapper mit der Standard-Beobachtungskonfiguration, die waehrend der Datenerfassung verwendet wird (RGB + Tiefe + Segmentierung, 720p fuer Kopfkamera und 480p fuer Handgelenkkamera). Dieser Wrapper ist im Standard-Track zulaessig, aber die Evaluation wird im Vergleich zum RGBLowResWrapper erheblich langsamer sein.

3. **RichObservationWrapper**: Laedt zusaetzliche Beobachtungsmodalitaeten wie Normal- und Flussbilder sowie privilegierte Aufgabeninformationen. Dieser Wrapper kann nur im privilegierten Informations-Track verwendet werden.

### Aktionsdimensionen

BEHAVIOR hat action dim = 23:

```python
"R1Pro": {
    "base": np.s_[0:3],           # Indices 0-2
    "torso": np.s_[3:7],          # Indices 3-6
    "left_arm": np.s_[7:14],      # Indices 7-13
    "left_gripper": np.s_[14:15], # Index 14
    "right_arm": np.s_[15:22],    # Indices 15-21
    "right_gripper": np.s_[22:23] # Index 22
}
```

### Videospeicherung

Das Video wird im Format `{task_name}_{idx}_{epi}.mp4` gespeichert, wobei `idx` die Instanznummer und `epi` die Episodennummer ist.

### Haeufige Probleme

**Segmentation fault (core dumped):** Ein wahrscheinlicher Grund ist, dass Vulkan nicht erfolgreich installiert wurde. Ueberpruefen Sie [diesen Link](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan).

**ImportError: libGL.so.1: cannot open shared object file:**
```bash
apt-get install ffmpeg libsm6 libxext6 -y
```
