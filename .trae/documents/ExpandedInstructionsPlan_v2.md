# Plan: Ampliar Instrucciones de Bienvenida (Revisión 1)

## Objetivo
Mejorar el modal de instrucciones (`InstructionsModal.tsx`) para incluir explicaciones detalladas sobre funcionalidades adicionales solicitadas por el usuario, con énfasis especial en el mecanismo de guardado y compartición.

## Nuevas Funcionalidades a Documentar

1.  **Aleatoriedad y Control:**
    *   **Randomizar:** Explicar el botón global (dado grande) para simular todo el torneo y el dado pequeño en cada partido para resultados individuales sorpresa.
    *   **Borrar:** Explicar el botón de goma de borrar para reiniciar todo.

2.  **Compartir y Guardar (Actualizado):**
    *   **Guardado Automático en URL:** Destacar que cada cambio actualiza la URL en tiempo real.
    *   **Botón Compartir:** Permite copiar este enlace único para guardar el progreso o enviarlo a amigos en cualquier momento.

3.  **Fase de Grupos:**
    *   Explicar la interacción con las tarjetas de partido (input manual vs aleatorio).

4.  **Soporte:**
    *   Mencionar la opción de "Invitar un Cafecito" si les gusta la herramienta.

## Estrategia de Diseño
Para no abrumar al usuario con una lista interminable, estructuraré el modal en dos columnas o secciones claras: **"Flujo del Torneo"** (pasos 1, 2, 3) y **"Herramientas Útiles"**.

### Estructura de Contenido Propuesta

**Sección 1: Flujo Principal (Izquierda o Arriba)**
*   1. Clasificación
*   2. Fase de Grupos
*   3. Fase Eliminatoria

**Sección 2: Herramientas y Tips (Derecha o Abajo)**
*   **Resultados Aleatorios:** "Usa el dado general para simular todo o el dado por partido."
*   **Guardar y Compartir:** "Tu predicción se guarda en el enlace. Copia y comparte tu URL en cualquier momento."
*   **Gestión:** "Borra todo para empezar de cero."
*   **Apoyo:** "Si te gusta, invítame un cafecito."

## Pasos de Implementación

1.  **Modificar `src/components/InstructionsModal.tsx`**:
    *   Importar nuevos iconos de `lucide-react`: `Dices`, `Eraser`, `Share2`, `Coffee`, `LayoutGrid`.
    *   Reestructurar el layout del modal para soportar más contenido (posiblemente `grid-cols-1 md:grid-cols-2` en pantallas grandes).
    *   Actualizar los textos para reflejar la explicación detallada sobre el link y compartir.

## Detalles de UX
*   Asegurar que el modal tenga scroll (`overflow-y-auto`) si el contenido excede la pantalla en móviles.
*   Usar iconos coloridos para diferenciar las herramientas.

## Verificación
*   Verificar que la explicación sobre el link/URL sea clara.
*   Verificar que todas las herramientas (dado, goma, compartir, cafecito) estén mencionadas.
