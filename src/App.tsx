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

      {/* Mobile layout: fixed al viewport real, canvas + bottom sheet superpuesto */}
      <div className="md:hidden fixed inset-0" style={{ height: '100dvh' }}>
        <OrbitCanvas className="absolute inset-0" />
        <BottomSheet />
      </div>

      {/* Desktop layout: canvas + sidebar */}
      <div className="hidden md:flex h-full w-full">
        <OrbitCanvas className="flex-1 h-full" />
        <div className="w-80 h-full shrink-0">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
