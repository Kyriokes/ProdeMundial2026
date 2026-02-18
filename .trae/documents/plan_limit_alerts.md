# Plan para limitar las alertas visibles

El usuario quiere que las alertas "se pisen", es decir, que no se acumulen y que solo se muestre una a la vez.

Para lograr esto, modificaremos la configuración del componente `Toaster` de la librería `sonner` en el archivo `src/App.tsx`.

## Pasos

1.  **Modificar `src/App.tsx`**:
    *   Ubicar el componente `<Toaster />`.
    *   Agregar la propiedad `visibleToasts={1}`.
    *   Esto asegurará que solo se renderice una notificación a la vez en la pantalla, haciendo que las nuevas reemplacen visualmente a las anteriores o que la lista no crezca.

## Código a modificar

```tsx
// src/App.tsx

// Antes
<Toaster richColors position="top-center" />

// Después
<Toaster richColors position="top-center" visibleToasts={1} />
```

Esto es un cambio simple y directo que cumple con el requerimiento.
