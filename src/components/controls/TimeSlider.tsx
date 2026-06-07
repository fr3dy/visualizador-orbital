import { useCallback, useRef } from 'react';
import { useTimeStore } from '../../store/useTimeStore';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function dateToValue(date: Date): number {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const frac = (date.getTime() - start) / (end - start);
  return year + frac;
}

function valueToDate(value: number): Date {
  const year = Math.floor(value);
  const frac = value - year;
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  return new Date(start + frac * (end - start));
}

export function TimeSlider() {
  const { simulationDate, setDate, isPlaying, setPlaying, speedMultiplier, setSpeed } = useTimeStore();
  const swipeStartXRef = useRef<number | null>(null);
  const swipeDateRef = useRef<Date | null>(null);

  const value = dateToValue(simulationDate);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(valueToDate(parseFloat(e.target.value)));
  }, [setDate]);

  // Swipe to change date
  const onTouchStart = (e: React.TouchEvent) => {
    swipeStartXRef.current = e.touches[0].clientX;
    swipeDateRef.current = new Date(simulationDate);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (swipeStartXRef.current === null || !swipeDateRef.current) return;
    const dx = e.touches[0].clientX - swipeStartXRef.current;
    const daysPerPx = 2 * speedMultiplier;
    const days = -dx * daysPerPx;
    const next = new Date(swipeDateRef.current.getTime() + days * 86400_000);
    setDate(next);
  };

  const onTouchEnd = () => {
    swipeStartXRef.current = null;
  };

  const goToToday = () => setDate(new Date());

  const speeds = [1, 7, 30, 365];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Date display */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-sm font-mono">
          {simulationDate.toLocaleDateString('es-ES', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
        <button
          onClick={goToToday}
          className="text-xs text-slate-500 hover:text-slate-300 active:text-slate-300 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-slate-500"
        >
          Hoy
        </button>
      </div>

      {/* Year slider */}
      <input
        type="range"
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={0.001}
        value={value}
        onChange={handleChange}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full h-2 appearance-none rounded-full cursor-pointer
          bg-slate-700 accent-blue-500"
        aria-label="Control de tiempo"
      />

      {/* Play/Pause + Speed */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium transition-colors min-w-[4.5rem]"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? '⏸ Pausa' : '▶ Play'}
        </button>

        <div className="flex gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${
                speedMultiplier === s
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {s === 1 ? '1d' : s === 7 ? '1sem' : s === 30 ? '1mes' : '1año'}/s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
