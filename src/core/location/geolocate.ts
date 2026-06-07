import type { GeoLocation } from '../../types/location';
import { DEFAULT_LOCATION } from '../../types/location';
import { getIpLocation } from './ipFallback';

export function getBrowserLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude ?? undefined,
          source: 'browser',
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  });
}

export async function getLocation(): Promise<GeoLocation> {
  try {
    return await getBrowserLocation();
  } catch {
    try {
      return await getIpLocation();
    } catch {
      return DEFAULT_LOCATION;
    }
  }
}
