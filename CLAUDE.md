# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (HMR en http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Preview del build de producción
npm run preview

# Type-check sin emitir archivos
npx tsc --noEmit

# Lint
npm run lint
```

No hay tests automatizados configurados en el proyecto aún. La validación de cálculos astronómicos se hace comparando contra NASA JPL Horizons o USNO vía console.log durante desarrollo.

---

# Visualizador Orbital Terrestre
> Archivo de contexto para Claude Code — leer antes de cualquier tarea

---

## Objetivo del proyecto

Aplicación web **mobile-first** que visualiza gráficamente:
- La posición de la Tierra en su órbita elíptica (perihelio y afelio)
- La inclinación del eje terrestre (23.44°) y su efecto según la época del año
- Cómo estos fenómenos afectan al usuario según su ubicación geográfica real
- Simulación en el tiempo (pasado y futuro)

---

## Requerimientos clave

### Mobile-first (prioridad máxima)
- Diseño pensado primero para pantallas de 375px–430px (iPhone/Android estándar)
- Touch gestures: pinch-zoom en la órbita, swipe para cambiar fecha/vista
- Sin hover-only interactions — toda interacción debe funcionar con tap
- Canvas/WebGL optimizado para GPU móvil (evitar overdraw excesivo)
- Carga rápida: astronomy-engine corre localmente, sin llamadas de red bloqueantes
- Soporte PWA (manifest + service worker) para instalación en pantalla de inicio
- Breakpoints: mobile 375px → tablet 768px → desktop 1024px+

### Funcionalidad principal
- Mostrar la órbita elíptica de la Tierra con el Sol en el foco correcto
- Marcar y animar perihelio (~3 enero) y afelio (~4 julio) cada año
- Visualizar el eje terrestre inclinado 23.44° con su orientación correcta
- Punto del usuario marcado en el globo según su latitud/longitud
- Control de tiempo: slider o rueda para avanzar/retroceder días/meses/años
- Panel de datos: distancia actual al Sol, velocidad orbital, declinación solar

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework UI | React 18 + Vite | Ecosistema maduro, HMR rápido |
| Lenguaje | TypeScript | Tipado para cálculos astronómicos críticos |
| Motor orbital | astronomy-engine 2.x | VSOP87 + NOVAS, offline, MIT, ±1 arcmin |
| Gráficos 3D | Three.js r158+ | WebGL, soporte móvil, amplia comunidad |
| Estilos | Tailwind CSS 3 | Utility-first, mobile-first por defecto |
| Estado global | Zustand | Liviano, sin boilerplate |
| Build | Vite 5 | Fast HMR, tree-shaking, PWA plugin |

---

## Servicios externos gratuitos

### APIs sin API key
| Servicio | URL | Uso |
|----------|-----|-----|
| NASA JPL Horizons | `https://ssd-api.jpl.nasa.gov/horizons.api` | Efemérides de referencia y validación |
| USNO Astronomical API | `https://aa.usno.navy.mil/data/api` | Posición solar, datos de navegación celeste |
| ip-api.com | `http://ip-api.com/json/` | Geolocalización por IP (fallback, no comercial) |

### APIs con token gratuito
| Servicio | URL | Uso |
|----------|-----|-----|
| Solar System OpenData | `https://api.le-systeme-solaire.net` | Parámetros orbitales: perihelio, afelio, excentricidad |

### APIs nativas del navegador (sin servicios externos)
```typescript
// Geolocalización primaria
navigator.geolocation.getCurrentPosition(callback, errorCallback, {
  enableHighAccuracy: true,
  timeout: 10000
});

// Zona horaria
Intl.DateTimeFormat().resolvedOptions().timeZone;

// Fecha/hora UTC
new Date().toISOString();
```

---

## Cálculos astronómicos clave

### Con astronomy-engine (local, sin red)
```typescript
import * as Astronomy from 'astronomy-engine';

// Posición heliocéntrica de la Tierra
const pos = Astronomy.HelioVector('Earth', date);

// Distancia al Sol en AU
const dist = Astronomy.HelioDistance('Earth', date);

// Declinación solar (para efecto en latitud del usuario)
const sun = Astronomy.SunPosition(date);
const declination = sun.dec; // grados

// Búsqueda de perihelio/afelio del año
const apsis = Astronomy.SearchLunarApsis(date); // misma lógica para Tierra

// Tiempo Juliano (base de todos los cálculos)
const jd = Astronomy.MakeTime(date).tt;

// Oblicuidad del eje terrestre en la fecha dada
const obliquity = Astronomy.AxialTilt(date); // ~23.44°
```

### Constantes orbitales de la Tierra
```typescript
const EARTH_ORBIT = {
  semiMajorAxis: 149_597_870.7,   // km (1 AU)
  eccentricity: 0.0167086,
  perihelionDist: 147_095_000,    // km aprox.
  aphelionDist: 152_100_000,      // km aprox.
  axialTilt: 23.4392811,          // grados
  orbitalPeriod: 365.25636,       // días
};
```

---

## Arquitectura del proyecto

