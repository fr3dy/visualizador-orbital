import * as Astronomy from 'astronomy-engine';
import type { Apsis } from '../../types/astronomy';
import { EARTH_ORBIT } from './earthOrbit';

export function findNextApsis(fromDate: Date): Apsis {
  const startTime = Astronomy.MakeTime(fromDate);
  const apsis = Astronomy.SearchPlanetApsis(Astronomy.Body.Earth, startTime);

  return apsisFromRaw(apsis);
}

export function findApsisesForYear(year: number): { perihelion: Apsis; aphelion: Apsis } {
  // Buscar desde comienzo del año
  const startTime = Astronomy.MakeTime(new Date(year, 0, 1));
  const first = Astronomy.SearchPlanetApsis(Astronomy.Body.Earth, startTime);
  const second = Astronomy.NextPlanetApsis(Astronomy.Body.Earth, first);

  const a = apsisFromRaw(first);
  const b = apsisFromRaw(second);

  if (a.kind === 'perihelion') {
    return { perihelion: a, aphelion: b };
  }
  return { perihelion: b, aphelion: a };
}

function apsisFromRaw(apsis: Astronomy.Apsis): Apsis {
  const distAU = apsis.dist_au;
  return {
    kind: apsis.kind === 0 ? 'perihelion' : 'aphelion',
    date: apsis.time.date,
    distanceAU: distAU,
    distanceKm: distAU * EARTH_ORBIT.semiMajorAxis,
  };
}
