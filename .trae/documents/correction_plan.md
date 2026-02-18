# Plan de Corrección: Lógica de Knockout según Reglamento Oficial

Tras revisar la documentación oficial (basada en el anexo C del reglamento FIFA 2026 y Wikipedia), se ha detectado que la lógica implementada anteriormente (basada en instrucciones previas) **difiere** del reglamento oficial.

## Discrepancias Detectadas

| Característica | Implementación Anterior (Incorrecta) | Reglamento Oficial (Match 73-88) |
| :--- | :--- | :--- |
| **1ros vs 2dos** | A1 vs C2, E1 vs G2, H1 vs L2, J1 vs K2 | **1C vs 2F**, **1F vs 2C**, **1H vs 2J**, **1J vs 2H** |
| **1ros vs 3ros** | B, C, D, F, G, I, K, L | **A, B, D, E, G, I, K, L** |
| **2dos vs 2dos** | 2A vs 2B, 2D vs 2E, 2F vs 2H, 2I vs 2J | **2A vs 2B**, **2E vs 2I**, **2K vs 2L**, **2D vs 2G** |
| **Orden de Partidos** | Secuencial (1-16) | Específico (Match 73 a Match 88) |

## Objetivos
Refactorizar `knockoutLogic.ts` y `thirdCombinationMap.ts` para alinearse estrictamente con el **Match Schedule Oficial**.

## Pasos de Implementación

### 1. Actualizar `src/utils/knockoutLogic.ts`
Implementar la lista exacta de 16 partidos (Matches 73-88) según el reglamento:
-   **M73:** 2A vs 2B
-   **M74:** 1E vs 3rd
-   **M75:** 1F vs 2C
-   **M76:** 1C vs 2F
-   **M77:** 1I vs 3rd
-   **M78:** 2E vs 2I
-   **M79:** 1A vs 3rd
-   **M80:** 1L vs 3rd
-   **M81:** 1D vs 3rd
-   **M82:** 1G vs 3rd
-   **M83:** 2K vs 2L
-   **M84:** 1H vs 2J
-   **M85:** 1B vs 3rd
-   **M86:** 1J vs 2H
-   **M87:** 1K vs 3rd
-   **M88:** 2D vs 2G

### 2. Actualizar `src/utils/thirdCombinationMap.ts`
-   Modificar el tipo `ThirdPlacePattern` para que las claves sean los ganadores que enfrentan a terceros: **A, B, D, E, G, I, K, L**.
-   Actualizar el generador de fallback para asignar terceros a estos 8 equipos específicos.
-   Asegurar que el criterio de "proximidad alfabética" se use en el fallback.

### 3. Actualizar `generateBracket`
-   Ajustar la lógica de emparejamientos de Octavos de Final (Round of 16).
-   El cuadro oficial cruza:
    -   Ganador M73 vs Ganador M74
    -   Ganador M75 vs Ganador M76
    -   ... y así sucesivamente.
-   Verificar que esto genere los cruces correctos (ej. Lado Izquierdo vs Lado Derecho en la final).

### 4. Verificación
-   Ejecutar nuevamente el script de prueba (`test_knockout.ts` será recreado) para confirmar que los cruces coinciden con la estructura oficial.

## Criterios del Usuario (Revisión)
1.  **Un primero nunca enfrenta a su propio tercero:** Se mantendrá esta restricción en el generador.
2.  **Equilibrio izquierda/derecha:** El schedule oficial (M73-M88) ya está balanceado por diseño FIFA.
3.  **Prioridad alfabética:** Se incorporará en el fallback.
4.  **Exactamente 8 primeros reciben terceros:** Se cumple con la nueva lista (A, B, D, E, G, I, K, L).
