import { useEffect, useState } from 'react';
import { OrbitCanvas } from './components/orbit/OrbitCanvas';
import { BottomSheet } from './components/ui/BottomSheet';
import { Sidebar } from './components/ui/Sidebar';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useGeolocation } from './hooks/useGeolocation';
import { useAstroData } from './hooks/useAstroData';
import { useOrbitAnimation } from './hooks/useOrbitAnimation';
import { useOrbitStore } from './store/useOrbitStore';

export function App() {
  useGeolocation();
  useAstroData();
  useOrbitAnimation();

  const orbitalData = useOrbitStore((s) => s.orbitalData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (orbitalData) {
      const t = setTimeout(() => setReady(true), 300);
      return () => clearTimeout(t);
    }
  }, [orbitalData]);

  return (
    <>
      {!ready && <LoadingScreen />}

      {/* Mobile: fixed al viewport real — no depende de ningún height padre */}
      <div className="md:hidden" style={{ position: 'fixed', inset: 0 }}>
        <OrbitCanvas className="absolute inset-0" />
        <BottomSheet />
      </div>

      {/* Desktop: también fixed para el mismo motivo */}
      <div className="hidden md:flex" style={{ position: 'fixed', inset: 0 }}>
        <OrbitCanvas className="flex-1 h-full" />
        <div className="w-80 h-full shrink-0 overflow-hidden">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
