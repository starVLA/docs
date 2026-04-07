---
title: Co-Training mit VLM-Daten
description: VLM-Daten (Vision-Language Model) integrieren, um das StarVLA-Framework gemeinsam zu trainieren.
---

Dieser Leitfaden beschreibt den Prozess zur Integration von VLM-Daten (Vision-Language Model) fuer das Co-Training des StarVLA-Frameworks (Vision-Language-Action).

**Warum Co-Training?** Das ausschliessliche Training eines VLA auf Robotermanipulationsdaten kann das Bild- und Sprachverstaendnis des VLM-Backbones verschlechtern -- dies wird als "katastrophales Vergessen" bezeichnet: Nach dem Training nur mit Roboterdaten kann das Modell verlernen, Bilder zu interpretieren, Fragen zu beantworten oder komplexe Anweisungen zu verstehen. Das Beimischen von VLM-Daten (Bild-QA, Bildunterschriften usw.) erhaelt das allgemeine Verstaendnis des Modells, waehrend es die Robotersteuerung erlernt.

---

## 1. Multimodale Datenvorbereitung

Die VLM-Daten muessen der [QwenVL Conversations JSON-Datenstruktur](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune) entsprechen.

### Erforderliches Format

Jede Dateninstanz ist ein JSON-Objekt, das einen **Bilddateipfad** mit einer Liste von **Mensch-GPT-Konversationsrunden** verknuepft.

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
            // <image> ist ein Platzhalter, der dem Modell sagt "Bild hier einfuegen";
            // der tatsaechliche Bildpfad wird im aeusseren "image"-Feld angegeben
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### Schnellstart

Sie koennen unseren Beispieldatensatz [LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO) herunterladen.

Entpacken Sie `sharegpt4v_coco.zip` und platzieren Sie es in `playground/Datasets/LLaVA-OneVision-COCO`.

Die resultierende Dateistruktur sieht folgendermassen aus:

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. VLM-Datensatz-Konfiguration

Um einen benutzerdefinierten VLM-Datensatz hinzuzufuegen, folgen Sie diesen Schritten:

### 2.1 Datensatz registrieren (Python)

Registrieren Sie Ihren Datensatz, indem Sie ihn zum `data_dict` in `starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py` hinzufuegen:

```python
# Beispielregistrierung
# json_root und image_root sind am Anfang dieser Datei definiert,
# standardmaessig Unterverzeichnisse unter playground/Datasets/LLaVA-OneVision-COCO/:
#   json_root = "playground/Datasets/LLaVA-OneVision-COCO/llava_jsons"
#   image_root = "playground/Datasets/LLaVA-OneVision-COCO/images"

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # Verwenden Sie diesen Namen in der YAML-Konfiguration
}
```

### 2.2 Trainings-YAML aktualisieren

Fuegen Sie die VLM-Datensatz-Konfiguration in Ihre Trainings-YAML-Datei (`your_train_config.yaml`) ein:

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # Muss mit dem in 2.1 registrierten Namen uebereinstimmen
```

**Tipp:** Sie koennen den VLM-Dataloader ueberpruefen, indem Sie ausfuehren:

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. Trainingsausfuehrung

Waehlen Sie das passende Skript, je nachdem, ob Sie *nur* mit VLM-Daten trainieren oder mit VLA-Daten *co-trainieren* moechten.

:::tip[Wie waehlen?]
- **Wenn Sie nur das VLM feinabstimmen moechten** (z. B. Feinabstimmung auf domänenspezifische Bild-Text-Daten ohne Roboter-Aktionen), waehlen Sie **Option A**.
- **Wenn Sie Roboterdaten haben und beides zusammen trainieren moechten** (um katastrophales Vergessen zu verhindern, waehrend das Modell sowohl Robotersteuerung als auch visuell-sprachliches Verstaendnis erlernt), waehlen Sie **Option B**.
:::

### Option A: Nur mit VLM-Daten trainieren

Verwenden Sie dies fuer VLM-spezifisches Vortraining oder Feinabstimmung.

**Skript:** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### Option B: VLA mit VLM-Daten co-trainieren

Dies trainiert das Modell gleichzeitig auf Robotik-Daten (VLA) und multimodalen Daten (VLM).

**Skript:** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
