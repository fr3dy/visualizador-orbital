import { create } from 'zustand';
import type { GeoLocation } from '../types/location';
import { DEFAULT_LOCATION } from '../types/location';

interface LocationState {
  location: GeoLocation;
  isLoading: boolean;
  error: string | null;
  setLocation: (loc: GeoLocation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: DEFAULT_LOCATION,
  isLoading: false,
  error: null,

  setLocation: (loc) => set({ location: loc, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
