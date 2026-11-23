import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_STYLE, HAZARD_STYLE } from '@/constants/map';
import { formatDistance, haversineDistanceMeters } from '@/utils/distance';
import type { Coordinate, InfrastructureReport } from '@/types/report';

type Props = {
  report: InfrastructureReport | null;
  userCoordinate: Coordinate | null;
  onEnableLocation: () => void;
  onOpenSettings: () => void;
  needsSettings: boolean;
  locationLoading: boolean;
  locationError: string | null;
};

export function ReportDetailCard({ report, userCoordinate, onEnableLocation, onOpenSettings, needsSettings, locationLoading, locationError }: Props) {
  if (!report) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>⌕</Text></View>
        <Text style={styles.title}>Belum ada laporan di area ini</Text>
        <Text style={styles.description}>Coba pilih kategori lain untuk melihat titik simulasi.</Text>
      </View>
    );
  }

  const hazard = HAZARD_STYLE[report.hazard];
  const distance = userCoordinate
    ? formatDistance(haversineDistanceMeters(userCoordinate, report.coordinate))
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.topLine}>
        <View style={styles.categoryPill}>
          <Text style={styles.categorySymbol}>{CATEGORY_STYLE[report.category].symbol}</Text>
          <Text style={styles.categoryText}>{report.category}</Text>
        </View>
        <View style={[styles.hazardPill, { backgroundColor: `${hazard.color}15` }]}>
          <Text style={[styles.hazardText, { color: hazard.color }]}>{hazard.label}</Text>
        </View>
      </View>

      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.description}>{report.description}</Text>

      <View style={styles.metadata}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>↗</Text>
          <Text style={styles.metaText}>{distance ?? 'Jarak belum tersedia'}</Text>
        </View>
        <View style={styles.statusWrap}>
          <View style={[styles.statusDot, { backgroundColor: report.status === 'Selesai' ? '#31856B' : '#C68017' }]} />
          <Text style={styles.metaText}>{report.status}</Text>
        </View>
      </View>

      {!userCoordinate && (
        <View style={styles.permissionRow}>
          <View style={styles.permissionCopy}>
            <Text style={styles.permissionTitle}>{locationError ? 'Lokasi belum tersedia' : 'Aktifkan lokasi Anda'}</Text>
            <Text style={styles.permissionDescription}>
              {locationError ?? 'Untuk menghitung jarak ke titik laporan.'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Aktifkan lokasi perangkat"
            onPress={needsSettings ? onOpenSettings : onEnableLocation}
            disabled={locationLoading}
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressed, locationLoading && styles.disabled]}
          >
            <Text style={styles.locationButtonText}>{locationLoading ? '…' : needsSettings ? 'Pengaturan' : 'Aktifkan'}</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.simulationNote}>
        {report.reportedAt} · {report.source === 'warga' ? 'laporan warga' : 'data simulasi'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#17352E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  topLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF5F2', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  categorySymbol: { color: '#176B56', fontWeight: '900', fontSize: 13 },
  categoryText: { color: '#31594E', fontSize: 11, fontWeight: '700' },
  hazardPill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  hazardText: { fontSize: 11, fontWeight: '800' },
  title: { color: '#172B26', fontSize: 17, lineHeight: 22, fontWeight: '800', marginTop: 13 },
  description: { color: '#71817C', fontSize: 12, lineHeight: 18, marginTop: 4 },
  metadata: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEF1EF', marginTop: 14, paddingTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaIcon: { color: '#176B56', fontSize: 16, fontWeight: '900' },
  metaText: { color: '#53645F', fontSize: 11, fontWeight: '700' },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  permissionRow: { backgroundColor: '#F5F8F6', borderRadius: 15, marginTop: 12, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  permissionCopy: { flex: 1 },
  permissionTitle: { color: '#213B33', fontWeight: '800', fontSize: 11 },
  permissionDescription: { color: '#74827D', fontSize: 10, lineHeight: 14, marginTop: 3 },
  locationButton: { backgroundColor: '#176B56', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  locationButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
  simulationNote: { color: '#98A39F', fontSize: 9, fontWeight: '600', marginTop: 11 },
  emptyIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#EFF5F2', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyIconText: { color: '#176B56', fontSize: 24 },
});
