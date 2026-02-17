# Plan de Implementación: Vista Móvil para Fase Eliminatoria

## Objetivo
Crear una vista optimizada para dispositivos móviles en la página de Fase Eliminatoria (`KnockoutPage`), sin alterar la vista de escritorio existente.

## Análisis
La vista actual de `KnockoutPage` utiliza un diseño horizontal ancho que no se adapta bien a pantallas pequeñas. Se requiere una solución que detecte el tamaño de la pantalla y muestre una interfaz alternativa en móviles.

## Estrategia
1.  **Nuevo Componente Móvil**: Crear `src/components/MobileKnockoutView.tsx` para manejar la vista móvil.
    -   Utilizará un sistema de pestañas (tabs) para navegar entre las rondas (16avos, 8avos, Cuartos, Semis, Final).
    -   Mostrará los partidos de la ronda seleccionada en una lista vertical.
    -   Reutilizará el componente `KnockoutMatchCard`.

2.  **Modificación de `KnockoutPage`**:
    -   Envolver el contenido actual en un contenedor que solo sea visible en pantallas grandes (`hidden lg:flex`).
    -   Agregar el nuevo componente `MobileKnockoutView` en un contenedor visible solo en pantallas pequeñas (`lg:hidden`).
    -   Pasar los datos de `rounds` y la función `handleUpdate` al componente móvil.

## Pasos de Implementación

1.  **Crear `src/components/MobileKnockoutView.tsx`**:
    -   Props: `rounds` (objeto con los partidos por ronda), `handleUpdate` (función), `champion` (datos del campeón si existe).
    -   Estado: `activeRound` (string) para controlar la pestaña activa.
    -   Renderizado:
        -   Barra de pestañas horizontal con scroll si es necesario.
        -   Contenedor de lista de partidos.
        -   Sección especial para el Campeón en la pestaña "Final".

2.  **Actualizar `src/pages/KnockoutPage.tsx`**:
    -   Importar `MobileKnockoutView`.
    -   Implementar la lógica de visualización condicional usando clases de Tailwind (`lg:hidden` y `hidden lg:flex`).

## Verificación
-   Verificar que en escritorio (`lg` breakpoint, usualmente >= 1024px) la vista permanezca idéntica.
-   Verificar que en móvil se vea la nueva interfaz con pestañas.
-   Probar la navegación entre rondas en móvil.
-   Probar la actualización de resultados en móvil.
