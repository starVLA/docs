---
title: Baukastenprinzip
description: Die modularen Prinzipien, die StarVLA einfach erweiterbar und debuggbar machen.
---

## Schnelltest fuer jedes Submodul

StarVLA legt Wert auf modulares Modelldesign. Jede wichtige Framework-Datei ist ausfuehrbar fuer schnelles Debugging und Schnelltests:

```bash
# Modell (Konfigurationsdatei unter starVLA/config/training/starvla_cotrain_oxe.yaml)
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# Dataloader
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**Designregel:** `starVLA/model/framework/<ihr_framework>.py` ist die einzige externe API-Oberflaeche des Modells. Sie sollte dem Framework-Diagramm in Ihrem Paper entsprechen.

## Explizite Modellgrenzen

StarVLA folgt dem Top-Down-Zerlegungsprinzip und hoher Kohaesion / geringer Kopplung (jedes Modul uebernimmt seine eigene Verantwortung und Module beeinflussen sich nicht gegenseitig). Der Dataloader muss ein rohes, modellagnostisches Dictionary zurueckgeben, ohne modellspezifische Vorverarbeitung.

Ein typisches Sample enthaelt:

- `image`: `list[PIL.Image] | np.ndarray` -- Kamerabilder (ein oder mehrere Blickwinkel)
- `lang`: `str` -- Aufgabenanweisung in natuerlicher Sprache (z. B. "put the red block in the box")
- `action`: `np.ndarray[T, action_dim]` -- Sequenz von Roboter-Aktionen (T Schritte, jeweils mit action_dim Gelenkwerten)
- `state`: `Optional[np.ndarray[..., state_dim]]` -- aktuelle Sensormesswerte des Roboters (z. B. Gelenkwinkel, Endeffektorposition; optional)

Sowohl `framework.forward()` als auch `framework.predict_action()` arbeiten direkt mit rohen Eingaben. Dies haelt die Trainings-/Testgrenzen explizit und leicht anpassbar.

## Flexibles Konfigurationssystem

StarVLA verwendet ein einzelnes globales Konfigurationsobjekt basierend auf OmegaConf (eine YAML-Konfigurationsverwaltungsbibliothek, die das Ueberschreiben von Konfigurationswerten ueber die Kommandozeile unterstuetzt). Parameter werden ueber erweiterbare Dictionarys uebergeben, was Ueberschreibungen und kontrollierte Redundanz ermoeglicht.

Beispiel (Ueberschreibung ueber CLI):

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**Hinweis:** `framework.action_model.new_module` fuegt nur Schluessel zur globalen Konfiguration hinzu. Das Verhalten wird in Ihrer Framework-Implementierung definiert.

## Wie Sie ein neues Framework hinzufuegen

Moechten Sie Ihre eigene Modellarchitektur integrieren? Nur drei Schritte:

1. **Framework-Datei erstellen**: Fuegen Sie `IhrFramework.py` unter `starVLA/model/framework/` hinzu, erben Sie von der Basisklasse und implementieren Sie die Methoden `forward()` und `predict_action()`.
2. **Schnelltest schreiben**: Fuegen Sie am Ende der Datei einen `if __name__ == "__main__":`-Einstiegspunkt hinzu, um den Vorwaertsdurchlauf und die Aktionsvorhersage mit Testdaten zu verifizieren.
3. **In Konfiguration registrieren**: Setzen Sie `framework.name: IhrFramework` in Ihrer Trainings-YAML-Konfiguration, um in die bestehende Trainings- und Evaluationspipeline einzubinden.

Verwenden Sie `QwenGR00T.py` oder `QwenOFT.py` als Vorlagen.
