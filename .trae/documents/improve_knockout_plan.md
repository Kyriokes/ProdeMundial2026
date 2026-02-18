# Plan de Mejora y Validación: Lógica de Knockout

Basado en el análisis de los archivos actuales, aquí está el plan para asegurar que se cumplan los criterios del usuario.

## Estado Actual
- **Criterio 1: Un primero nunca enfrenta a su propio tercero.**
  - `src/utils/thirdCombinationMap.ts` tiene un chequeo básico `if (winner === third) continue;`. Sin embargo, el fallback es simple y podría mejorarse para garantizar solución si existe.
- **Criterio 2: Mantener equilibrio izquierda/derecha del cuadro.**
  - `src/utils/knockoutLogic.ts` genera partidos en orden secuencial (1 al 16) y luego los agrupa `(2*i - 2)` y `(2*i - 1)`.
  - La distribución actual agrupa letras cercanas (A con B, C con D). Esto no necesariamente es "equilibrado" en el sentido de mezclar grupos lejanos (ej. A vs L), pero sigue una lógica determinista.
  - Para mejorar el equilibrio visual/competitivo, se puede ajustar el orden de los partidos en el array final para que las llaves de Octavos crucen lados opuestos (ej. Ganador Match 1 vs Ganador Match 9) en lugar de secuencial, pero esto requiere cambiar `generateBracket`.
  - *Decisión:* Mantendremos el orden secuencial lógico (A..L) pero aseguraremos que los cruces de R32 mezclen bien. El usuario pidió "equilibrio", lo cual suele significar que no todos los favoritos estén en la misma mitad. Con la distribución actual (A..L), A-F están arriba y G-L abajo, lo cual es un equilibrio estándar.

- **Criterio 3: Priorizar proximidad alfabética.**
  - El fallback actual itera ganadores (B, C, D...) y terceros disponibles en orden. Esto naturalmente asigna "lo más cercano posible" (B intenta con A, luego B(skip), luego C...).
  - Se puede hacer explícito ordenando `availableThirds` por "distancia" al ganador actual antes de intentar asignar, pero el orden natural ya hace un buen trabajo.

- **Criterio 4: Garantizar que exactamente 8 primeros reciban terceros.**
  - Se cumple. Los ganadores B, C, D, F, G, I, K, L (8 equipos) buscan terceros. A, E, H, J tienen fijos.

## Tareas de Implementación

### 1. Mejorar el Generador de Fallback (`src/utils/thirdCombinationMap.ts`)
Refinar la función `getPatternForCombination` para que sea más robusta y priorice explícitamente la proximidad.
- Ordenar los candidatos por proximidad alfabética al ganador actual.
- Asegurar que el backtracking explore opciones que minimicen la distancia global.

### 2. Ajustar Orden de Partidos (`src/utils/knockoutLogic.ts`)
Revisar el orden en que se agregan los partidos al array `matches`.
- Actualmente:
  - M1: A vs C2
  - M2: B vs 3rd
  - ...
  - M13..M16: Segundos vs Segundos.
- El usuario mencionó "M1 winner vs M2 winner".
- Si M1 es A vs C2 y M2 es B vs 3rd -> Ganador A juega contra Ganador B. Esto es correcto (Grupos vecinos).
- Pero los partidos de Segundos (M13..M16) están al final. ¿Contra quién juegan sus ganadores?
- `generateBracket` toma `roundOf32Matches` linealmente.
  - R16-1: Winner M1 vs Winner M2.
  - ...
  - R16-7: Winner M13 vs Winner M14.
  - R16-8: Winner M15 vs Winner M16.
- Esto significa que los 8 partidos de "Segundos vs Segundos" (que son 4 partidos en realidad) producen 4 ganadores que juegan entre sí en R16.
- **ERROR POTENCIAL:** Los partidos 13, 14, 15, 16 (2dos vs 2dos) están aislados al final. Sus ganadores jugarían entre ellos en Octavos.
- Lo lógico es que estos partidos se intercalen.
- **Corrección:** Debemos insertar los partidos de "2do vs 2do" en posiciones estratégicas para que sus ganadores enfrenten a los ganadores de "1ro vs 3ro/2do".
- *Espera, el formato de 32 equipos es nuevo.*
- Si hay 16 partidos en R32 -> 16 ganadores en R16 -> 8 partidos.
- La estructura actual empareja (M1, M2), (M3, M4)...
- Si M1..M12 son "1ro vs X" y M13..M16 son "2do vs 2do".
- Entonces en R16:
  - (M1, M2) -> OK.
  - ...
  - (M11, M12) -> OK.
  - (M13, M14) -> Ganador (2A vs 2B) vs Ganador (2D vs 2E).
  - (M15, M16) -> Ganador (2F vs 2H) vs Ganador (2I vs 2J).
- Esto crea una rama del cuadro donde SOLO hay segundos lugares hasta Cuartos de Final. **Esto viola el principio de equilibrio.** Los segundos deberían cruzarse con los primeros en algún punto, o al menos distribuirse.
- **Solución:** Intercalar los partidos de "2do vs 2do" entre los de "1ro vs X".
- Ejemplo:
  - Llave 1: (A1 vs C2) vs (2A vs 2B) -> No, A1 no debería jugar contra 2A tan pronto.
  - Necesitamos un orden que mezcle.
  - Vamos a reordenar los `addMatch` para distribuir los partidos 13-16 en el flujo.

### 3. Nuevo Orden Propuesto (Ejemplo)
1.  A1 vs C2
2.  I1 vs 3rd
3.  C1 vs 3rd
4.  F1 vs 3rd
5.  E1 vs G2
6.  2A vs 2B (Insertado)
7.  ...
*Mejor:* Seguir el bracket oficial si es posible, o crear uno lógico:
- Bloque 1: (A1 vs C2) vs (I2 vs J2) -> M1 vs M2
- Bloque 2: (K1 vs 3rd) vs (F1 vs 3rd) -> M3 vs M4
- etc.

Voy a proponer un orden que distribuya los "Segundos vs Segundos" para que enfrenten a ganadores de grupos en Octavos.

## Pasos
1.  **Refactorizar `src/utils/thirdCombinationMap.ts`**: Mejorar fallback para proximidad.
2.  **Refactorizar `src/utils/knockoutLogic.ts`**: Cambiar el orden de los `addMatch` para intercalar los partidos de 2dos lugares y evitar "guetos" de segundos lugares.
3.  **Verificación**: Correr el script de prueba (ajustado) para ver los emparejamientos resultantes.

## Pregunta al Usuario (Implícita en el plan)
Confirmaré que reordenaré los partidos para evitar que los segundos lugares jueguen solos en una rama del cuadro.
