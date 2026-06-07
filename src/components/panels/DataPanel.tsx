import { useOrbitStore } from '../../store/useOrbitStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useTimeStore } from '../../store/useTimeStore';
import { getAxialTiltData } from '../../core/orbital/axialTilt';

interface DataPanelProps {
  className?: string;
}

export function DataPanel({ className }: DataPanelProps) {
  const orbitalData = useOrbitStore((s) => s.orbitalData);
  const location = useLocationStore((s) => s.location);
  const simulationDate = useTimeStore((s) => s.simulationDate);

  if (!orbitalData) {
    return (
      <div className={`flex items-center justify-center p-4 ${className ?? ''}`}>
        <span className="text-slate-500 text-sm">Calculando…</span>
      </div>
    );
  }

  const tiltData = getAxialTiltData(simulationDate, location.latitude);
  const { distanceAU, distanceKm, speedKmS } = orbitalData;

  const rows: Array<{ label: string; value: string; sub?: string }> = [
    {
      label: 'Distancia al Sol',
      value: `${distanceAU.toFixed(6)} AU`,
      sub: `${(distanceKm / 1_000_000).toFixed(3)} M km`,
    },
    {
      label: 'Velocidad orbital',
      value: `${speedKmS.toFixed(2)} km/s`,
      sub: `${(speedKmS * 3600).toFixed(0)} km/h`,
    },
    {
      label: 'Declinación solar',
      value: `${orbitalData.declination.toFixed(2)}°`,
      sub: orbitalData.declination > 0 ? 'Hemisferio Norte' : 'Hemisferio Sur',
    },
    {
      label: 'Horas de luz',
      value: `${tiltData.daylightHours.toFixed(1)} h`,
      sub: `en ${location.cityName ?? `${location.latitude.toFixed(1)}°`}`,
    },
    {
      label: 'Estación',
      value: tiltData.seasonName,
      sub: location.latitude >= 0 ? 'Hemisferio Norte' : 'Hemisferio Sur',
    },
    {
      label: 'Inclinación axial',
      value: `${tiltData.obliquity.toFixed(4)}°`,
    },
  ];

  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        Datos orbitales
      </h2>
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between items-baseline gap-2 py-1.5 border-b border-slate-800 last:border-0">
          <span className="text-xs text-slate-400 shrink-0">{row.label}</span>
          <div className="text-right">
            <span className="text-sm font-mono text-slate-100">{row.value}</span>
            {row.sub && <div className="text-xs text-slate-500">{row.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
