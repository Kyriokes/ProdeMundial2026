# Plan para Mejorar Cálculo de Probabilidades por Ranking FIFA

El usuario ha identificado un problema en cómo se calculan las probabilidades: el sistema actual utiliza "local" y "visitante" de una manera que puede confundir la lógica de "fuerza" basada en el ranking. Además, el usuario ha confirmado que **MENOR RANKING = MEJOR EQUIPO** (Posición 1 es mejor que 200).

Mi código anterior usaba `maxRank (215) - ranking` para invertir el valor y obtener una "fuerza". Sin embargo, la fórmula de probabilidad `FuerzaA / (FuerzaA + FuerzaB)` es **demasiado lineal**.
*   Ejemplo:
    *   Equipo A (Rank 1) -> Fuerza 214.
    *   Equipo B (Rank 100) -> Fuerza 115.
    *   Probabilidad A: 214 / (214+115) = **65%**.
    *   ¡Esto es muy bajo para un #1 vs #100! Debería ser >90%.

**Solución Propuesta: Curva Logística (Sigmoide) Adaptada**

Para reflejar la realidad del fútbol donde los equipos top son dominantes, usaremos una función sigmoide basada en la **diferencia de ranking**.

### Fórmula Propuesta:
1.  **Diferencia**: `diff = RankingB - RankingA` (Si A es mejor/menor ranking, diff será positivo).
2.  **Probabilidad**: `P(A gana) = 1 / (1 + 10 ^ (-diff / Factor))`
    *   El `Factor` controla qué tan rápido crece la probabilidad. Un factor de 400 es estándar en ELO, pero para Rankings (1-200) quizás necesitemos algo como **50**.

### Ejemplos con Factor = 50:
*   **Rank 1 vs Rank 200** (Diferencia 199):
    *   `P = 1 / (1 + 10^(-199/50))` = `1 / (1 + 0.0001)` = **99.99%** (Casi seguro).
*   **Rank 1 vs Rank 50** (Diferencia 49):
    *   `P = 1 / (1 + 10^(-49/50))` = `1 / (1 + 0.1)` = **90%** (Muy alta).
*   **Rank 10 vs Rank 20** (Diferencia 10):
    *   `P = 1 / (1 + 10^(-10/50))` = `1 / (1 + 0.63)` = **61%** (Ventaja clara pero no decisiva).
*   **Rank 100 vs Rank 110** (Diferencia 10):
    *   `P = 1 / (1 + 10^(-10/50))` = **61%**. (Misma ventaja relativa).

Esta fórmula cumple perfectamente con los requisitos:
1.  **Diferencias grandes (1 vs 200)** -> Probabilidad aplastante.
2.  **Diferencias pequeñas (100 vs 110)** -> Probabilidad competitiva (~60-40 o 55-45 dependiendo del factor).

## Pasos Técnicos

1.  **Modificar** `src/utils/randomizer.ts`:
    *   Implementar la nueva función `calculateWinProbability(rankA, rankB)`.
    *   Usar esta probabilidad para determinar el ganador.
    *   Mantener el "clamping" mínimo (ej. 1-99%) para permitir milagros muy raros.

2.  **Ajuste de Empates**:
    *   La probabilidad de empate debe ser mayor cuando los equipos son parejos.
    *   Podemos modelar la probabilidad de empate como una función de la diferencia de ranking: `P(Empate) = BaseProb * (1 - |ProbA - 0.5| * 2)`. Si ProbA es 0.5 (parejos), empate es máximo. Si ProbA es 0.99 (desigual), empate es mínimo.

## Verificación

*   Simular varios partidos mentalmente o en código para asegurar que los resultados tengan sentido.
