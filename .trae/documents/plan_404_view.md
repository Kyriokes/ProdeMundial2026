# Plan: Implementación de Vista 404

### Resumen
Implementar una vista de error 404 ("Página no encontrada") para manejar cualquier URL que no coincida con las rutas válidas de la aplicación, e incluir un botón para regresar al inicio del simulador.

### Análisis del Estado Actual
- En `App.tsx`, las rutas están definidas para `/`, `/groups/*`, `/knockout/*` y `/stats`. Si se ingresa una ruta inválida como `/cualquier-cosa`, no hay ninguna ruta `*` (catch-all) que lo maneje, resultando en una pantalla sin contenido renderizado en el `<main>`.
- En `RouteSync.tsx`, el sincronizador de estado lee la primera parte de la URL (`currentPath.split('/')[1]`) y asume que es una etapa válida. Si el usuario ingresa `/error`, `RouteSync` intenta sincronizar el estado sobre la ruta `/error`, lo cual puede provocar un bucle o una URL extraña como `/error/codigo-de-estado`.

### Cambios Propuestos
1. **Crear `src/pages/NotFoundPage.tsx`**:
   - Desarrollar un componente con un diseño coherente con la aplicación (soportando modo claro/oscuro con Tailwind CSS).
   - Incluir un icono, un mensaje amigable (ej. "Error 404 - Página no encontrada") y un botón destacado que diga "Volver al torneo" y redirija a `/groups`.

2. **Actualizar `src/App.tsx`**:
   - Importar `NotFoundPage`.
   - Agregar `<Route path="*" element={<NotFoundPage />} />` al final del componente `<Routes>` para atrapar cualquier URL no definida.

3. **Actualizar `src/components/RouteSync.tsx`**:
   - Agregar una lista de etapas válidas: `const validStages = ['groups', 'knockout', 'stats'];`.
   - Validar que `currentStage` sea una de las rutas permitidas.
   - Si no es una ruta válida, hacer un `return;` temprano en el `useEffect` que sincroniza el estado hacia la URL. Esto evitará que la aplicación intente anexar el código de estado a la URL errónea y la dejará limpia para que la vea el router.

### Suposiciones y Decisiones
- El botón de "Volver al torneo" llevará al usuario a `/groups`, ya que es el nuevo punto de partida oficial del torneo (habiéndose quitado la fase de clasificación).
- Se utilizarán iconos de `lucide-react` (ej. `AlertTriangle` o `MapPinOff`) para hacer la vista 404 visualmente atractiva.

### Pasos de Verificación
1. Ingresar a una URL inventada como `/una-url-falsa`.
2. Comprobar que se muestra la vista 404.
3. Comprobar que la URL en el navegador se mantiene como `/una-url-falsa` y no se le agregan códigos serializados.
4. Hacer clic en "Volver al torneo" y verificar que redirige correctamente a la vista de Grupos (`/groups`).
5. Navegar normalmente por las demás etapas (Grupos -> Eliminatorias -> Tabla) para asegurar que el guardado de estado (`RouteSync`) sigue funcionando perfectamente para las rutas válidas.