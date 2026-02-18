# Plan: Corregir "Irán en la Final" (Error de Overflow) y Mejorar Lógica

Tienes un problema crítico: **Elevar a la potencia 150 rompe las matemáticas de JavaScript**.
- `200^150` da `Infinity`.
- `Infinity / Infinity` da `NaN` (Not a Number).
- Cuando el resultado es `NaN`, la condición `if (random < prob)` falla y el código se va por el `else`, dándole la victoria al equipo visitante ("away") o comportándose de forma errática. Por eso ves resultados raros como Irán ganando siempre.

Elevar el exponente del local más que el visitante no es la solución (eso solo haría que el equipo que juegue de "local" gane siempre, sin importar si es bueno o malo).

## La Solución: Algoritmo Logístico (Estilo ELO)

En lugar de "fuerza bruta" con potencias que se desbordan, usaremos una **función logística** basada en la **diferencia de ranking**. Es el estándar en sistemas de clasificación (como ajedrez o videojuegos) y es matemáticamente estable.

### 1. Nueva Fórmula de Probabilidad de Victoria (Líneas 21-25)

Eliminaremos el cálculo de `strengthHome` y `strengthAway` y calcularemos la probabilidad directamente basándonos en la diferencia.

**Fórmula Propuesta:**
`Probabilidad = 1 / (1 + 10 ^ (Diferencia / Factor))`

Donde:
- `Diferencia` = Ranking Rival - Ranking Propio.
- `Factor`: Controla qué tan "dura" es la diferencia.
    - Un factor de **40** significa que con 40 puestos de diferencia, el favorito tiene ~90% de chance.
    - Con 20 puestos (España vs Irán), tendría ~75-80%.

Para ser **muy agresivo** (como quieres, que España aplaste a Irán), usaremos un factor bajo, por ejemplo **25**.

**Ejemplos con Factor 25:**
- **España (1) vs Irán (20):** Diferencia 19. Probabilidad España = 85%.
- **España (1) vs Caledonia (150):** Diferencia 149. Probabilidad España = 99.99%.
- **España (1) vs Argentina (2):** Diferencia 1. Probabilidad España = 52% (casi parejo).

### 2. Implementación en Código

Reemplazaremos el bloque de cálculo de fuerza (líneas 18-43) con esto:

```typescript
// Nuevo cálculo basado en Diferencia de Ranking (Sigmoide)
// Usamos un factor de escala (scaleFactor). 
// Cuanto MENOR sea el factor, más decisiva es la diferencia de ranking.
// 400 es lo normal en ELO. 25 es EXTREMADAMENTE agresivo (lo que buscas).
const scaleFactor = 25; 
const rankDiff = away.fifaRanking - home.fifaRanking; // Positivo si Home es mejor (Ranking menor)

// Fórmula logística estándar: 1 / (1 + 10^(-diff / scale))
let probHomeWin = 1 / (1 + Math.pow(10, -rankDiff / scaleFactor));

// Ajuste manual para diferencias extremas (seguro contra fallos)
// Si la diferencia es > 100 puestos, forzamos 99%
if (rankDiff > 100) probHomeWin = 0.99;
if (rankDiff < -100) probHomeWin = 0.01;
```

### 3. Mantener Lógica de Empates

La lógica de empates que implementamos antes (basada en paridad y calidad) sigue siendo válida y funcionará mejor con esta probabilidad base limpia.

### Resumen de Cambios
1.  Eliminar `Math.pow(..., 150)` que causa `Infinity`.
2.  Implementar función sigmoide con `scaleFactor = 25` para una dominación realista pero agresiva de los equipos top.
