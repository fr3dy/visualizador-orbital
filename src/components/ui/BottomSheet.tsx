import { useState, useRef } from 'react';
import { DataPanel } from '../panels/DataPanel';
import { ApsisPanel } from '../panels/ApsisPanel';
import { LocationPanel } from '../panels/LocationPanel';
import { TimeSlider } from '../controls/TimeSlider';

type Tab = 'datos' | 'apsides' | 'ubicacion';

export function BottomSheet() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('datos');
  const startYRef = useRef<number>(0);
  const startExpandedRef = useRef(false);

  const onHandleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    startExpandedRef.current = expanded;
  };

  const onHandleTouchEnd = (e: React.TouchEvent) => {
    const dy = startYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 30) {
      setExpanded(dy > 0);
    } else {
      setExpanded((v) => !v);
    }
  };

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'datos', label: 'Datos' },
    { id: 'apsides', label: 'Apsides' },
    { id: 'ubicacion', label: 'Ubicación' },
  ];

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-20
        bg-slate-900/95 backdrop-blur-md
        border-t border-slate-700/50
        rounded-t-2xl shadow-2xl
        transition-transform duration-300 ease-out
        ${expanded ? 'translate-y-0' : 'translate-y-[calc(100%-8.5rem)]'}
      `}
    >
      {/* Handle + time slider always visible */}
      <div
        className="flex flex-col items-center px-4 pt-2 pb-3 cursor-pointer select-none"
        onTouchStart={onHandleTouchStart}
        onTouchEnd={onHandleTouchEnd}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        aria-label="Expandir panel de datos"
      >
        <div className="w-10 h-1 rounded-full bg-slate-600 mb-3" />
        <TimeSlider />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); if (!expanded) setExpanded(true); }}
            className={`
              flex-1 py-2 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: '50vh' }}>
        {activeTab === 'datos' && <DataPanel />}
        {activeTab === 'apsides' && <ApsisPanel />}
        {activeTab === 'ubicacion' && <LocationPanel />}
      </div>
    </div>
  );
}
