---
title: Co-entrenamiento con Datos VLM
description: Integra datos VLM (Vision-Language Model) para co-entrenar el framework StarVLA.
---

Esta guía describe el proceso para integrar datos VLM (Vision-Language Model) para co-entrenar el framework StarVLA (Vision-Language-Action).

**¿Por qué co-entrenar?** Entrenar un VLA puramente con datos de manipulación robótica puede degradar la comprensión de visión y lenguaje del backbone VLM — esto se conoce como "olvido catastrófico": después de ser entrenado solo con datos de robot, el modelo puede olvidar cómo interpretar imágenes, responder preguntas o entender instrucciones complejas. Mezclar datos VLM (QA de imágenes, captioning, etc.) preserva la comprensión general del modelo mientras aprende control robótico.

---

## 1. Preparación de Datos Multi-Modal

Los datos VLM deben adherirse a la [Estructura de Datos JSON de Conversaciones de QwenVL](https://github.com/QwenLM/Qwen3-VL/tree/main/qwen-vl-finetune).

### Formato Requerido

Cada instancia de datos es un objeto JSON que vincula una **ruta de archivo de imagen** con una lista de **turnos conversacionales humano-GPT**.

```json
{
    "image": "path/to/images/001.jpg",
    "conversations": [
        {
            "from": "human",
            "value": "<image>\nWhat's the main object in this picture?"
            // <image> es un marcador que le dice al modelo "inserta la imagen aquí";
            // la ruta real de la imagen se especifica en el campo externo "image"
        },
        {
            "from": "gpt",
            "value": "A red apple on a wooden table"
        }
    ]
}
```

### Inicio Rápido

Puedes descargar nuestro dataset de ejemplo [LLaVA-OneVision-COCO](https://huggingface.co/datasets/StarVLA/LLaVA-OneVision-COCO).

Descomprime `sharegpt4v_coco.zip` y colócalo en `playground/Datasets/LLaVA-OneVision-COCO`.

La estructura de archivos resultante se verá así:

```bash
.../LLaVA-OneVision-COCO
├── images
│   └── sharegpt4v_coco
└── llava_jsons
    └── sharegpt4v_coco.json
```

---

## 2. Configuración del Dataset VLM

Para agregar un dataset VLM personalizado, sigue estos pasos:

### 2.1 Registrar el Dataset (Python)

Registra tu dataset agregándolo al `data_dict` en `starVLA/dataloader/qwenvl_llavajson/qwen_data_config.py`:

```python
# Ejemplo de Registro
# json_root e image_root están definidos al inicio de este archivo,
# apuntando por defecto a subdirectorios bajo playground/Datasets/LLaVA-OneVision-COCO/:
#   json_root = "playground/Datasets/LLaVA-OneVision-COCO/llava_jsons"
#   image_root = "playground/Datasets/LLaVA-OneVision-COCO/images"

SHAREGPT4V_COCO = {
    "annotation_path": f"{json_root}/sharegpt4v_coco.json",
    "data_path": f"{image_root}/",
}

data_dict = {
    "sharegpt4v_coco": SHAREGPT4V_COCO, # Usa este nombre en la configuración YAML
}
```

### 2.2 Actualizar el YAML de Entrenamiento

Incluye la configuración del dataset VLM en tu archivo YAML de entrenamiento (`your_train_config.yaml`):

```yaml
datasets:
  vlm_data:
    dataset_py: vlm_datasets
    dataformat: llava_json
    dataset_use: sharegpt4v_coco # Debe coincidir con el nombre registrado en 2.1
```

**Consejo:** Puedes verificar el dataloader VLM ejecutando:

```bash
python starVLA/dataloader/vlm_datasets.py --config_yaml your_train_config.yaml
```

---

## 3. Ejecución del Entrenamiento

Elige el script apropiado según si quieres entrenar *solo* con datos VLM o *co-entrenar* con datos VLA.

:::tip[¿Cómo elegir?]
- **Si solo quieres ajustar finamente el VLM** (por ejemplo, ajustar con datos imagen-texto específicos del dominio sin acciones de robot), elige la **Opción A**.
- **Si tienes datos de robot y quieres entrenar ambos juntos** (para prevenir el olvido catastrófico mientras el modelo aprende tanto control robótico como comprensión visual-lingüística), elige la **Opción B**.
:::

### Opción A: Entrenar solo con Datos VLM

Usa esto para pre-entrenamiento o ajuste fino específico de VLM.

**Script:** `starVLA/training/train_starvla_vlm.py`

```bash
bash examples/CoTrainVLM/train_files/run_train_starvlm.sh
```

### Opción B: Co-entrenar VLA con Datos VLM

Esto entrena simultáneamente el modelo tanto con datos de robótica (VLA) como multi-modales (VLM).

**Script:** `starVLA/training/train_starvla_cotrain.py`

```bash
bash examples/CoTrainVLM/train_files/run_libero_cotrain.sh
```
