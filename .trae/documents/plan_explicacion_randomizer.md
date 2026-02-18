# Plan de Ajuste: Algoritmo Dinámico por Ranking

Este plan implementa la lógica solicitada para cumplir con los 3 escenarios:
1.  **España vs Caledonia**: 97% España, 2% Empate, 1% Caledonia.
2.  **España vs Argentina**: 38% España, 25% Empate, 37% Argentina.
3.  **Caledonia vs Surinam**: 75% Empate (partido trabado de pocos goles).

## 1. Nuevo Algoritmo de Empates (Reemplazar Líneas 49-51)

En lugar de un `drawProb = 0.25` fijo, usaremos una probabilidad dinámica basada en la diferencia y la suma de rankings.

**Instrucciones:**
Reemplaza la definición de `drawProb` con esto:

```typescript
// 1. Calcular métricas de ranking
const rankDiff = Math.abs(home.fifaRanking - away.fifaRanking);
const rankSum = home.fifaRanking + away.fifaRanking;

// 2. Factor de Paridad (Diferencia)
// Si la diferencia es grande (>130 puestos), el empate es casi imposible.
// Si la diferencia es 0, este factor es 1.0.
const parityFactor = Math.max(0, 1 - (rankDiff / 130));

// 3. Factor de Calidad (Suma)
// Equipos malos (Suma alta ~300) -> Empatan mucho (0.75).
// Equipos top (Suma baja ~3) -> Empatan "normal" (0.25).
// Fórmula: Base 0.25 + Porcentaje extra según lo "malo" que sean.
const qualityFactor = 0.25 + (Math.min(rankSum, 300) / 300) * 0.50;

// 4. Probabilidad Final
let drawProb = parityFactor * qualityFactor;

// Floor de seguridad: Siempre dejar un 2% de chance de empate por "milagro"
if (drawProb < 0.02) drawProb = 0.02;
```

**Verificación de tus casos:**
- **Esp(1) vs Cal(150):** Diff=149. Parity=0. DrawProb -> **0.02 (2%)**. Correcto.
- **Esp(1) vs Arg(2):** Diff=1. Parity~1. Quality=0.25 + casi nada. DrawProb -> **~0.25 (25%)**. Correcto.
- **Cal(150) vs Sur(150):** Diff=0. Parity=1. Quality=0.25 + 0.50. DrawProb -> **0.75 (75%)**. Correcto.

## 2. Ajuste de Fuerza para Victorias (Líneas 21-22)

Para lograr el 97% de victoria en el caso extremo, necesitamos aumentar la potencia de 7 a **8**.

**Instrucciones:**
Modifica las líneas 21-22:

```typescript
// Subir potencia a 8 para aplastar a los equipos chicos
const strengthHome = Math.pow(Math.max(1, maxRank - home.fifaRanking), 8);
const strengthAway = Math.pow(Math.max(1, maxRank - away.fifaRanking), 8);
```

Y muy importante, **elimina o comenta la línea 43** que comprime las probabilidades:
```typescript
// probHomeWin = 0.0002 + (probHomeWin * 0.9668); // <-- COMENTAR ESTO
// Usar probHomeWin puro.
```

## 3. Lógica de Goles según Calidad (Líneas 77-98)

Para que los equipos malos hagan menos goles y los buenos más, ajustaremos el resultado de goles final.

**Instrucciones:**
Justo después de calcular `totalGoals` (alrededor de la línea 98), agrega este ajuste:

```typescript
// Ajuste por calidad de equipos
const avgRank = (home.fifaRanking + away.fifaRanking) / 2;

// Si son equipos muy malos (Ranking > 100), restamos goles (partido trabado)
if (avgRank > 100) {
    totalGoals = Math.max(0, totalGoals - 1); // Quita 1 gol, mínimo 0
    // Opcional: Si son PÉSIMOS (>140), quitar otro más o forzar máx 1-2 goles
    if (avgRank > 140 && Math.random() < 0.5) totalGoals = Math.max(0, totalGoals - 1);
}

// Si son equipos muy buenos (Ranking < 20), sumamos chance de gol extra
if (avgRank < 20 && Math.random() < 0.5) {
    totalGoals += 1;
}
```

Esto hará que un Caledonia vs Surinam tienda al 0-0 o 1-1 (ayudando a la probabilidad de empate alta), mientras que un España vs Alemania tenga más goles.
