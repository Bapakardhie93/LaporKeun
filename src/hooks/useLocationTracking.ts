import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

import type { Coordinate } from '@/types/report';

export type PermissionState = 'unknown' | 'granted' | 'denied';
export type ServiceState = 'unknown' | 'enabled' | 'disabled';

type TrackingState = {
  coordinate: Coordinate | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState;
  canAskAgain: boolean;
  services: ServiceState;
  tracking: boolean;
};

/** Minimum pergeseran sebelum UI menerima posisi baru, dalam meter. */
export function getAdaptiveDistanceInterval(platform: string, precise: boolean): number {
  if (!precise) return platform === 'ios' ? 60 : 100;
  return platform === 'ios' ? 20 : 30;
}

function toCoordinate(position: Location.LocationObject): Coordinate {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export function useLocationTracking() {
  const [state, setState] = useState<TrackingState>({
    coordinate: null,
    loading: true,
    error: null,
    permission: 'unknown',
    canAskAgain: true,
    services: 'unknown',
    tracking: false,
  });
  const mounted = useRef(true);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const startInProgress = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const inspectDevice = async () => {
      try {
        const [permission, servicesEnabled] = await Promise.all([
          Location.getForegroundPermissionsAsync(),
          Location.hasServicesEnabledAsync(),
        ]);
        if (!mounted.current) return;
        setState((current) => ({
          ...current,
          loading: false,
          permission: permission.granted ? 'granted' : permission.status === 'denied' ? 'denied' : 'unknown',
          canAskAgain: permission.canAskAgain,
          services: servicesEnabled ? 'enabled' : 'disabled',
          error: !servicesEnabled
            ? 'Layanan lokasi perangkat sedang nonaktif. Aktifkan GPS lalu coba lagi.'
            : permission.status === 'denied'
              ? 'Izin lokasi belum diberikan. Aktifkan izin agar jarak ke laporan dapat dihitung.'
              : null,
        }));
      } catch {
        if (mounted.current) {
          setState((current) => ({ ...current, loading: false, error: 'Status lokasi perangkat tidak dapat diperiksa.' }));
        }
      }
    };

    void inspectDevice();
    return () => {
      mounted.current = false;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, []);

  const startTracking = useCallback(async () => {
    if (startInProgress.current || subscription.current) return;
    startInProgress.current = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) permission = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current) return;
      if (!permission.granted) {
        setState((current) => ({ ...current, loading: false, permission: 'denied', tracking: false,
          canAskAgain: permission.canAskAgain,
          error: 'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan perangkat untuk melihat posisi Anda.' }));
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!mounted.current) return;
      if (!servicesEnabled) {
        setState((current) => ({ ...current, loading: false, permission: 'granted', services: 'disabled', tracking: false,
          error: 'Layanan lokasi perangkat sedang nonaktif. Aktifkan GPS lalu coba lagi.' }));
        return;
      }
      setState((current) => ({ ...current, permission: 'granted', services: 'enabled' }));

      const cachedPosition = await Location.getLastKnownPositionAsync({ maxAge: 60_000, requiredAccuracy: 1000 });
      if (cachedPosition && mounted.current) {
        setState((current) => ({ ...current, coordinate: toCoordinate(cachedPosition) }));
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!mounted.current) return;
      setState((current) => ({ ...current, coordinate: toCoordinate(position), loading: false, error: null }));

      const precise = Platform.OS === 'ios'
        ? permission.ios?.accuracy !== 'reduced'
        : permission.android?.accuracy !== 'coarse';
      const distanceInterval = getAdaptiveDistanceInterval(Platform.OS, precise);
      const nextSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval,
          ...(Platform.OS === 'android' ? { timeInterval: 10_000 } : {}),
        },
        (nextPosition) => {
          if (!mounted.current) return;
          setState((current) => ({ ...current, coordinate: toCoordinate(nextPosition), error: null }));
        },
        () => {
          if (mounted.current) setState((current) => ({ ...current, error: 'Pembaruan lokasi terhenti. Coba aktifkan GPS kembali.' }));
        },
      );
      if (!mounted.current) {
        nextSubscription.remove();
        return;
      }
      subscription.current = nextSubscription;
      setState((current) => ({ ...current, tracking: true }));
    } catch {
      if (mounted.current) setState((current) => ({ ...current, loading: false, tracking: false,
        error: 'Lokasi belum berhasil dibaca. Pastikan GPS aktif dan coba lagi.' }));
    } finally {
      startInProgress.current = false;
      if (mounted.current) setState((current) => ({ ...current, loading: false }));
    }
  }, []);

  const stopTracking = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
    setState((current) => ({ ...current, tracking: false }));
  }, []);

  const openLocationSettings = useCallback(() => Linking.openSettings(), []);

  return { ...state, startTracking, stopTracking, openLocationSettings };
}
