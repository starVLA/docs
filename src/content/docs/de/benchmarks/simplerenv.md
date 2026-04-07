---
title: SimplerEnv-Evaluation
description: Reproduzieren Sie die experimentellen Ergebnisse von StarVLA auf SimplerEnv (Einrichtung, Evaluations-Workflow und Trainingshinweise).
---

**SimplerEnv** ist eine ManiSkill-basierte Simulationsumgebung, die den WidowX-Roboterarm fuer Tischmanipulationsaufgaben (Greifen, Platzieren, Schubladenoperationen usw.) verwendet. Sie wird haeufig eingesetzt, um VLA-Modelle zu evaluieren, die auf dem Open X-Embodiment (OXE)-Datensatz trainiert wurden.

Dieses Dokument enthaelt Anweisungen zur Reproduktion unserer **experimentellen Ergebnisse** mit SimplerEnv.

Der Evaluationsprozess besteht aus zwei Hauptteilen:

1. Einrichten der `simpler_env`-Umgebung und Abhaengigkeiten.
2. Ausfuehren der Evaluation durch Starten von Diensten in sowohl der `starVLA`- als auch der `simpler_env`-Umgebung.

Wir haben verifiziert, dass dieser Workflow erfolgreich auf **NVIDIA A100** und **RTX 4090** GPUs laeuft.

---

## Experimental Results

### WidowX Robot (Visual Matching)

| Method | Steps | Put Spoon on Towel | Put Carrot on Plate | Stack Green Block on Yellow Block | Put Eggplant in Yellow Basket | Average |
|--------|-------|--------------------|--------------------|---------------------------------|------------------------------|---------|
| RT-1-X | - | 0.0 | 4.2 | 0.0 | 0.0 | 1.1 |
| Octo-Base | - | 15.8 | 12.5 | 0.0 | 41.7 | 17.5 |
| Octo-Small | - | 41.7 | 8.2 | 0.0 | 56.7 | 26.7 |
| OpenVLA | - | 4.2 | 0.0 | 0.0 | 12.5 | 4.2 |
| CogACT | - | 71.7 | 50.8 | 15.0 | 67.5 | 51.3 |
| SpatialVLA | - | 16.7 | 25.0 | 29.2 | **100.0** | 42.7 |
| π₀ | - | 29.1 | 0.0 | 16.6 | 62.5 | 27.1 |
| π₀-FAST | - | 29.1 | 21.9 | 10.8 | 66.6 | 48.3 |
| GR00T N1.5 | - | 75.3 | 54.3 | **57.0** | 61.3 | 61.9 |
| Magma | - | 37.5 | 31.0 | 12.7 | 60.5 | 35.8 |
| **StarVLA-FAST (Qwen3-VL)** | 15K | 18.8 | 31.3 | 4.2 | 71.9 | 31.6 |
| **StarVLA-OFT (Qwen3-VL)** | 65K | **90.3** | 38.5 | 29.7 | **100.0** | 64.6 |
| **StarVLA-π (Qwen3-VL)** | 40K | 78.1 | 46.9 | 30.2 | 88.5 | 60.9 |
| **StarVLA-GR00T (Qwen3-VL)** | 20K | 83.0 | 59.4 | 18.8 | **100.0** | 65.3 |
| **StarVLA-OFT (Cosmos-Predict2-2B)** | 30K | 66.8 | 62.6 | 25.3 | 90.2 | 61.2 |
| **StarVLA-π (Cosmos-Predict2-2B)** | 30K | 81.4 | 55.2 | 25.1 | 73.0 | 58.7 |
| **StarVLA-GR00T (Cosmos-Predict2-2B)** | 30K | 80.4 | **65.4** | 20.0 | 80.6 | 61.6 |

### Google Robot (Visual Matching)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 85.7 | 44.2 | **73.0** | 6.5 | 52.4 |
| RT-1-X | 56.7 | 31.7 | 59.7 | 21.3 | 42.4 |
| RT-2-X | 78.7 | 77.9 | 25.0 | 3.7 | 46.3 |
| OpenVLA | 18.0 | 56.3 | 63.0 | 0.0 | 34.3 |
| CogACT | 91.3 | 85.0 | 71.8 | 50.9 | 74.8 |
| SpatialVLA | 86.0 | 77.9 | 57.4 | - | 75.1 |
| π₀ | 72.7 | 65.3 | 38.3 | - | 58.8 |
| π₀-FAST | 75.3 | 67.5 | 42.9 | - | 61.9 |
| GR00T N1.5* | 51.7 | 54.0 | 27.8 | 7.4 | 35.2 |
| Magma | 83.7 | 65.4 | 56.0 | 6.4 | 52.9 |
| **StarVLA-OFT** | **95.3** | 75.0 | 68.8 | **66.1** | **76.0** |

