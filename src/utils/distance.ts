import type { Coordinate } from '@/types/report';

const EARTH_RADIUS_METERS = 6_371_000;

export function isValidCoordinate(point: Coordinate): boolean {
  return Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude)
    && point.latitude >= -90
    && point.latitude <= 90
    && point.longitude >= -180
    && point.longitude <= 180;
}

/** Jarak garis lurus di permukaan bumi (bukan jarak navigasi jalan raya). */
export function haversineDistanceMeters(from: Coordinate, to: Coordinate): number {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) {
    throw new RangeError('Koordinat harus berupa lintang dan bujur yang valid.');
  }

  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const fromLatitude = radians(from.latitude);
  const toLatitude = radians(to.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return 'Jarak tidak tersedia';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
