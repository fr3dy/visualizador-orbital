import { useEffect } from 'react';
import { getOrbitalData } from '../core/orbital/earthOrbit';
import { findNextApsis, findApsisesForYear } from '../core/orbital/apsides';
import { useTimeStore } from '../store/useTimeStore';
import { useOrbitStore } from '../store/useOrbitStore';

export function useAstroData() {
  const { simulationDate } = useTimeStore();
  const { setOrbitalData, setNextApsis, setYearApsises } = useOrbitStore();

  useEffect(() => {
    const data = getOrbitalData(simulationDate);
    setOrbitalData(data);
  }, [simulationDate, setOrbitalData]);

  // Apsides: recalcular solo cuando cambia el año o el mes
  useEffect(() => {
    try {
      const next = findNextApsis(simulationDate);
      setNextApsis(next);
    } catch {
      // astronomy-engine puede fallar fuera de rango — ignorar silenciosamente
    }
  }, [simulationDate.getFullYear(), simulationDate.getMonth(), setNextApsis]);

  useEffect(() => {
    try {
      const year = simulationDate.getFullYear();
      const apsises = findApsisesForYear(year);
      setYearApsises(apsises);
    } catch {
      // ignorar
    }
  }, [simulationDate.getFullYear(), setYearApsises]);
}
