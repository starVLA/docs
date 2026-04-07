---
title: Evaluations-Framework
description: StarVLAs standardisierte Inferenz-Pipeline fuer Evaluationen an echten Robotern oder in Simulationen.
---

## Uebersicht

StarVLA standardisiert die Inferenz-Pipeline fuer Evaluationen an echten Robotern oder in Simulationen, indem Daten ueber WebSocket (ein Netzwerkprotokoll, das bidirektionale Echtzeitkommunikation zwischen Client und Server ermoeglicht) getunnelt werden. Dies ermoeglicht die Integration neuer Modelle in bestehende Evaluationsumgebungen mit minimalen Aenderungen.

---

## Architektur

Das StarVLA-Framework verwendet eine **Client-Server-Architektur**, um die Evaluations-/Deployment-Umgebung (Client) vom Policy-Server (Modellinferenz) zu trennen.

:::note[Warum Client und Server trennen?]
Modellinferenz und Simulations-/Echtroboter-Umgebungen haben typischerweise unterschiedliche oder sogar widerspruchliche Abhaengigkeiten an Python-Paketversionen (z. B. verschiedene numpy- oder torch-Versionen). Durch die Aufteilung in zwei unabhaengige Prozesse kann jeder seine eigene Conda-Umgebung verwenden, ohne dass es zu Konflikten kommt. In der Praxis starten Sie Server und Client in zwei separaten Terminals.
:::

- **Policy-Server**: Laedt das Modell, empfaengt Beobachtungen und gibt normalisierte Aktionen aus.
- **Client**: Kommuniziert mit dem Simulator oder echten Roboter und verarbeitet die Modellausgaben nach:
  - **Unnormalize**: Wandelt die normalisierten Aktionen des Modells [-1, 1] zurueck in physikalische Groessen (z. B. Gelenkwinkel).
  - **Delta-zu-Absolut**: Falls das Modell inkrementelle Aktionen relativ zur aktuellen Position ausgibt, werden diese zum aktuellen Zustand addiert, um absolute Zielpositionen zu erhalten.
  - **Action Ensemble**: Das Modell kann mehrere zukuenftige Schritte gleichzeitig vorhersagen; ueberlappende Vorhersagen aufeinanderfolgender Aufrufe werden gewichtet gemittelt fuer eine glattere Ausfuehrung.

![Policy-Server-Architektur](../../../../assets/starVLA_PolicyServer.png)

### Komponentenbeschreibung

| Komponente | Beschreibung |
|-----------|-------------|
| Sim / Real Controller | Extern zu StarVLA: Enthaelt die Kernschleife der Evaluationsumgebung oder des Roboter-Controllers, zustaendig fuer Beobachtungserfassung (`get_obs()`) und Aktionsausfuehrung (`apply_action()`). |
| PolicyClient.py & WebSocket & PolicyServer | Standard-Kommunikationsfluss: Clientseitige Wrapper-Schicht, zustaendig fuer Datenuebertragung (Tunneling) und die Verbindung zwischen Umgebung und Server. |
| Framework.py | Modell-Inferenzkern: Enthaelt die benutzerdefinierte Modellinferenzfunktion (`Framework.predict_action`), die die Hauptlogik fuer die Aktionsgenerierung darstellt. |

---

## Datenprotokoll

Minimales Pseudocode-Beispiel (evaluationsseitiger Client):

```python
# Import-Pfad: from deployment.policy_client.policy_client import WebsocketClientPolicy
import WebsocketClientPolicy

client = WebsocketClientPolicy(
    host="127.0.0.1",
    port=10092
)

while True:
    images = capture_multiview()          # returns List[np.ndarray]
    lang = get_instruction()              # may come from task scripts
    example = {
        "image": images,
        "lang": lang,
    }

    result = client.predict_action(example)  # --> forwarded to framework.predict_action
    action = result["normalized_actions"][0] # take the first item in the batch
    apply_action(action)
```

Fuer den Modell-Server starten Sie ihn einfach mit:

```bash
#!/bin/bash
export PYTHONPATH=$(pwd):${PYTHONPATH}

# Verweisen Sie auf Ihr StarVLA-Conda-Python
# $(which python) waehlt automatisch das Python aus Ihrer aktuell aktivierten Conda-Umgebung
# Stellen Sie sicher, dass Sie `conda activate starVLA` ausgefuehrt haben, bevor Sie dieses Skript ausfuehren
export star_vla_python=$(which python)
your_ckpt=results/Checkpoints/xxx.pt   # Ersetzen Sie durch Ihren Checkpoint-Pfad
gpu_id=0
port=5694

# export DEBUG=true
CUDA_VISIBLE_DEVICES=$gpu_id ${star_vla_python} deployment/model_server/server_policy.py \
    --ckpt_path ${your_ckpt} \
    --port ${port} \
    --use_bf16
```

### Hinweise

- Stellen Sie sicher, dass jedes Feld in `example` JSON-serialisierbar oder konvertierbar ist (Listen, Floats, Ints, Strings); konvertieren Sie benutzerdefinierte Objekte explizit.
- Bilder muessen als `np.ndarray` gesendet werden. Fuehren Sie `PIL.Image -> np.ndarray` vor der Uebertragung durch und konvertieren Sie auf dem Server bei Bedarf zurueck mit `to_pil_preserve` (`from starVLA.model.utils import to_pil_preserve`).
- Halten Sie Hilfsmetadaten (Episoden-IDs, Zeitstempel usw.) in dedizierten Schluesseln, damit das Framework diese weiterleiten oder protokollieren kann, ohne Kollisionen.

---

## PolicyClient-Interface-Design

![Policy-Interface](../../../../assets/starVLA_PolicyInterface.png)

Das `*2model_interface.py`-Interface ist dafuer konzipiert, alle Variationen zu kapseln und zu abstrahieren, die aus der Simulations- oder realen Umgebung stammen. Es unterstuetzt auch benutzerdefinierte Controller, wie die Umwandlung von Delta-Aktionen in absolute Gelenkpositionen. Sie koennen sich an den Implementierungen fuer verschiedene Benchmarks in `examples` orientieren, um Ihr eigenes Deployment aufzubauen.

---

## FAQ

**F: Warum enthalten Beispiele Dateien wie `model2{bench}_client.py`?**

A: Sie kapseln benchmarkspezifische Anpassungen, z. B. Action Ensembling, Umwandlung von Delta-Aktionen in absolute Aktionen oder die Ueberbrueckung von Simulator-Eigenheiten, sodass der Modell-Server generisch bleiben kann.

**F: Warum erwartet das Modell PIL-Bilder, waehrend der Transport `ndarray` verwendet?**

A: WebSocket-Payloads koennen PIL-Objekte nicht direkt serialisieren. Konvertieren Sie clientseitig zu `np.ndarray` und stellen Sie innerhalb des Frameworks auf PIL zurueck, falls das Modell dies erfordert.

Feedback zu umgebungsspezifischen Anforderungen ist ueber Issues willkommen.
