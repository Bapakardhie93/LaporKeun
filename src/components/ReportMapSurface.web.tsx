import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HAZARD_STYLE } from '@/constants/map';
import type { ReportMapSurfaceProps } from '@/components/ReportMapSurface.native';

export default function ReportMapSurface({ reports, selectedId, onSelectReport }: ReportMapSurfaceProps) {
  return (
    <View style={styles.webFallback}>
      <View style={styles.webFallbackIcon}><Text style={styles.webFallbackSymbol}>⌖</Text></View>
      <Text style={styles.webFallbackTitle}>Peta tersedia di aplikasi mobile</Text>
      <Text style={styles.webFallbackText}>Di web, laporan tetap bisa dilihat dan dibuat. Buka Expo Go di Android/iOS untuk peta interaktif.</Text>
      <View style={styles.webReportList}>
        {reports.slice(0, 5).map((report) => (
          <Pressable key={report.id} onPress={() => onSelectReport(report.id)} style={styles.webReportRow}>
            <View style={[styles.webReportDot, { backgroundColor: HAZARD_STYLE[report.hazard].color }]} />
            <Text style={[styles.webReportName, report.id === selectedId && styles.webReportNameActive]} numberOfLines={1}>{report.title}</Text>
            <Text style={styles.webReportArrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF3EF', paddingHorizontal: 26 },
  webFallbackIcon: { width: 54, height: 54, borderRadius: 20, backgroundColor: '#176B56', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  webFallbackSymbol: { color: '#FFFFFF', fontSize: 31 },
  webFallbackTitle: { color: '#203A32', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  webFallbackText: { color: '#72827B', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 300, marginTop: 7 },
  webReportList: { width: '100%', maxWidth: 300, borderRadius: 17, backgroundColor: '#FFFFFF', paddingHorizontal: 13, marginTop: 17 },
  webReportRow: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 40, borderBottomWidth: 1, borderBottomColor: '#F0F3F1' },
  webReportDot: { width: 8, height: 8, borderRadius: 4 },
  webReportName: { color: '#3C5048', fontWeight: '700', fontSize: 11, flex: 1 },
  webReportNameActive: { color: '#176B56' },
  webReportArrow: { color: '#84948D', fontSize: 19 },
});
