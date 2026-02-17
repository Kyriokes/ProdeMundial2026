# Documentación y Verificación de Reglas de Desempate

## Objetivo
Documentar claramente las reglas de desempate de la fase de grupos y explicar casos complejos (como el triple empate en el Grupo I) para confirmar que la lógica aplicada es la correcta según estándares FIFA.

## 1. Reglas de Desempate Implementadas
El orden de prioridad actual en el sistema (`src/utils/calculations.ts`) es:

1.  **Puntos** (Mayor es mejor).
2.  **Diferencia de Gol (DG)** Global (Mayor es mejor).
3.  **Goles a Favor (GF)** Global (Mayor es mejor).
4.  **Partido entre sí (Head-to-Head)**.
5.  **Fair Play** (Menos tarjetas es mejor).
6.  **Ranking FIFA**.

## 2. Análisis del Caso: Grupo I (Noruega, Senegal, Francia)
Según la captura enviada:
- **Noruega**: 6 pts, +4 DG, **9 GF** (5+3+1).
- **Senegal**: 6 pts, +4 DG, **8 GF** (2+2+4). *Tiene tarjetas amarillas.*
- **Francia**: 6 pts, +4 DG, **7 GF** (1+4+2).
- **Irak**: 0 pts.

### Resolución del Empate
1.  **Puntos**: Todos tienen 6. (Empate)
2.  **Diferencia de Gol**: Todos tienen +4. (Empate)
3.  **Goles a Favor**:
    - Noruega: 9
    - Senegal: 8
    - Francia: 7
    
    **Resultado**: El desempate se resuelve aquí por cantidad de goles.
    - 1º Noruega
    - 2º Senegal
    - 3º Francia

**Conclusión**: Senegal queda 2º porque tiene más goles a favor (8) que Francia (7). El criterio de **Fair Play** (tarjetas) es el 5º criterio y solo se aplicaría si también empataran en Goles a Favor y en el partido entre sí.

## 3. Acción
- Generar el archivo `explicacion_reglas_fase_grupos.md` con esta información detallada para referencia futura.
- No se requieren cambios en el código ya que el comportamiento es correcto según las reglas estándar.
