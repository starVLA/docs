---
title: Contribuir
description: Cómo reportar problemas, proponer cambios y citar StarVLA.
---

## Cómo Contribuir

1. **Reporta problemas primero**: Abre un Issue. Si necesita aclaración, inicia una Discusión.
2. **Propón cambios**: Abre un PR después de alinear el alcance y diseño a través de un Issue o una sincronización breve (Formulario de Cooperación).
3. **Desbloquéate**: Usa el Formulario de Cooperación y únete a las horas de oficina (viernes por la tarde) para discusión en vivo.

Formulario de Cooperación: https://forms.gle/R4VvgiVveULibTCCA

## Lista de Verificación para PRs

- Proporciona un resumen breve y enlace al Issue relacionado.
- Incluye capturas de pantalla o GIFs para cambios visuales.
- Ejecuta verificaciones locales antes de enviar (por ejemplo, `make check` en el repositorio principal).

## Cita

```bibtex
@misc{starvla2025,
  title  = {StarVLA: A Lego-like Codebase for Vision-Language-Action Model Developing},
  author = {starVLA Community},
  url = {https://github.com/starVLA/starVLA},
  year   = {2025}
}
```

## Licencia y Notas sobre Rebase

StarVLA se publica bajo la Licencia MIT, que permite uso comercial, modificación, distribución y uso privado.

Al hacer rebase desde el upstream de StarVLA, usa mensajes de commit descriptivos (por ejemplo, `chore: rebase from StarVLA`) y mantén al menos los dos últimos commits del upstream como separados.
