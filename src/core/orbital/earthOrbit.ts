import * as Astronomy from 'astronomy-engine';
import type { OrbitalData } from '../../types/astronomy';

export const EARTH_ORBIT = {
  semiMajorAxis: 149_597_870.7,
  eccentricity: 0.0167086,
  perihelionDist: 147_095_000,
  aphelionDist: 152_100_000,
  axialTilt: 23.4392811,
  orbitalPeriod: 365.25636,
} as const;

// Observer en el ecuador para obtener declinación solar geocéntrica
const GEOCENTER = new Astronomy.Observer(0, 0, 0);

export function getOrbitalData(date: Date): OrbitalData {
  const astroTime = Astronomy.MakeTime(date);
  const pos = Astronomy.HelioVector(Astronomy.Body.Earth, astroTime);
  const distAU = Astronomy.HelioDistance(Astronomy.Body.Earth, astroTime);
  const sunEq = Astronomy.Equator(Astronomy.Body.Sun, astroTime, GEOCENTER, true, true);

  const GM_SUN = 1.327124e11;
  const rKm = distAU * EARTH_ORBIT.semiMajorAxis;
  const aKm = EARTH_ORBIT.semiMajorAxis;
  const speedKmS = Math.sqrt(GM_SUN * (2 / rKm - 1 / aKm));

  return {
    distanceAU: distAU,
    distanceKm: rKm,
    speedKmS,
    helioX: pos.x,
    helioY: pos.y,
    helioZ: pos.z,
    declination: sunEq.dec,
    rightAscension: sunEq.ra,
    axialTilt: EARTH_ORBIT.axialTilt,
    julianDate: astroTime.tt,
  };
}

/** Convierte coordenadas heliocéntricas eclípticas a posición en la elipse normalizada [−1, 1] */
export function helioToEllipsePoint(x: number, y: number): [number, number] {
  // Las coordenadas de astronomy-engine están en AU, eje X apunta al equinoccio vernal
  // Para la visualización 2D de la órbita usamos X e Y directamente
  return [x, y];
}
