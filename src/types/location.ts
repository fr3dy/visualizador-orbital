export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
  source: 'browser' | 'ip' | 'default';
  cityName?: string;
  countryCode?: string;
}

// Lima, Perú — coordenadas por defecto según CLAUDE.md
export const DEFAULT_LOCATION: GeoLocation = {
  latitude: -12.04,
  longitude: -77.03,
  source: 'default',
  cityName: 'Lima',
  countryCode: 'PE',
};
