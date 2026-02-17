# Plan de Implementación: Menú de Navegación Móvil (Hamburguesa)

## Problema
Actualmente, la barra de navegación oculta los enlaces principales ("Clasificación", "Grupos", "Eliminatorias", "Tabla") y los botones de acción (Randomizar, Borrar) en dispositivos móviles debido a la clase `hidden md:flex`.

## Solución Propuesta
Implementar un menú "hamburguesa" que sea visible solo en dispositivos móviles. Al hacer clic, desplegará un menú con todas las opciones de navegación y acciones disponibles.

## Pasos de Implementación

1.  **Modificar `src/App.tsx`**:
    *   Importar los iconos `Menu` y `X` de `lucide-react`.
    *   Agregar un estado `isMenuOpen` en el componente `Layout` para controlar la visibilidad del menú móvil.
    *   Agregar un botón de alternancia (toggle) en la barra de navegación principal que solo sea visible en móviles (`md:hidden`).
    *   Crear un contenedor para el menú móvil que se muestre cuando `isMenuOpen` sea `true`.
    *   Este menú móvil incluirá:
        *   Los enlaces de navegación (Clasificación, Grupos, Eliminatorias, Tabla) con estilos adaptados para móvil (bloque completo, mayor espaciado).
        *   Los botones de acción (Randomizar, Borrar).
    *   Asegurar que el menú se cierre automáticamente al hacer clic en un enlace.

## Detalles Técnicos

### Componente Layout (App.tsx)
```tsx
// Nuevo estado
const [isMenuOpen, setIsMenuOpen] = useState(false);

// Función para cerrar menú al navegar
const closeMenu = () => setIsMenuOpen(false);

// Estructura del Navbar
<nav>
  <div className="container ...">
    {/* Logo ... */}
    
    {/* Botón Hamburguesa (Visible solo en móvil) */}
    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
      {isMenuOpen ? <X /> : <Menu />}
    </button>

    {/* Navegación Desktop (Existente - hidden md:flex) */}
    {/* ... */}
  </div>

  {/* Menú Móvil (Nuevo) */}
  {isMenuOpen && (
    <div className="md:hidden ...">
       {/* Enlaces y Botones */}
    </div>
  )}
</nav>
```
