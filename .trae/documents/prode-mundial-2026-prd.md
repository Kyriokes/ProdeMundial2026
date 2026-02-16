## 1. Product Overview
Aplicación web de pronósticos (Prode) para el Mundial 2026. Permite a los usuarios simular torneos completos desde la fase de grupos hasta la final, con persistencia de estado mediante URL compartible.

Permite crear y compartir pronósticos del Mundial 2026 con lógica de desempate implementada y estado persistente en URLs.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Usuario Anónimo | Sin registro requerido | Crear pronósticos, compartir URLs, visualizar resultados |

### 2.2 Feature Module
Nuestra aplicación Prode Mundial 2026 consiste en las siguientes páginas principales con rutas dinámicas que persisten el estado:
1. **Página de Clasificatorios**: elegir ganadores de rutas UEFA y llaves intercontinentales.
2. **Página de Fase de Grupos**: visualizar grupos, ingresar resultados de partidos, ver tabla de posiciones.
3. **Página de Fase Eliminatoria**: visualizar bracket, ingresar resultados de knockout, ver avance del torneo.

Las rutas codifican el estado progresivamente, permitiendo compartir resultados parciales mediante URLs.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Selección de Clasificados | Selector de Rutas UEFA | Elegir 1 ganador por cada ruta (A, B, C, D) con validación obligatoria. |
| Selección de Clasificados | Selector de Llaves Intercontinentales | Elegir 1 ganador por cada llave (A, B) con validación obligatoria. |
| Selección de Clasificados | Botón Continuar | Habilitar solo cuando se completan los 6 cupos pendientes. |
| Fase de Grupos | Visualización de Grupos | Mostrar los 12 grupos con equipos clasificados, reemplazando placeholders por ganadores seleccionados. |
| Fase de Grupos | Ingreso de Resultados | Permitir ingresar goles para equipo local y visitante en cada partido. |
| Fase de Grupos | Tabla de Posiciones | Calcular y mostrar posiciones con criterios de desempate: puntos, diferencia de gol, goles a favor, fair play, ranking FIFA. |
| Fase de Grupos | Clasificados a Dieciseisavos | Identificar automáticamente a los 32 equipos clasificados (2 primeros + 8 mejores terceros). |
| Fase Eliminatoria | Bracket Visual | Mostrar el árbol de eliminación con emparejamientos según reglas específicas. |
| Fase Eliminatoria | Resultados Knockout | Permitir elegir ganador por penales si hay empate en tiempo regular. |
| Fase Eliminatoria | Avance del Torneo | Actualizar bracket automáticamente según resultados ingresados. |
| Compartir | Generar URL | Codificar estado en la ruta URL automáticamente al avanzar. |
| Cargar | Leer URL | Decodificar estado desde la ruta URL al acceder a cualquier etapa. |

## 3. Core Process
**Flujo Principal del Usuario:**
1. Usuario accede a `/` (redirige a `/qualifiers`)
2. Selecciona los 6 clasificados pendientes en `/qualifiers`
3. URL se actualiza a `/qualifiers/{codificacion}` al completar
4. Visualiza los 12 grupos completos en `/groups/{codificacion}`
5. Ingresa resultados de partidos de fase de grupos
6. URL se actualiza a `/groups/{codificacion-qualifiers}-{codificacion-groups}` al avanzar
7. Sistema calcula automáticamente posiciones y clasificados
8. Visualiza bracket en `/knockout/{codificacion-qualifiers}-{codificacion-groups}-{codificacion-knockout}`
9. Ingresa resultados de fase eliminatoria
10. Sistema determina campeón y actualiza URL final

**Ejemplo de URLs progresivas:**
- `/qualifiers` → estado inicial vacío
- `/qualifiers/a1b2c3d4` → con clasificatorios completos
- `/groups/a1b2c3d4-e5f6g7` → con grupos y resultados parciales
- `/knockout/a1b2c3d4-e5f6g7-h8i9j0` → con eliminatoria completa

```mermaid
graph TD
  A[/] --> B[/qualifiers]
  B --> C{Validar 6 selecciones}
  C -->|Completo| D[/qualifiers/{code}]
  C -->|Incompleto| B
  D --> E[/groups/{qualifierCode}]
  E --> F[Ingresar Resultados Grupos]
  F --> G[Calcular Posiciones]
  G --> H[/groups/{qualifierCode}-{groupCode}]
  H --> I[/knockout/{qualifierCode}-{groupCode}]
  I --> J[Ingresar Resultados Knockout]
  J --> K[/knockout/{qualifierCode}-{groupCode}-{knockoutCode}]
  K --> L[Determinar Campeón]
  
  subgraph "URLs con Estado"
    D
    H
    K
  end
```

## 4. User Interface Design

### 4.1 Design Style
- **Colores primarios**: Azul FIFA (#0066CC), Blanco (#FFFFFF), Verde campo (#2E7D32)
- **Colores secundarios**: Gris claro (#F5F5F5), Rojo (#D32F2F), Amarillo (#FFC107)
- **Estilo de botones**: Rounded corners, sombra sutil, hover effects
- **Tipografía**: Font sans-serif moderna (Inter o similar), tamaños 14-18px para contenido
- **Layout**: Card-based design con navegación por pasos
- **Iconos**: Emojis de banderas de países, trofeos, balones

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Selección Clasificados | Selector Rutas | Cards horizontales por ruta, radio buttons para selección, banderas de países participantes. |
| Selección Clasificados | Selector Llaves | Cards verticales por llave, dropdown o radio buttons, validación visual. |
| Fase de Grupos | Grupo Card | Grid 2x2 mostrando equipos, escudos/banderas, mini tabla de posiciones actualizable. |
| Fase de Grupos | Partido Row | Input fields para goles local/visitante, validación numérica, botón guardar. |
| Fase Eliminatoria | Bracket | Visualización en árbol horizontal, conectores entre fases, placeholders para equipos. |
| Fase Eliminatoria | Partido Knockout | Inputs de goles, checkbox para penales, selector de ganador por penales si aplica. |
| General | Compartir | Botón prominente con icono de compartir, feedback visual al copiar URL. |

### 4.3 Responsiveness
- **Desktop-first**: Diseño optimizado para pantallas grandes (1200px+)
- **Mobile-adaptive**: Adaptación responsive para tablets y móviles
- **Touch interaction**: Botones grandes, espaciado adecuado para dispositivos táctiles

### 4.4 3D Scene Guidance
No aplica - aplicación 2D con enfoque en datos y simulación.