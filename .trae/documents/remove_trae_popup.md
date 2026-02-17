# Plan para eliminar el popup de Trae

## Objetivo
Eliminar el badge/popup de Trae que aparece en la aplicación.

## Análisis
El "popup" es generado por un plugin de Vite llamado `vite-plugin-trae-solo-badge`, configurado en `vite.config.ts`.

## Pasos

1.  **Editar `vite.config.ts`**:
    - Eliminar la importación `import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';`.
    - Eliminar la configuración del plugin `traeBadgePlugin({ ... })` dentro del array `plugins`.

2.  **Verificación**:
    - Verificar que el servidor de desarrollo se reinicie correctamente sin errores.
    - Confirmar visualmente que el badge ha desaparecido.
