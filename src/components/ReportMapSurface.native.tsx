import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { ReportMarker } from '@/components/ReportMarker';
import { BANDUNG_CENTER, HAZARD_STYLE } from '@/constants/map';
import type { Coordinate, InfrastructureReport } from '@/types/report';

export type ReportMapSurfaceProps = {
  reports: InfrastructureReport[];
  selectedId: string | null;
  onSelectReport: (id: string) => void;
  userCoordinate: Coordinate | null;
  hasLocationPermission: boolean;
  tracking: boolean;
  centerRequest: number;
};

const INITIAL_REGION: Region = {
  ...BANDUNG_CENTER,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export default function ReportMapSurface({
  reports,
  selectedId,
  onSelectReport,
  userCoordinate,
  hasLocationPermission,
  tracking,
  centerRequest,
}: ReportMapSurfaceProps) {
  const map = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const centeredOnUser = useRef(false);
  const lastCenterRequest = useRef(centerRequest);

  useEffect(() => {
    if (!mapReady || !userCoordinate || centeredOnUser.current) return;
    map.current?.animateToRegion({ ...userCoordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 450);
    centeredOnUser.current = true;
  }, [mapReady, userCoordinate]);

  useEffect(() => {
    if (!mapReady || centerRequest === lastCenterRequest.current) return;
    lastCenterRequest.current = centerRequest;
    const coordinate = userCoordinate ?? BANDUNG_CENTER;
    map.current?.animateToRegion({ ...coordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 450);
  }, [centerRequest, mapReady, userCoordinate]);

  return (
    <>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        accessibilityLabel="Peta laporan kerusakan dan kondisi bencana"
        onMapReady={() => setMapReady(true)}
      >
        {reports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            selected={report.id === selectedId}
            onPress={() => onSelectReport(report.id)}
          />
        ))}
        {userCoordinate && (
          <Marker coordinate={userCoordinate} title="Lokasi Anda" accessibilityLabel="Lokasi Anda">
            <View style={styles.userMarker}><View style={styles.userMarkerCore} /></View>
          </Marker>
        )}
      </MapView>

      <View pointerEvents="none" style={styles.mapTopLabel}>
        <View style={styles.mapTopIcon}><Text style={styles.mapTopIconText}>⌖</Text></View>
        <View>
          <Text style={styles.mapTopTitle}>{userCoordinate ? 'Lokasi Anda' : 'Area awal laporan'}</Text>
          <Text style={styles.mapTopCaption}>{tracking ? 'GPS aktif · posisi diperbarui' : 'Aktifkan lokasi untuk memusatkan peta'}</Text>
        </View>
      </View>
      <View pointerEvents="none" style={styles.legend}>
        {(['Rendah', 'Sedang', 'Tinggi'] as const).map((hazard) => (
          <View key={hazard} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: HAZARD_STYLE[hazard].color }]} />
            <Text style={styles.legendText}>{hazard}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mapTopLabel: { position: 'absolute', top: 13, left: 13, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFFFFF', borderRadius: 17, paddingVertical: 9, paddingHorizontal: 11, elevation: 4, shadowColor: '#17352E', shadowOpacity: 0.11, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  mapTopIcon: { width: 30, height: 30, backgroundColor: '#EAF5F0', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  mapTopIconText: { color: '#176B56', fontSize: 18 },
  mapTopTitle: { color: '#203A32', fontSize: 10, fontWeight: '800' },
  mapTopCaption: { color: '#7C8B85', fontSize: 9, marginTop: 2 },
  legend: { position: 'absolute', right: 12, top: 13, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, gap: 7, elevation: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 2 },
  legendText: { color: '#61716B', fontSize: 9, fontWeight: '700' },
  userMarker: { height: 24, width: 24, borderRadius: 12, backgroundColor: 'rgba(39, 125, 205, 0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(39, 125, 205, 0.3)' },
  userMarkerCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#277DCD', borderWidth: 2, borderColor: '#FFFFFF' },
});
