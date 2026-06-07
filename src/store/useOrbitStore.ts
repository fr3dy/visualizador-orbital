import { create } from 'zustand';
import type { OrbitalData, Apsis } from '../types/astronomy';

interface OrbitState {
  orbitalData: OrbitalData | null;
  nextApsis: Apsis | null;
  yearApsises: { perihelion: Apsis; aphelion: Apsis } | null;
  setOrbitalData: (data: OrbitalData) => void;
  setNextApsis: (apsis: Apsis) => void;
  setYearApsises: (apsises: { perihelion: Apsis; aphelion: Apsis }) => void;
}

export const useOrbitStore = create<OrbitState>((set) => ({
  orbitalData: null,
  nextApsis: null,
  yearApsises: null,

  setOrbitalData: (data) => set({ orbitalData: data }),
  setNextApsis: (apsis) => set({ nextApsis: apsis }),
  setYearApsises: (apsises) => set({ yearApsises: apsises }),
}));