### Google Robot (Variant Aggregation)

| Method | Pick Coke Can | Move Near | Open/Close Drawer | Open Top Drawer and Place Apple | Average |
|--------|--------------|-----------|-------------------|---------------------------------|---------|
| RT-1 | 89.8 | 50.0 | 32.3 | 2.6 | 43.7 |
| RT-1-X | 49.0 | 32.3 | 29.4 | 10.1 | 30.2 |
| RT-2-X | 82.3 | 79.2 | 35.3 | 20.6 | 54.4 |
| OpenVLA | 60.8 | 67.7 | 28.8 | 0.0 | 39.3 |
| CogACT | 89.6 | 80.8 | 28.3 | 46.6 | 61.3 |
| SpatialVLA | 88.0 | **82.5** | 41.8 | - | 70.7 |
| π₀ | 75.2 | 63.7 | 25.6 | - | 54.8 |
| π₀-FAST | 77.6 | 68.2 | 31.3 | - | 59.0 |
| GR00T N1.5 | 69.3 | 68.7 | 35.8 | 4.0 | 44.5 |
| Magma | 68.8 | 65.7 | **53.4** | 18.5 | 51.6 |
| **StarVLA-OFT** | 91.3 | 75.1 | 55.0 | **59.4** | **70.2** |

*Note: All StarVLA Google Robot results use Qwen3-VL-4B as backbone. Numbers marked with \* denote our reimplementation.*

---

## SimplerEnv-Evaluation

### 1. Umgebungseinrichtung

