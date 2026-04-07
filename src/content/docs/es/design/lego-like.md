---
title: Diseño Tipo Lego
description: Los principios modulares que hacen que StarVLA sea fácil de extender y depurar.
---

## Prueba de humo de cualquier submódulo

StarVLA enfatiza el diseño modular de modelos. Cada archivo de framework principal es ejecutable para depuración rápida y pruebas de humo:

```bash
# modelo (archivo de configuración ubicado en starVLA/config/training/starvla_cotrain_oxe.yaml)
python starVLA/model/framework/QwenOFT.py --config_yaml starvla_cotrain_oxe.yaml

# dataloader
python starVLA/dataloader/lerobot_datasets.py --config_yaml starvla_cotrain_oxe.yaml
```

**Regla de diseño:** `starVLA/model/framework/<tu_framework>.py` es la única superficie de API externa del modelo. Debe reflejar el diagrama del framework en tu artículo.

## Límites explícitos del modelo

StarVLA sigue una descomposición descendente y alta cohesión / bajo acoplamiento (cada módulo maneja su propia responsabilidad y los módulos no interfieren entre sí). El dataloader debe devolver un diccionario crudo, agnóstico al modelo, sin preprocesamiento específico del modelo.

Una muestra típica contiene:

- `image`: `list[PIL.Image] | np.ndarray` — imágenes de cámara (uno o más puntos de vista)
- `lang`: `str` — instrucción de tarea en lenguaje natural (por ejemplo, "pon el bloque rojo en la caja")
- `action`: `np.ndarray[T, action_dim]` — secuencia de acciones del robot (T pasos, cada uno con action_dim valores articulares)
- `state`: `Optional[np.ndarray[..., state_dim]]` — lecturas actuales de los sensores del robot (por ejemplo, ángulos articulares, posición del efector final; opcional)

Tanto `framework.forward()` como `framework.predict_action()` operan directamente sobre entradas crudas. Esto mantiene los límites entre entrenamiento y pruebas explícitos y fáciles de modificar.

## Sistema de configuración flexible

StarVLA utiliza un único objeto de configuración global potenciado por OmegaConf (una biblioteca de gestión de configuración YAML que soporta sobrescribir valores de configuración desde la línea de comandos). Los parámetros se pasan mediante diccionarios extensibles, permitiendo sobrescrituras y redundancia controlada.

Ejemplo (sobrescribir vía CLI):

```bash
accelerate launch \
  --config_file starVLA/config/deepseeds/deepspeed_zero2.yaml \
  --num_processes 8 \
  starVLA/training/train_starvla.py \
  --config_yaml ./starVLA/config/training/starvla_cotrain_oxe.yaml \
  --framework.qwenvl.base_vlm Qwen/Qwen2.5-VL-7B-Instruct \
  --framework.action_model.new_module ${module_name}
```

**Nota:** `framework.action_model.new_module` solo agrega claves a la configuración global. Su comportamiento está definido en tu implementación del framework.

## Cómo agregar un nuevo framework

¿Quieres integrar tu propia arquitectura de modelo? Solo tres pasos:

1. **Crear un archivo de framework**: Agrega `TuFramework.py` bajo `starVLA/model/framework/`, hereda de la clase base e implementa los métodos `forward()` y `predict_action()`.
2. **Escribir una prueba de humo**: Agrega un punto de entrada `if __name__ == "__main__":` al final del archivo para verificar que el pase forward y la predicción de acciones funcionan con datos ficticios.
3. **Registrar en la configuración**: Establece `framework.name: TuFramework` en tu configuración YAML de entrenamiento para conectarlo al pipeline existente de entrenamiento y evaluación.

Usa `QwenGR00T.py` o `QwenOFT.py` como plantillas.
