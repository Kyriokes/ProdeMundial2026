# Documentación de Reglas de Fase de Grupos - Prode Mundial 2026

Este documento detalla la lógica implementada actualmente en el código para la fase de grupos, criterios de desempate y clasificación a la siguiente ronda.

## 1. Formato de Grupos
- El torneo cuenta con **12 grupos** (Grupo A hasta Grupo L).
- Cada grupo está compuesto por **4 equipos**.
- Sistema de "todos contra todos" (Round Robin): cada equipo juega 3 partidos.
- Total de partidos por grupo: 6.

## 2. Sistema de Puntuación
Por cada partido disputado se otorgan los siguientes puntos:
- **Victoria**: 3 puntos.
- **Empate**: 1 punto.
- **Derrota**: 0 puntos.

## 3. Estadísticas Calculadas
Para cada equipo se calculan las siguientes estadísticas acumuladas:
- **PJ**: Partidos Jugados.
- **G**: Ganados.
- **E**: Empatados.
- **P**: Perdidos.
- **GF**: Goles a Favor.
- **GC**: Goles en Contra.
- **DG**: Diferencia de Gol (GF - GC).
- **Fair Play**: Puntos de disciplina.

### Sistema de Puntos Fair Play
Se restan puntos según las tarjetas recibidas:
- **Tarjeta Amarilla**: -1 punto.
- **Doble Amarilla**: -3 puntos.
- **Roja Directa**: -4 puntos.
*(Nota: Un valor más cercano a 0 es mejor).*

## 4. Criterios de Desempate (Tiebreakers)
Si dos o más equipos empatan en puntos al finalizar la fase de grupos, se ordenan según los siguientes criterios de prioridad (de mayor a menor importancia):

1.  **Mayor Diferencia de Gol (DG)** en todos los partidos del grupo.
2.  **Mayor cantidad de Goles a Favor (GF)** en todos los partidos del grupo.
3.  **Resultado entre sí (Head-to-Head)**:
    - Puntos obtenidos en el partido jugado entre los equipos empatados.
    - Diferencia de gol en el partido entre ellos.
    - Goles a favor en el partido entre ellos.
4.  **Puntos Fair Play** (el que tenga más puntos, es decir, menos tarjetas).
5.  **Ranking FIFA** (el que tenga mejor ranking, es decir, menor número).

*Referencia en código: `src/utils/calculations.ts` - función `resolveTies`.*

## 5. Clasificación a Eliminatorias (Knockout)
Clasifican a la ronda de 32avos (Round of 32) un total de **32 equipos**:

- **Los 1º de cada grupo** (12 equipos).
- **Los 2º de cada grupo** (12 equipos).
- **Los 8 mejores 3º** de todos los grupos.

### Criterio para Mejores Terceros
Para determinar cuáles son los 8 mejores terceros, se comparan entre sí usando los siguientes criterios:
1.  Mayor cantidad de **Puntos**.
2.  Mayor **Diferencia de Gol**.
3.  Mayor cantidad de **Goles a Favor**.
4.  Mejor puntaje de **Fair Play**.
5.  Mejor **Ranking FIFA**.

*(Nota: En la comparación de terceros NO se usa el criterio de "partido entre sí" ya que no jugaron todos contra todos).*

*Referencia en código: `src/utils/calculations.ts` - función `getQualifiedTeams` y `compareThirdPlace`.*