Um die Umgebung einzurichten, folgen Sie zunaechst dem offiziellen [SimplerEnv-Repository](https://github.com/simpler-env/SimplerEnv), um die Basis-`simpler_env`-Umgebung zu installieren.

Installieren Sie danach innerhalb der `simpler_env`-Umgebung die folgenden Abhaengigkeiten:

```bash
conda activate simpler_env
pip install tyro matplotlib mediapy websockets msgpack
pip install numpy==1.24.4  # Downgrade numpy fuer Kompatibilitaet mit der Simulationsumgebung
```

**Haeufige Probleme:**
Beim Testen von SimplerEnv auf NVIDIA A100 kann folgender Fehler auftreten:
`libvulkan.so.1: cannot open shared object file: No such file or directory`
Loesungshinweise finden Sie hier: [Installationsanleitung -- Vulkan-Abschnitt](https://maniskill.readthedocs.io/en/latest/user_guide/getting_started/installation.html#vulkan)

#### Verifizierung

Wir stellen ein minimales Skript zur Umgebungsverifizierung bereit:

```bash
python examples/SimplerEnv/test_your_simplerEnv.py
```

Wenn Sie die Meldung "✅ Env built successfully" sehen, bedeutet dies, dass SimplerEnv korrekt installiert und einsatzbereit ist.

---

### 2. Evaluations-Workflow

Fuehren Sie die Evaluation **vom Stammverzeichnis des starVLA-Repositorys** aus, unter Verwendung von **zwei separaten Terminals**, eines fuer jede Umgebung.

:::note[Warum zwei Terminals?]
Modellinferenz (starVLA-Umgebung) und die Simulation (simpler_env-Umgebung) haengen von verschiedenen Python-Paketversionen ab, die in Konflikt stehen wuerden, wenn sie in derselben Conda-Umgebung installiert waeren. Das Ausfuehren in separaten Terminals mit separaten Conda-Umgebungen vermeidet dies.
:::

- **starVLA-Umgebung**: fuehrt den Policy-Inferenz-Server aus.
- **simpler_env-Umgebung**: fuehrt den Simulations-Evaluationscode aus.

#### Schritt 0. Checkpoint herunterladen

Laden Sie den Checkpoint herunter: [Qwen3VL-GR00T-Bridge-RT-1](https://huggingface.co/StarVLA/Qwen3VL-GR00T-Bridge-RT-1)

#### Schritt 1. Server starten (starVLA-Umgebung)

Aktivieren Sie im ersten Terminal die `starVLA`-Conda-Umgebung und fuehren Sie aus:

```bash
bash examples/SimplerEnv/eval_files/run_policy_server.sh
```

**Hinweis:** Oeffnen Sie `examples/SimplerEnv/eval_files/run_policy_server.sh`, suchen Sie die Variable `your_ckpt` und setzen Sie sie auf Ihren tatsaechlichen Checkpoint-Pfad, z. B. `results/Checkpoints/Qwen3VL-GR00T-Bridge-RT-1/checkpoints/steps_50000_pytorch_model.pt`.

---

#### Schritt 2. Simulation starten (simpler_env-Umgebung)

Aktivieren Sie im zweiten Terminal die `simpler_env`-Conda-Umgebung und fuehren Sie aus:

```bash
export MODEL_PATH=.../checkpoints/steps_50000_pytorch_model.pt
bash examples/SimplerEnv/start_simpler_env.sh ${MODEL_PATH}
```

Dieses Skript startet automatisch die WidowX-Robot-Evaluationsaufgaben und reproduziert die oben genannten Benchmark-Ergebnisse.

**Hinweis:** Oeffnen Sie `examples/SimplerEnv/start_simpler_env.sh`, suchen Sie die Variable `SimplerEnv_PATH` und setzen Sie sie auf den Pfad Ihres SimplerEnv-Repository-Klons (z. B. `/path/to/SimplerEnv`).

**Haeufige Probleme:**
Falls der Fehler `NotImplementedError: Framework QwenGR00T is not implemented` beim Starten des Policy-Servers auftritt, bedeutet dies in der Regel, dass das Framework nicht korrekt im Python-Importpfad registriert wurde. Fuehren Sie zuerst den Schnelltest aus, um die korrekte Registrierung auszuloesen:
```bash
python starVLA/model/framework/QwenGR00T.py
```
Falls der Schnelltest erfolgreich ist, starten Sie den Policy-Server neu.

---

## Training auf OXE

### Datenvorbereitung

Schritte:
1. Laden Sie einen OXE-Datensatz im LeRobot-Format herunter:
   - [bridge_orig_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/bridge_orig_lerobot)
   - [fractal20220817_data_lerobot](https://huggingface.co/datasets/IPEC-COMMUNITY/fractal20220817_data_lerobot)

2. Fuegen Sie `modality.json` in jedes `*lerobot/meta/modality.json` ein:
   - [bridge modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/modality.json) - Umbenennen in `modality.json` und ablegen als `bridge_orig_lerobot/meta/modality.json`
   - [fractal modality](https://github.com/starVLA/starVLA/blob/main/examples/SimplerEnv/train_files/fractal_modality.json) - Umbenennen in `modality.json` und ablegen als `fractal20220817_data_lerobot/meta/modality.json`

3. Fuegen Sie Ihren Datensatzpfad zur `config.yaml` hinzu:
   ```yaml
   datasets:
     vla_data:
       dataset_py: lerobot_datasets
       data_root_dir: playground/Datasets/OXE_LEROBOT_DATASET
       data_mix: bridge_rt_1
   ```

#### Dataloader ueberpruefen

Wir bieten eine einfache Moeglichkeit, Ihren Dataloader zu ueberpruefen. Stellen Sie sicher, dass Sie gebatchte Daten laden koennen:

```bash
python starVLA/dataloader/lerobot_datasets.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Framework-Vorbereitung

Vor der Ausfuehrung muessen Sie sicherstellen, dass Ihr Framework `forward` und `predict_action` mit einem Testdatenbeispiel ausfuehren kann.

Versuchen Sie folgenden Befehl:

```bash
python starVLA/model/framework/QwenGR00T.py --config_yaml examples/SimplerEnv/train_files/starvla_cotrain_oxe.yaml
```

### Training starten

Sobald alles bereit ist, verwenden Sie unser bereitgestelltes Skript, um das Training zu starten:

```bash
bash ./examples/SimplerEnv/train_files/run_oxe_train.sh
```

**Hinweis:** Stellen Sie sicher, dass das Skript explizit den validierten Konfigurationspfad verwendet. Falls noch nicht uebergeben, fuegen Sie das Argument `--config_yaml` hinzu.
