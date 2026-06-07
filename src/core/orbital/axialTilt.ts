import * as Astronomy from 'astronomy-engine';

export interface AxialTiltData {
  obliquity: number;
  solarDeclination: number;
  seasonName: string;
  daylightHours: number;
}

const GEOCENTER = new Astronomy.Observer(0, 0, 0);

export function getAxialTiltData(date: Date, latitude: number): AxialTiltData {
  const astroTime = Astronomy.MakeTime(date);
  const sunEq = Astronomy.Equator(Astronomy.Body.Sun, astroTime, GEOCENTER, true, true);
  const declination = sunEq.dec;

  // Duración del día aproximada (fórmula de Brock)
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const cosH0 = -Math.tan(latRad) * Math.tan(decRad);
  let daylightHours = 12;
  if (cosH0 <= -1) {
    daylightHours = 24;
  } else if (cosH0 >= 1) {
    daylightHours = 0;
  } else {
    const H0 = Math.acos(cosH0);
    daylightHours = (2 * H0 * 180) / Math.PI / 15;
  }

  return {
    obliquity: 23.4392811,
    solarDeclination: declination,
    seasonName: getSeasonName(date, latitude),
    daylightHours,
  };
}

function getSeasonName(date: Date, latitude: number): string {
  const month = date.getMonth() + 1;
  const isNorth = latitude >= 0;

  if (month >= 3 && month <= 5) return isNorth ? 'Primavera' : 'Otoño';
  if (month >= 6 && month <= 8) return isNorth ? 'Verano' : 'Invierno';
  if (month >= 9 && month <= 11) return isNorth ? 'Otoño' : 'Primavera';
  return isNorth ? 'Invierno' : 'Verano';
}
