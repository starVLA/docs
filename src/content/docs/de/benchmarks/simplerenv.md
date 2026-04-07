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
