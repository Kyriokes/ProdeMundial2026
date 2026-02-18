# Explicación de los Cruces de Fase de Eliminación (Knockout)

Este documento explica la lógica utilizada en `src/utils/knockoutLogic.ts` para determinar los enfrentamientos en la fase de eliminación directa del torneo.

## 1. Clasificación a la Fase de Eliminación
El torneo sigue un formato de 48 equipos divididos en 12 grupos (A-L). A la fase de eliminación (Ronda de 32) clasifican 32 equipos:
- **Los 2 primeros** de cada uno de los 12 grupos (24 equipos).
- **Los 8 mejores terceros** de entre todos los grupos.

## 2. Determinación de los Cruces (Ronda de 32)
La función `getKnockoutMatchups` es la encargada de generar los 16 partidos iniciales. El proceso es el siguiente:

### A. Asignación de los Mejores Terceros
Esta es la parte más compleja y dinámica. Hay 7 "slots" o espacios predefinidos donde un Ganador de Grupo enfrenta a un Tercer Lugar.
- Cada slot pertenece a un Ganador de Grupo específico (ej. Ganador del Grupo E).
- Cada slot tiene una lista de grupos "permitidos" de donde puede provenir el tercer lugar (para evitar cruces repetidos o seguir reglas del torneo).
- Se utiliza un algoritmo (backtracking) para asignar los 8 mejores terceros disponibles a estos slots respetando las restricciones.

### B. Cruces Fijos y Dinámicos
Los partidos se arman combinando:
1. **Ganadores vs Terceros:** Según la asignación calculada en el paso anterior (ej. Ganador E vs 3ro asignado).
2. **Ganadores vs Segundos:** Algunos cruces son fijos entre un primero y un segundo de otro grupo (ej. Ganador F vs Segundo C).
3. **Casos Especiales (L8 y L12):** Existen reglas específicas para manejar los terceros de los grupos F y L si clasifican, afectando contra quién juegan (ej. contra Ganador C o K).
4. **Resto de Segundos:** Los segundos lugares que no tienen un cruce fijo se emparejan entre sí o con el tercer lugar restante para completar los 16 partidos.

## 3. Progresión del Cuadro
Una vez definidos los 16 partidos de la Ronda de 32:
- El cuadro es fijo.
- El Ganador del Partido 1 juega contra el Ganador del Partido 2 en Octavos de Final, y así sucesivamente.
- Esto se genera en la función `generateBracket`, que crea las llaves vacías para Octavos, Cuartos, Semis y Final, vinculando cada partido con sus predecesores.

## Resumen
El sistema prioriza colocar a los terceros lugares en sus slots correspondientes según las reglas del torneo, y luego rellena los cruces restantes con los segundos lugares y ganadores que tienen enfrentamientos directos preasignados.
