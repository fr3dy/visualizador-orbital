import { useState } from 'react';
import { DataPanel } from '../panels/DataPanel';
import { ApsisPanel } from '../panels/ApsisPanel';
import { LocationPanel } from '../panels/LocationPanel';
import { TimeSlider } from '../controls/TimeSlider';

type Tab = 'datos' | 'apsides' | 'ubicacion';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('datos');

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'datos', label: 'Datos' },
    { id: 'apsides', label: 'Apsides' },
    { id: 'ubicacion', label: 'Ubicación' },
  ];

  return (
    <aside className="flex flex-col h-full bg-slate-900 border-l border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 shrink-0">
        <h1 className="text-sm font-semibold text-slate-200 tracking-wide">
          Visualizador Orbital
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Tierra · Sistema Solar</p>
      </div>

      {/* Time controls */}
      <div className="px-4 py-3 border-b border-slate-800 shrink-0">
        <TimeSlider />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2.5 text-xs font-medium transition-colors
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
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {activeTab === 'datos' && <DataPanel />}
        {activeTab === 'apsides' && <ApsisPanel />}
        {activeTab === 'ubicacion' && <LocationPanel />}
      </div>
    </aside>
  );
}
