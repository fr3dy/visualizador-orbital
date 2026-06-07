import { useLocationStore } from '../../store/useLocationStore';
import { getLocation } from '../../core/location/geolocate';

export function LocationPanel() {
  const { location, isLoading, error, setLocation, setLoading, setError } = useLocationStore();

  const refresh = async () => {
    setLoading(true);
    try {
      const loc = await getLocation();
      setLocation(loc);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const sourceLabel = {
    browser: 'GPS',
    ip: 'IP',
    default: 'Por defecto',
  }[location.source];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Ubicación
        </h2>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-40 transition-colors"
          aria-label="Actualizar ubicación"
        >
          {isLoading ? '…' : '⟳ Actualizar'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-1">{error}</p>
      )}

      <div className="flex justify-between items-baseline py-1.5 border-b border-slate-800">
        <span className="text-xs text-slate-400">Latitud</span>
        <span className="text-sm font-mono text-slate-100">
          {Math.abs(location.latitude).toFixed(4)}° {location.latitude >= 0 ? 'N' : 'S'}
        </span>
      </div>
      <div className="flex justify-between items-baseline py-1.5 border-b border-slate-800">
        <span className="text-xs text-slate-400">Longitud</span>
        <span className="text-sm font-mono text-slate-100">
          {Math.abs(location.longitude).toFixed(4)}° {location.longitude >= 0 ? 'E' : 'O'}
        </span>
      </div>
      <div className="flex justify-between items-baseline py-1.5">
        <span className="text-xs text-slate-400">Fuente</span>
        <span className="text-xs text-slate-300">
          {location.cityName ? `${location.cityName} · ` : ''}{sourceLabel}
        </span>
      </div>
    </div>
  );
}
