export interface OrbitalData {
  distanceAU: number;
  distanceKm: number;
  speedKmS: number;
  helioX: number;
  helioY: number;
  helioZ: number;
  declination: number;
  rightAscension: number;
  axialTilt: number;
  julianDate: number;
}

export interface Apsis {
  kind: 'perihelion' | 'aphelion';
  date: Date;
  distanceAU: number;
  distanceKm: number;
}

export interface SolarPosition {
  declination: number;
  rightAscension: number;
  altitude?: number;
  azimuth?: number;
}
