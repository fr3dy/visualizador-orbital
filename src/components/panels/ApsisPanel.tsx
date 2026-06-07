import { useOrbitStore } from '../../store/useOrbitStore';
import { useTimeStore } from '../../store/useTimeStore';

export function ApsisPanel() {
  const nextApsis = useOrbitStore((s) => s.nextApsis);
  const yearApsises = useOrbitStore((s) => s.yearApsises);
  const simulationDate = useTimeStore((s) => s.simulationDate);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const daysUntil = (d: Date) => {
    const diff = d.getTime() - simulationDate.getTime();
    return Math.round(diff / 86400_000);
  };

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        Perihelio / Afelio
      </h2>

      {nextApsis && (
        <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                nextApsis.kind === 'perihelion' ? 'bg-red-500' : 'bg-indigo-400'
              }`}
            />
            <span className="text-xs text-slate-300">
              Próximo {nextApsis.kind === 'perihelion' ? 'Perihelio' : 'Afelio'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-slate-100">{formatDate(nextApsis.date)}</div>
            <div className="text-xs text-slate-500">
              {daysUntil(nextApsis.date) > 0
                ? `en ${daysUntil(nextApsis.date)} días`
                : `hace ${-daysUntil(nextApsis.date)} días`}
            </div>
          </div>
        </div>
      )}

      {yearApsises && (
        <>
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-xs text-slate-400">
                Perihelio {simulationDate.getFullYear()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-slate-300">
                {formatDate(yearApsises.perihelion.date)}
              </div>
              <div className="text-xs text-slate-500">
                {yearApsises.perihelion.distanceAU.toFixed(6)} AU
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <span className="text-xs text-slate-400">
                Afelio {simulationDate.getFullYear()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-slate-300">
                {formatDate(yearApsises.aphelion.date)}
              </div>
              <div className="text-xs text-slate-500">
                {yearApsises.aphelion.distanceAU.toFixed(6)} AU
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
