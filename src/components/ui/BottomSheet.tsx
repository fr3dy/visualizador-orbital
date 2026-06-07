import { useState, useRef } from 'react';
import { DataPanel } from '../panels/DataPanel';
import { ApsisPanel } from '../panels/ApsisPanel';
import { LocationPanel } from '../panels/LocationPanel';
import { TimeSlider } from '../controls/TimeSlider';

type Tab = 'datos' | 'apsides' | 'ubicacion';

// Altura visible cuando está colapsado (handle + slider + tabs)
const COLLAPSED_H = '9rem';
// Altura máxima cuando está expandido
const EXPANDED_H = '60dvh';

export function BottomSheet() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('datos');
  const startYRef = useRef<number>(0);

  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 25) setExpanded(dy > 0);
    else setExpanded((v) => !v);
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'datos', label: 'Datos' },
    { id: 'apsides', label: 'Apsides' },
    { id: 'ubicacion', label: 'Ubicación' },
  ];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex flex-col
        bg-slate-900/97 backdrop-blur-md
        border-t border-slate-700/50 rounded-t-2xl shadow-2xl
        transition-[height] duration-300 ease-out overflow-hidden"
      style={{ height: expanded ? EXPANDED_H : COLLAPSED_H }}
    >
      {/* Handle — drag para expandir/colapsar */}
      <div
        className="flex flex-col items-center px-4 pt-2 pb-2 shrink-0 cursor-pointer select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        aria-label="Expandir panel"
      >
        <div className="w-10 h-1 rounded-full bg-slate-600 mb-2" />
        <TimeSlider />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(tab.id);
              if (!expanded) setExpanded(true);
            }}
            className={`flex-1 py-2 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-500'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido — solo visible cuando expandido */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {activeTab === 'datos' && <DataPanel />}
        {activeTab === 'apsides' && <ApsisPanel />}
        {activeTab === 'ubicacion' && <LocationPanel />}
      </div>
    </div>
  );
}
