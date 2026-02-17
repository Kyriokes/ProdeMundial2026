# Plan de Implementación: Sistema de Fair Play (Tarjetas)

## Resumen
Implementaremos un sistema para registrar tarjetas amarillas y rojas en los partidos de fase de grupos, afectando el cálculo de Fair Play para los desempates.

## Estrategia de UI (Minimizando el Ruido Visual)
Para evitar saturar la interfaz, adoptaremos un enfoque de **divulgación progresiva**:
1.  **Estado Inicial (Limpio)**: El partido se ve igual que ahora (Banderas, Nombres, Goles).
2.  **Acción**: Un botón sutil de "Tarjetas" (icono) al lado del resultado.
3.  **Estado Expandido**: Al hacer clic, se despliega un panel *debajo* del partido con los contadores de tarjetas para ambos equipos.

### Mockup Visual (Texto)
```
[Bandera] ARG  2 - 0  POL [Bandera]  [Icono Tarjeta]
--------------------------------------------------
(Panel Expandido)
       Amarillas   2da Amarilla   Roja Directa
ARG:   [ - 1 + ]    [ - 0 + ]      [ - 0 + ]
POL:   [ - 2 + ]    [ - 0 + ]      [ - 1 + ]
```

## Cambios Técnicos

### 1. Modelo de Datos (`types/index.ts`)
Actualizar la interfaz `MatchResult` para incluir el desglose de tarjetas:
```typescript
export interface MatchResult {
  homeGoals: number | undefined;
  awayGoals: number | undefined;
  // Nuevos campos opcionales
  homeYellow?: number;
  homeDoubleYellow?: number; // Segunda amarilla (expulsión indirecta)
  homeDirectRed?: number;    // Roja directa
  awayYellow?: number;
  awayDoubleYellow?: number;
  awayDirectRed?: number;
}
```

### 2. Lógica de Negocio (`utils/calculations.ts`)
1.  **Puntaje Fair Play**: Implementar el cálculo estándar FIFA:
    -   Tarjeta Amarilla: -1 punto
    -   Segunda Amarilla/Roja Indirecta: -3 puntos
    -   Roja Directa: -4 puntos
    -   Amarilla y Roja Directa: -5 puntos
2.  **Validación**:
    -   Regla de negocio: `(doubleYellow + directRed) <= 4` por equipo.
    -   Un equipo no puede quedar con menos de 7 jugadores.

### 3. Componentes UI
1.  **`MatchRow.tsx`**:
    -   Agregar estado local `isExpanded`.
    -   Renderizar el botón de toggle.
    -   Renderizar el panel de tarjetas con inputs numéricos (o botones +/-).
    -   Usar los SVGs proporcionados por el usuario para las tarjetas.
2.  **`GroupCard.tsx`**:
    -   Pasar los nuevos datos al `MatchRow`.
    -   (Opcional) Mostrar columna "FP" en la tabla de posiciones si hay espacio, o en un tooltip.

## Validación de Factibilidad
-   **Store**: Compatible.
-   **Performance**: Impacto nulo.
-   **UI**: El diseño colapsable resuelve la preocupación de "demasiado cargada".

## Recursos
-   **Icono Roja**: `https://ssl.gstatic.com/onebox/sports/soccer_timeline/red-card-right.svg`
-   **Icono Amarilla**: `https://ssl.gstatic.com/onebox/sports/soccer_timeline/yellow-card-right.svg`
