import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useOrbitStore } from '../../store/useOrbitStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useTimeStore } from '../../store/useTimeStore';
import { EARTH_ORBIT } from '../../core/orbital/earthOrbit';
import { getAxialTiltData } from '../../core/orbital/axialTilt';

const SCALE = 3.0; // AU → Three.js units
const ORBIT_SEGMENTS = 512;
const SUN_RADIUS = 0.22;
const EARTH_RADIUS = 0.08;

interface OrbitCanvasProps {
  className?: string;
}

export function OrbitCanvas({ className }: OrbitCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const earthGlowRef = useRef<THREE.Mesh | null>(null);
  const axisMeshRef = useRef<THREE.Mesh | null>(null);
  const rafRef = useRef<number>(0);

  const orbitalData = useOrbitStore((s) => s.orbitalData);
  const simulationDate = useTimeStore((s) => s.simulationDate);

  const buildScene = useCallback((width: number, height: number) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020817');
    sceneRef.current = scene;

    // --- Stars ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 120;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, sizeAttenuation: true })));

    // --- Orbit ellipse ---
    const a = SCALE; // semi-major = 1 AU * SCALE
    const e = EARTH_ORBIT.eccentricity;
    const b = a * Math.sqrt(1 - e * e);
    const c = a * e; // foco offset

    const orbitPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= ORBIT_SEGMENTS; i++) {
      const theta = (i / ORBIT_SEGMENTS) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(theta) * a - c, 0, Math.sin(theta) * b));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    scene.add(new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x1e3a5f })));

    // --- Ecliptic grid (sutil) ---
    const gridHelper = new THREE.GridHelper(SCALE * 3, 12, 0x0f2040, 0x0f2040);
    scene.add(gridHelper);

    // --- Sun ---
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-c, 0, 0);

    // Punto de luz solar
    const sunLight = new THREE.PointLight(0xfff4e0, 3.0, 30, 1.5);
    sunGroup.add(sunLight);

    // Esfera del Sol
    const sunGeo = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    sunGroup.add(new THREE.Mesh(sunGeo, sunMat));

    // Corona solar (múltiples capas)
    for (const [r, o] of [[0.32, 0.15], [0.44, 0.07], [0.60, 0.03]] as [number, number][]) {
      const g = new THREE.SphereGeometry(r, 32, 32);
      const m = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: o, side: THREE.BackSide });
      sunGroup.add(new THREE.Mesh(g, m));
    }

    // Label Sol
    sunGroup.add(makeLabel('Sol', '#fbbf24', 0, -SUN_RADIUS - 0.18, 0));
    scene.add(sunGroup);

    // Luz ambiental tenue (espacio profundo)
    scene.add(new THREE.AmbientLight(0x112244, 0.5));

    // --- Earth group ---
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Esfera Tierra con textura procedural
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 32, 32);
    const earthCanvas = makeEarthTexture();
    const earthTex = new THREE.CanvasTexture(earthCanvas);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      emissive: new THREE.Color(0x0a1f3a),
      emissiveIntensity: 0.1,
      shininess: 10,
    });
    earthGroup.add(new THREE.Mesh(earthGeo, earthMat));

    // Atmósfera
    const atmGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.08, 32, 32);
    const atmMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.12, side: THREE.BackSide });
    const atmMesh = new THREE.Mesh(atmGeo, atmMat);
    earthGroup.add(atmMesh);
    earthGlowRef.current = atmMesh;

    // Eje axial de la Tierra (cilindro delgado naranja)
    const axisLen = EARTH_RADIUS * 2.8;
    const axisGeo = new THREE.CylinderGeometry(0.003, 0.003, axisLen * 2, 8);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const axisMesh = new THREE.Mesh(axisGeo, axisMat);
    earthGroup.add(axisMesh);
    axisMeshRef.current = axisMesh;

    // Puntas del eje (conos)
    for (const y of [axisLen, -axisLen]) {
      const coneGeo = new THREE.ConeGeometry(0.008, 0.025, 8);
      const coneMesh = new THREE.Mesh(coneGeo, axisMat);
      coneMesh.position.y = y;
      if (y < 0) coneMesh.rotation.z = Math.PI;
      earthGroup.add(coneMesh);
    }

    // Punto del Ecuador (anillo fino)
    const equatorGeo = new THREE.TorusGeometry(EARTH_RADIUS * 1.01, 0.003, 8, 64);
    const equatorMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.5 });
    earthGroup.add(new THREE.Mesh(equatorGeo, equatorMat));

    // Label Tierra
    earthGroup.add(makeLabel('Tierra', '#60a5fa', 0, EARTH_RADIUS + 0.12, 0));

    // Posición inicial: afelio (máxima separación del Sol)
    earthGroup.position.set(a + c, 0, 0);

    // --- Apsis markers ---
    const periDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    periDot.position.set(a - c, 0, 0);
    scene.add(periDot);
    scene.add(makeLabel('Perihelio', '#ef4444', a - c, 0.12, 0));

    const apheDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    );
    apheDot.position.set(-(a + c), 0, 0);
    scene.add(apheDot);
    scene.add(makeLabel('Afelio', '#6366f1', -(a + c), 0.12, 0));

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 500);
    camera.position.set(2, 5, 9);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;
    rendererRef.current = renderer;

    // --- OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.5;
    controls.maxDistance = 18;
    controls.target.set(0, 0, 0);
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    controlsRef.current = controls;

    return { scene, camera, renderer, controls };
  }, []);

  // Update Earth position when orbital data changes
  useEffect(() => {
    if (!orbitalData || !earthGroupRef.current || !axisMeshRef.current) return;

    const { helioX, helioY, helioZ, axialTilt, declination } = orbitalData;

    // HelioVector devuelve coordenadas J2000 ecuatoriales (no eclípticas).
    // Convertir a eclípticas rotando -ε alrededor de X, donde ε = 23.439°.
    const eps = 23.439 * (Math.PI / 180);
    const cosE = Math.cos(eps);
    const sinE = Math.sin(eps);
    const xEcl = helioX;
    const yEcl = cosE * helioY + sinE * helioZ;
    // zEcl ≈ 0 para la Tierra (no se usa para posición)

    // Mapear eclíptico → Three.js: X→X, Y→−Z (para que vernal equinox quede atrás)
    earthGroupRef.current.position.set(xEcl * SCALE, 0, -yEcl * SCALE);

    // Inclinación axial: eje Y del grupo rotado axialTilt grados en Z (eclíptica)
    // La dirección del polo norte apunta hacia la constelación de Polaris,
    // que se mantiene casi fija; simplificamos con la inclinación constante
    const tiltRad = (axialTilt * Math.PI) / 180;
    // Rotamos en el plano XY del grupo para simular la inclinación hacia el sol
    // El eje se inclina en función de la declinación solar: cuando dec>0 el norte apunta al Sol
    const decRad = (declination * Math.PI) / 180;
    axisMeshRef.current.rotation.set(0, 0, tiltRad);

    // Rotamos la Tierra lentamente en su eje (día sidéreo)
    const dayFrac = (simulationDate.getTime() % 86400000) / 86400000;
    earthGroupRef.current.children[0].rotation.y = dayFrac * Math.PI * 2;
  }, [orbitalData, simulationDate]);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const { width, height } = el.getBoundingClientRect();
    const w = width || 400;
    const h = height || 400;

    const { renderer, camera, controls } = buildScene(w, h);
    el.appendChild(renderer.domElement);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(sceneRef.current!, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const { width: rw, height: rh } = el.getBoundingClientRect();
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [buildScene]);

  const location = useLocationStore((s) => s.location);

  const dayOfYear = Math.ceil(
    (simulationDate.getTime() - new Date(simulationDate.getFullYear(), 0, 0).getTime()) / 86400_000
  );

  const dateStr = simulationDate.toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

  const tiltData = orbitalData
    ? getAxialTiltData(simulationDate, location.latitude)
    : null;

  const seasonIcon: Record<string, string> = {
    Verano: '☀️', Invierno: '❄️', Primavera: '🌸', Otoño: '🍂',
  };

  return (
    <div className={`relative bg-space-950 ${className ?? ''}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* HUD — esquina superior izquierda, compacto en móvil */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 select-none pointer-events-none max-w-[11rem]">

        {/* Fecha + día del año */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-slate-700/40">
          <div className="text-slate-100 text-xs font-semibold leading-tight">{dateStr}</div>
          <div className="text-slate-400 text-[10px]">Día {dayOfYear} del año</div>
        </div>

        {orbitalData && tiltData && (
          <>
            {/* Distancia al Sol */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-slate-700/40">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider">Distancia al Sol</div>
              <div className="text-amber-300 text-xs font-mono font-semibold">
                {orbitalData.distanceAU.toFixed(4)} AU
              </div>
              <div className="text-slate-400 text-[10px]">
                {(orbitalData.distanceKm / 1_000_000).toFixed(3)} M km
              </div>
            </div>

            {/* Inclinación axial */}
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-orange-500/30">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider">Inclinación axial</div>
              <div className="flex items-center gap-1.5">
                <svg width="22" height="28" viewBox="0 0 28 36" className="shrink-0">
                  <ellipse cx="14" cy="28" rx="10" ry="4" fill="none" stroke="#334155" strokeWidth="1.2"/>
                  <circle cx="14" cy="18" r="7" fill="#1a4a7a" stroke="#3b82f6" strokeWidth="1"/>
                  <line
                    x1={14 + 9 * Math.sin(23.44 * Math.PI / 180)}
                    y1={18 - 9 * Math.cos(23.44 * Math.PI / 180)}
                    x2={14 - 9 * Math.sin(23.44 * Math.PI / 180)}
                    y2={18 + 9 * Math.cos(23.44 * Math.PI / 180)}
                    stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"
                  />
                  <ellipse cx="14" cy="18" rx="7" ry="2.5" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.6"/>
                </svg>
                <div>
                  <div className="text-orange-300 text-xs font-mono font-semibold">
                    {tiltData.obliquity.toFixed(4)}°
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Dec. solar {orbitalData.declination > 0 ? '+' : ''}{orbitalData.declination.toFixed(2)}°
                  </div>
                </div>
              </div>
            </div>

            {/* Estación */}
            <div className="bg-slate-900/75 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/40">
              <div className="text-slate-500 text-[9px] uppercase tracking-wider">Estación</div>
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">{seasonIcon[tiltData.seasonName] ?? '🌍'}</span>
                <div>
                  <div className="text-slate-100 text-xs font-semibold">{tiltData.seasonName}</div>
                  <div className="text-slate-400 text-[10px]">{tiltData.daylightHours.toFixed(1)} h de luz</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hint interacción — esquina inferior derecha */}
      <div className="absolute bottom-2 right-3 text-xs text-slate-600 select-none pointer-events-none">
        arrastrar · scroll zoom · pinch móvil
      </div>
    </div>
  );
}

// --- Helpers ---

function makeLabel(text: string, color: string, x: number, y: number, z: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 56;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(text, 6, 40);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.65, 0.14, 1);
  sprite.position.set(x, y, z);
  return sprite;
}

function makeEarthTexture(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Océano
  ctx.fillStyle = '#1a4a7a';
  ctx.fillRect(0, 0, size, size);

  // Continentes aproximados (formas simplificadas)
  ctx.fillStyle = '#2d6a35';
  const continents: [number, number, number, number][] = [
    [40, 60, 120, 160],   // Américas
    [230, 50, 100, 180],  // Europa/África
    [340, 40, 130, 140],  // Asia
    [360, 230, 90, 80],   // Australia
    [30, 230, 80, 30],    // Suramérica sur
    [200, 240, 50, 30],   // Antártida
  ];
  for (const [x, y, w, h] of continents) {
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Casquetes polares
  ctx.fillStyle = '#ddeeff';
  ctx.fillRect(0, 0, size, 28);
  ctx.fillRect(0, size - 28, size, 28);

  // Nubes sutiles
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 12; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 40 + Math.random() * 60, 15 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
