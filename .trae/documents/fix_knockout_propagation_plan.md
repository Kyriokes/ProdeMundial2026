# Plan de Corrección: Propagación de Resultados en Fase Eliminatoria

## 1. Resumen
Actualizar la lógica en `useBracketData.ts` para que el ganador de un partido en la fase eliminatoria se calcule siempre dinámicamente en base a los equipos actuales (`homeTeam` y `awayTeam`) y los goles almacenados. Esto evitará que la llave quede bloqueada con códigos de países "viejos" cuando se cambia el resultado de una ronda previa.

## 2. Análisis del Estado Actual
- Cuando se ingresa un resultado en un partido eliminatorio (ej. 16avos), `KnockoutMatchCard.tsx` guarda el código del equipo ganador (ej. `'ARG'`) en el estado global de zustand (`knockout.matches[id].winner`).
- Si posteriormente el usuario cambia el resultado de ese partido en 16avos para que gane el otro equipo (ej. `'MEX'`), el equipo `'MEX'` avanza a octavos.
- Al procesar octavos, si ese partido ya tenía un resultado guardado previamente, `useBracketData.ts` detecta que `storedResult.winner` existe (que todavía es `'ARG'`) y lo usa directamente en lugar de recalcularlo.
- Como resultado, el partido de octavos declara a `'ARG'` como ganador (aunque ya no esté jugando ese partido), y propaga `'ARG'` a cuartos de final, rompiendo la cascada de actualizaciones ("sigue con el resultado viejo").
- Curiosamente, si se recarga la página, el problema se soluciona solo, ya que el serializador de URL (`serializer.ts`) no guarda el campo `winner` y fuerza a `useBracketData` a recalcularlo dinámicamente (la rehidratación funciona bien, pero el estado en memoria falla).

## 3. Cambios Propuestos
**Archivo a modificar:** `g:\Prode2026\src\hooks\useBracketData.ts`

- **Qué hacer:** Modificar el bucle `fullBracket.forEach` en la sección donde se aplica el `storedResult`.
- **Cómo hacerlo:** 
  Cambiar la condición `if (!storedResult.winner)` para priorizar SIEMPRE el cálculo basado en los goles (`homeGoals` y `awayGoals`) y los penales, usando los equipos **actuales** (`match.homeTeam` y `match.awayTeam`).
  
  *Lógica propuesta:*
  ```typescript
  if (storedResult.homeGoals !== undefined && storedResult.awayGoals !== undefined) {
      if (storedResult.homeGoals > storedResult.awayGoals) {
          match.winner = match.homeTeam || undefined;
      } else if (storedResult.awayGoals > storedResult.homeGoals) {
          match.winner = match.awayTeam || undefined;
      } else if (storedResult.isPenalty && storedResult.penaltyWinner) {
          match.winner = storedResult.penaltyWinner === 'home' ? (match.homeTeam || undefined) : (match.awayTeam || undefined);
      }
  } else if (storedResult.winner) {
      // Fallback estricto: solo usar el winner guardado si realmente está jugando este partido
      if (storedResult.winner === match.homeTeam || storedResult.winner === match.awayTeam) {
          match.winner = storedResult.winner;
      }
  }
  ```

## 4. Suposiciones y Decisiones
- **Decisión:** Al cambiar los equipos que llegan a una ronda avanzada, si esa ronda ya tenía un resultado numérico ingresado (ej. 2-1 a favor del local), ese resultado se mantiene y se aplica al **nuevo equipo local**. Esto mantiene consistencia con la lógica de hidratación actual de la URL y evita borrar resultados ingresados por el usuario.

## 5. Pasos de Verificación
1. Abrir la aplicación en la página de Fase Eliminatoria.
2. Ingresar resultados para que un equipo avance desde 16avos hasta Semifinales.
3. Volver al partido de 16avos de ese equipo y cambiar el resultado para que avance su rival.
4. Verificar visualmente que el nuevo equipo reemplaza al viejo en Octavos, y que el resultado que ya estaba en Octavos ahora da por ganador al nuevo equipo, propagándolo correctamente a Cuartos y Semifinales.