---
description: Verifica los criterios de aceptación de un archivo spec usando Context7 y Playwright
agent: spec-verifier
model: opencode-go/qwen3.6-plus
---

Verificá los criterios de aceptación del spec ubicado en: $ARGUMENTS

Seguí el workflow completo:
1. Leé el archivo spec
2. Para cada criterio de aceptación:
   - Si involucra código/Next.js: usá Context7 para validar
   - Si involucra UI/pantallas: usá Playwright para verificar visualmente
   - Si involucra lógica/datos: revisá el código correspondiente
3. Editá el spec marcando los checks como [x] o [ ] según corresponda
4. Generá el resumen final
