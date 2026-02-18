# Plan de Implementación: Refactorización de la Lógica de Knockout

Este plan detalla los pasos para refactorizar la lógica de emparejamientos de la fase de eliminación, reemplazando el algoritmo de backtracking por una tabla de búsqueda (lookup table) determinista, siguiendo el reglamento real del Mundial 2026.

## Objetivos
- Eliminar la lógica dinámica de resolución de conflictos (`solve`).
- Implementar una tabla de combinaciones (`thirdCombinationMap`) para los 8 mejores terceros.
- Definir los cruces fijos y los dependientes de la combinación de terceros.
- Asegurar que la progresión del cuadro (R32 -> R16 -> ...) sea consistente.

## Estructura de Archivos
- `src/utils/thirdCombinationMap.ts`: Nuevo archivo que contendrá el objeto con las 495 combinaciones posibles.
- `src/utils/knockoutLogic.ts`: Refactorización completa para usar el mapa y los cruces fijos.

## Pasos de Implementación

### 1. Crear `src/utils/thirdCombinationMap.ts`
Se creará el archivo con la estructura de la tabla.
**Nota:** Dado que hay 495 combinaciones, se generará la estructura base y se poblará con la lógica estándar de FIFA (evitar cruces del mismo grupo) o se dejará preparada para inyectar la data completa si se dispone de una fuente externa (JSON/CSV).
*Se investigará si existe un algoritmo generador simple para llenar esta tabla pre-build.*

### 2. Refactorizar `src/utils/knockoutLogic.ts`

#### A. Definir Estructura Base y Clasificados
- Mantener la lógica de selección de clasificados (Winners, Runners-up, Best 3rds).
- Ordenar los grupos de los 8 mejores terceros alfabéticamente para formar la "key" (ej. "BCDFHIJK").

#### B. Implementar Cruces Fijos
Según las indicaciones, se hardcodearán los siguientes cruces:
- **Partido 2:** A1 vs C2
- **Partido 6:** E1 vs G2
- **Partido 10:** H1 vs L2
- **Partido 14:** J1 vs K2
*(Los IDs de partido se ajustarán al orden secuencial del bracket oficial).*

#### C. Implementar Lógica de Lookup
- Usar la key generada para buscar en `thirdCombinationMap`.
- El patrón retornado definirá:
    - Qué Ganadores (1sts) enfrentan a qué Terceros (3rds).
    - Los cruces restantes de Ganadores vs Segundos (si los hay aparte de los fijos).
    - Los cruces entre Segundos restantes (si aplica según el reglamento de 32 equipos).

#### D. Generar los 16 Partidos (Ronda de 32)
- Construir el array de partidos `roundOf32` asignando `homeTeam` y `awayTeam` según el patrón y los fijos.
- Asignar IDs consistentes para la progresión.

### 3. Actualizar `generateBracket`
- Verificar que la función `generateBracket` conecte correctamente los ganadores de la R32 a la R16.
- Asegurar que el flujo (Winner M1 vs Winner M2) sea el correcto.

### 4. Verificación
- Crear un test case con una combinación de terceros conocida (ej. los de un mundial anterior o ejemplo teórico) para validar que los cruces se generan correctamente sin "undefined".

## Preguntas/Confirmaciones
- ¿Tienes el JSON/Objeto completo de las 495 combinaciones? Si no, puedo generar uno basado en la regla de "proximidad y evitar mismo grupo" o usar un subset para pruebas.
