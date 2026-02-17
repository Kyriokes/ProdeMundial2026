# Plan para Implementar Botón "Randomizar Todo"

El objetivo es añadir un botón en la barra de navegación que permita rellenar automáticamente todos los resultados del torneo (Clasificación, Fase de Grupos y Eliminatorias) con valores aleatorios.

## 1. Crear lógica de Randomización Completa

Implementar una función `randomizeTournament` en `src/utils/randomizer.ts` (o `src/utils/fullRandomizer.ts`) que realice la simulación completa del torneo.

### Pasos de la simulación:
1.  **Clasificación (Qualifiers)**:
    *   Iterar sobre `uefaPaths` y `intercontinentalKeys`.
    *   Seleccionar aleatoriamente un equipo ganador para cada ruta/llave.
    *   Generar el estado `qualifiers`.

2.  **Fase de Grupos**:
    *   Utilizar `initialGroups` y los ganadores de la clasificación para reconstruir los grupos completos.
    *   Generar todos los partidos de grupo usando `generateGroupMatches`.
    *   Para cada partido, generar un resultado aleatorio usando `generateMatchResult`.
    *   Generar el estado `groups` con todos los resultados.

3.  **Cálculo de Posiciones**:
    *   Usar `calculateGroupStandings` y `getQualifiedTeams` con los resultados generados para determinar los clasificados a octavos (1º, 2º y mejores 3º).

4.  **Fase Eliminatoria (Knockout)**:
    *   Obtener los cruces de 16avos usando `getKnockoutMatchups`.
    *   Generar la estructura completa del bracket usando `generateBracket`.
    *   Simular ronda por ronda (16avos -> 8avos -> Cuartos -> Semis -> Final):
        *   Para cada partido, si los equipos están definidos, generar un resultado usando `generateMatchResult`.
        *   Determinar el ganador.
        *   Propagar el ganador a la siguiente ronda (actualizando el `homeTeam` o `awayTeam` del siguiente partido en la simulación local).
        *   Guardar el resultado en el objeto de estado `knockout`.

5.  **Retorno**:
    *   La función devolverá un objeto `TournamentState` completo (o parcial) listo para ser consumido por el store.

## 2. Actualizar la Interfaz de Usuario (App.tsx)

1.  **Añadir Botón**:
    *   En `src/App.tsx`, importar el icono `Dices` de `lucide-react`.
    *   Añadir un botón con este icono en la barra de navegación, a la derecha del enlace "Eliminatorias".

2.  **Manejador de Eventos**:
    *   Crear una función `handleRandomize`.
    *   Mostrar una alerta de confirmación (`window.confirm`): "¿Estás seguro? Se perderán todos los cambios actuales."
    *   Si el usuario confirma:
        *   Llamar a `randomizeTournament`.
        *   Llamar a `setFullState` del store `useTournamentStore` con los nuevos datos.
        *   Opcional: Redirigir a la página de Eliminatorias o mostrar una notificación de éxito.

## 3. Archivos a Modificar/Crear

*   `src/utils/randomizer.ts`: Añadir la función `randomizeTournament` y las importaciones necesarias.
*   `src/App.tsx`: Añadir el botón y la lógica de llamada.
