# Plan de Mejora: Vista Móvil Fase Eliminatoria

## Objetivo
Optimizar la vista móvil de la fase eliminatoria para aprovechar mejor el espacio y simplificar la navegación.

## Cambios Solicitados
1.  **Diseño en 2 columnas**: Mostrar los partidos en una cuadrícula de 2 columnas en lugar de una lista vertical de una sola columna.
2.  **Unificar Semis y Final**: Combinar las pestañas de "Semifinales" y "Final" en una sola vista llamada "Definición" (o similar) para reducir el número de pestañas.

## Estrategia de Implementación

### 1. Modificar `src/components/MobileKnockoutView.tsx`

**Actualización de Estado y Tipos:**
-   Extender el tipo `RoundKey` para incluir `'finalStages'` y mantener las rondas anteriores (`roundOf32`, `roundOf16`, `quarterFinals`).
-   Actualizar el array `tabs` para:
    -   Mantener: 16avos, 8avos, Cuartos.
    -   Reemplazar: "Semis" y "Final" por una nueva pestaña "Definición".

**Lógica de Renderizado:**

-   **Para rondas preliminares (16avos, 8avos, Cuartos):**
    -   Cambiar el contenedor de lista (`flex-col`) a un **Grid** (`grid grid-cols-2 gap-2`).
    -   Esto permitirá ver dos partidos por fila, aprovechando el ancho.

-   **Para la pestaña "Definición" (`finalStages`):**
    -   Renderizar una sección con título "Semifinales".
    -   Mostrar los 2 partidos de semifinales (puede ser en 2 columnas o 1 centrada dependiendo del espacio, 2 columnas es consistente).
    -   Renderizar una sección con título "Gran Final".
    -   Mostrar el partido final (centrado y destacado).
    -   Mostrar la sección de "Campeón" debajo de la final.

## Pasos

1.  **Editar `src/components/MobileKnockoutView.tsx`**:
    -   Modificar la definición de `tabs`.
    -   Ajustar el renderizado condicional del contenido principal.
    -   Implementar el layout de grid para las rondas normales.
    -   Implementar el layout personalizado para la nueva pestaña unificada.

## Verificación
-   Comprobar que en las primeras rondas los partidos se ven en 2 columnas.
-   Comprobar que la pestaña "Definición" muestra Semis, Final y Campeón correctamente.
-   Asegurar que la funcionalidad de editar resultados sigue funcionando.
