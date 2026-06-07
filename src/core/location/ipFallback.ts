import type { GeoLocation } from '../../types/location';

interface IpApiResponse {
  lat: number;
  lon: number;
  city: string;
  countryCode: string;
  status: string;
}

export async function getIpLocation(): Promise<GeoLocation> {
  const res = await fetch('http://ip-api.com/json/?fields=status,lat,lon,city,countryCode');
  if (!res.ok) throw new Error('ip-api request failed');
  const data: IpApiResponse = await res.json();
  if (data.status !== 'success') throw new Error('ip-api returned failure');
  return {
    latitude: data.lat,
    longitude: data.lon,
    source: 'ip',
    cityName: data.city,
    countryCode: data.countryCode,
  };
}
