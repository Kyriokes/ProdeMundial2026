# Plan de Mejoras en Lógica de Randomización

El objetivo es ajustar la simulación de resultados para permitir empates (definición por penales) en la fase eliminatoria y aumentar el realismo de los resultados basándose más fuertemente en el ranking FIFA.

## 1. Permitir Empates y Penales en Eliminatorias

Actualmente, la lógica fuerza un ganador en los 90 minutos durante la fase eliminatoria (`!isKnockout`), impidiendo que los partidos vayan a penales.

### Cambios en `src/utils/randomizer.ts`:
*   **Modificar condición de empate**: Eliminar la restricción `&& !isKnockout` en la determinación inicial del ganador (`winner = 'draw'`).
*   **Ajustar probabilidad de empate**: Definir una probabilidad de empate específica para eliminatorias (generalmente los partidos son más cerrados, se puede mantener 0.25 o ajustar levemente).
*   **Verificación de flujo**: Asegurar que si `winner === 'draw'`, la lógica de asignación de goles genere un marcador igualado, lo cual activará automáticamente el bloque existente de "Penalties" al final de la función.

## 2. Aumentar Peso del Ranking FIFA

La lógica actual comprime ("clamping") las probabilidades de victoria entre 20% y 80%, lo que da demasiadas oportunidades a equipos débiles contra potencias.

### Cambios en `src/utils/randomizer.ts`:
*   **Eliminar o Suavizar Clamping**:
    *   Calcular la probabilidad base usando la diferencia de ranking invertida (como se hace actualmente).
    *   Eliminar la línea `probHomeWin = 0.2 + (probHomeWin * 0.6);` o cambiarla para que el rango sea mucho más amplio (ej. entre 0.05 y 0.95), permitiendo que equipos muy superiores tengan >90% de probabilidad de ganar.
    *   Opcional: Introducir un exponente para acentuar las diferencias (hacer la curva más pronunciada).

## 3. Archivos a Modificar

*   `src/utils/randomizer.ts`: Único archivo que requiere cambios de lógica.

## 4. Verificación
*   Ejecutar la randomización varias veces.
*   Verificar en la UI de "Eliminatorias" que aparezcan partidos definidos por penales (icono de silbato o marcador de penales).
*   Verificar que los campeones sean mayoritariamente equipos del top 10-20 del ranking FIFA, con sorpresas ocasionales pero no constantes.
