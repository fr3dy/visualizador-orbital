import { create } from 'zustand';

interface TimeState {
  simulationDate: Date;
  isPlaying: boolean;
  speedMultiplier: number;
  setDate: (date: Date) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  advanceDays: (days: number) => void;
}

export const useTimeStore = create<TimeState>((set) => ({
  simulationDate: new Date(),
  isPlaying: false,
  speedMultiplier: 1,

  setDate: (date) => set({ simulationDate: date }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speedMultiplier: speed }),
  advanceDays: (days) =>
    set((state) => {
      const next = new Date(state.simulationDate);
      next.setDate(next.getDate() + days);
      return { simulationDate: next };
    }),
}));