```
orbital-viewer/
├── public/
│   ├── manifest.json              # PWA manifest
│   └── sw.js                      # Service worker (cache offline)
├── src/
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Root + router
│   │
│   ├── core/                      # Lógica astronómica pura (sin UI)
│   │   ├── orbital/
│   │   │   ├── earthOrbit.ts      # Cálculos posición orbital
│   │   │   ├── apsides.ts         # Perihelio/afelio del año
│   │   │   └── axialTilt.ts       # Inclinación y declinación solar
│   │   ├── time/
│   │   │   ├── julianDate.ts      # Conversiones JD ↔ fecha civil
│   │   │   └── timeTravel.ts      # Lógica del slider temporal
│   │   └── location/
│   │       ├── geolocate.ts       # Browser Geolocation API
│   │       └── ipFallback.ts      # Fallback ip-api.com
│   │
│   ├── services/                  # Llamadas a APIs externas (opcionales)
│   │   ├── horizonsApi.ts         # NASA JPL Horizons
│   │   ├── usnoApi.ts             # USNO Astronomical API
│   │   └── solarSystemApi.ts      # Solar System OpenData
│   │
│   ├── store/                     # Estado global (Zustand)
│   │   ├── useTimeStore.ts        # Fecha/hora de simulación
│   │   ├── useLocationStore.ts    # Lat/lon del usuario
│   │   └── useOrbitStore.ts       # Datos orbitales calculados
│   │
│   ├── components/
│   │   ├── orbit/
│   │   │   ├── OrbitCanvas.tsx    # Three.js — órbita elíptica 2D/3D
│   │   │   ├── EarthGlobe.tsx     # Globo con eje inclinado
│   │   │   └── SunMarker.tsx      # Sol en el foco de la elipse
│   │   ├── controls/
│   │   │   ├── TimeSlider.tsx     # Control temporal touch-friendly
│   │   │   ├── SpeedControl.tsx   # Velocidad de animación
│   │   │   └── ViewToggle.tsx     # Vista 2D / 3D / globo
│   │   ├── panels/
│   │   │   ├── DataPanel.tsx      # Distancia, velocidad, declinación
│   │   │   ├── ApsisPanel.tsx     # Próximo perihelio/afelio
│   │   │   └── LocationPanel.tsx  # Info de la ubicación del usuario
│   │   └── ui/
│   │       ├── BottomSheet.tsx    # Panel deslizable (patrón móvil)
│   │       └── LoadingScreen.tsx
│   │
│   ├── hooks/
│   │   ├── useGeolocation.ts      # Obtener ubicación con fallback
│   │   ├── useOrbitAnimation.ts   # requestAnimationFrame loop
│   │   └── useAstroData.ts        # Calcular datos para fecha dada
│   │
│   └── types/
│       ├── astronomy.ts           # Tipos para datos orbitales
│       └── location.ts            # Tipos para geolocalización
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── CLAUDE.md                      # ← este archivo
```

---

## Patrones mobile-first a seguir

### Layout
```tsx
// Siempre mobile primero, luego escalar hacia arriba
<div className="
  flex flex-col h-screen          // móvil: columna
  md:flex-row                     // tablet+: fila
">
  <OrbitCanvas className="
    h-[60vw] min-h-[300px]        // móvil: 60% del ancho
    md:flex-1 md:h-full           // desktop: ocupa todo
  " />
  <DataPanel className="
    h-auto px-4 py-3              // móvil: panel inferior compacto
    md:w-80 md:h-full md:px-6     // desktop: sidebar
  " />
</div>
```

### Touch interactions en Three.js
```typescript
// Usar touch events, no mouse events
canvas.addEventListener('touchstart', onTouchStart, { passive: true });
canvas.addEventListener('touchmove', onTouchMove, { passive: false });
// Pinch-zoom para acercar/alejar la órbita
// Swipe horizontal para avanzar tiempo
```

### Bottom Sheet (patrón móvil estándar)
- Panel de datos oculto por defecto en móvil
- Se desliza hacia arriba con swipe o tap en handle
- Overlay semitransparente al abrirse
- En desktop: sidebar fijo visible siempre

---

## Contexto del desarrollador

- **Perfil**: desarrollador .NET/C# con experiencia en arquitecturas en capas
- **Proyectos activos**: migración AKDEMIC (.NET 3.1 → .NET 10, Clean Architecture)
- **Experiencia relevante**: Repository pattern, Unit of Work, separación de capas
  - Mapear: `core/` ≈ Domain layer, `services/` ≈ Infrastructure, `store/` ≈ Application
- **Preferencias**: planificación detallada antes de implementar, análisis de riesgos
- **Entorno**: Ubuntu 22.04, VS Code + Claude Code, Node.js disponible

---

## Orden de construcción sugerido

1. **Setup** — Vite + React + TypeScript + Tailwind + astronomy-engine
2. **Core orbital** — `earthOrbit.ts`, `apsides.ts`, pruebas con console.log
3. **Geolocalización** — `geolocate.ts` + fallback IP
4. **Canvas básico** — órbita elíptica 2D en Three.js, Sol + Tierra posicionados
5. **Controles tiempo** — slider touch-friendly, animación básica
6. **Inclinación axial** — globo 3D con eje visible y declinación solar
7. **Panel de datos** — distancia, velocidad, próximo perihelio/afelio
8. **PWA** — manifest, service worker, íconos
9. **Pulido mobile** — gestos, bottom sheet, performance en móvil
10. **APIs externas** — integrar Horizons/USNO como datos de validación (opcional)

---

## Notas importantes

- `astronomy-engine` corre **100% offline** en el navegador — no hay llamadas de red para los cálculos principales
- JPL Horizons y USNO son para **validación y datos complementarios**, no son bloqueantes
- La app debe funcionar sin ubicación (usar coordenadas por defecto: Lima, Perú -12.04°, -77.03°)
- Todos los ángulos en radianes internamente; convertir a grados solo para mostrar al usuario
- El perihelio 2026 ocurre el 3 de enero a las 12:16 UTC
