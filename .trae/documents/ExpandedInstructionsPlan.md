# Plan: Ampliar Instrucciones de Bienvenida

## Objetivo
Mejorar el modal de instrucciones (`InstructionsModal.tsx`) para incluir explicaciones detalladas sobre funcionalidades adicionales solicitadas por el usuario.

## Nuevas Funcionalidades a Documentar
1.  **Aleatoriedad:** Explicar el botón global de randomizar torneo y el dado para randomizar partido a partido.
2.  **Gestión de Datos:** Explicar el botón de borrar/resetear torneo.
3.  **Compartir:** Explicar la funcionalidad de compartir resultados.
4.  **Navegación en Grupos:** Explicar el uso de las tarjetas en fase de grupos (probablemente se refiere a cómo se ven o interactúan).
5.  **Soporte:** Mencionar la opción de "Invitar un café".

## Estrategia de Diseño
Dado que hay mucha información nueva, dividiré el contenido en dos pestañas o secciones dentro del modal, o simplemente ampliaré la lista con un diseño más compacto si es necesario. Sin embargo, una lista scrolleable dentro del modal actual parece lo más limpio.

### Estructura de Contenido Propuesta

Mantener los 3 pasos principales al inicio, y luego agregar una sección de "Herramientas y Tips":

**Sección 1: Flujo Principal (Ya existe)**
1.  Clasificación
2.  Fase de Grupos
3.  Fase Eliminatoria

**Sección 2: Funcionalidades (Nuevo)**
*   **Resultados Aleatorios:** "Usa el dado general para simular todo el torneo o el dado en cada partido para un resultado sorpresa."
*   **Gestión:** "Borra todo para empezar de cero o comparte tu predicción con amigos."
*   **Apoyo:** "Si te gusta el proyecto, puedes invitarme un cafecito desde el pie de página."

## Pasos de Implementación

1.  **Modificar `src/components/InstructionsModal.tsx`**:
    *   Importar nuevos iconos de `lucide-react`: `Dices`, `Eraser`, `Share2`, `Coffee`, `LayoutGrid` (para tarjetas).
    *   Actualizar el array `steps` o crear un segundo array `features` para las nuevas instrucciones.
    *   Ajustar el renderizado para acomodar la nueva información (posiblemente un contenedor con scroll si se hace muy largo, o dividir en dos columnas en pantallas grandes).

## Detalles de UX
*   Asegurar que el modal no exceda la altura de la pantalla en móviles (agregar `max-h-[90vh]` y `overflow-y-auto` al contenedor del cuerpo).

## Verificación
*   Abrir el modal y verificar que todos los puntos solicitados estén presentes y legibles.
