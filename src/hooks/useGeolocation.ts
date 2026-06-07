import { useEffect } from 'react';
import { getLocation } from '../core/location/geolocate';
import { useLocationStore } from '../store/useLocationStore';

export function useGeolocation() {
  const { setLocation, setLoading, setError } = useLocationStore();

  useEffect(() => {
    setLoading(true);
    getLocation()
      .then(setLocation)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [setLocation, setLoading, setError]);
}
