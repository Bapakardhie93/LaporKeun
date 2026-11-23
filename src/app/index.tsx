import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav } from '@/components/AppBottomNav';
import ReportMapSurface from '@/components/ReportMapSurface';
import { ReportDetailCard } from '@/components/ReportDetailCard';
import { CATEGORY_STYLE } from '@/constants/map';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useReports } from '@/hooks/useReports';
import type { ReportCategory } from '@/types/report';

const CATEGORIES: ('Semua' | ReportCategory)[] = [
  'Semua', 'Jalan berlubang', 'Jalan rusak', 'Banjir', 'Tanah longsor', 'Infrastruktur umum rusak',
];

export default function MapScreen() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('Semua');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerRequest, setCenterRequest] = useState(0);
  const { reports } = useReports();
  const location = useLocationTracking();

  const visibleReports = useMemo(
    () => activeCategory === 'Semua'
      ? reports
      : reports.filter((report) => report.category === activeCategory),
    [activeCategory, reports],
  );

  const selectedReport = visibleReports.find((report) => report.id === selectedId) ?? visibleReports[0] ?? null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>L</Text></View>
          <View>
            <Text style={styles.brand}>LaporKeun</Text>
            <Text style={styles.brandCaption}>PANTAU LINGKUNGAN SEKITAR</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pusatkan peta ke lokasi pengguna"
          onPress={() => setCenterRequest((current) => current + 1)}
          style={({ pressed }) => [styles.locateButton, pressed && styles.pressed]}
        >
          <Text style={styles.locateIcon}>⌖</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.screenTitle}>Situasi sekitar</Text>
          <Text style={styles.screenSubtitle}>Bandung · {visibleReports.length} titik laporan</Text>
        </View>
        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>PEMANTAUAN</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
        {CATEGORIES.map((category) => {
          const active = category === activeCategory;
          const symbol = category === 'Semua' ? '✦' : CATEGORY_STYLE[category].symbol;
          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setActiveCategory(category);
                const firstInFilter = category === 'Semua' ? reports[0] : reports.find((report) => report.category === category);
                setSelectedId(firstInFilter?.id ?? null);
              }}
              style={({ pressed }) => [styles.categoryChip, active && styles.categoryChipActive, pressed && styles.pressed]}
            >
              <Text style={[styles.categoryChipSymbol, active && styles.categoryChipSymbolActive]}>{symbol}</Text>
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.mapFrame}>
        <ReportMapSurface
          reports={visibleReports}
          selectedId={selectedReport?.id ?? null}
          onSelectReport={setSelectedId}
          userCoordinate={location.coordinate}
          hasLocationPermission={location.permission === 'granted'}
          tracking={location.tracking}
          centerRequest={centerRequest}
        />
        <View style={styles.detailOverlay}>
          <View style={styles.detailHandle} />
          <ReportDetailCard
            report={selectedReport}
            userCoordinate={location.coordinate}
            onEnableLocation={location.startTracking}
            onOpenSettings={location.openLocationSettings}
            needsSettings={location.permission === 'denied' && !location.canAskAgain}
            locationLoading={location.loading}
            locationError={location.error}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerBrand}><View style={styles.footerPulse} /><Text style={styles.footerText}>Bersama jaga lingkungan kita</Text></View>
        <Text style={styles.footerData}>LOKAL-FIRST</Text>
      </View>
      <AppBottomNav active="map" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F9F7' },
  header: { height: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 37, height: 37, borderRadius: 13, backgroundColor: '#176B56', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#FFFFFF', fontWeight: '900', fontSize: 20 },
  brand: { color: '#172B26', fontSize: 18, lineHeight: 21, fontWeight: '900', letterSpacing: -0.4 },
  brandCaption: { color: '#8A9993', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginTop: 2 },
  locateButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7ECE9', alignItems: 'center', justifyContent: 'center' },
  locateIcon: { color: '#176B56', fontSize: 23, lineHeight: 26 },
  sectionHeading: { paddingHorizontal: 20, paddingTop: 7, paddingBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { color: '#172B26', fontSize: 24, fontWeight: '900', letterSpacing: -0.7 },
  screenSubtitle: { color: '#7D8C86', fontSize: 12, fontWeight: '600', marginTop: 3 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 99, backgroundColor: '#E8F4EF' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#31856B' },
  liveText: { color: '#31856B', fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },
  categoryList: { paddingHorizontal: 20, paddingBottom: 13, gap: 8, alignItems: 'center' },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, borderRadius: 99, backgroundColor: '#FFFFFF', borderColor: '#E7ECE9', borderWidth: 1, paddingHorizontal: 12 },
  categoryChipActive: { backgroundColor: '#176B56', borderColor: '#176B56' },
  categoryChipSymbol: { color: '#71817C', fontSize: 12, fontWeight: '900' },
  categoryChipSymbolActive: { color: '#D5F2E8' },
  categoryChipText: { color: '#5E7069', fontSize: 10, fontWeight: '700' },
  categoryChipTextActive: { color: '#FFFFFF' },
  mapFrame: { flex: 1, minHeight: 350, marginHorizontal: 12, marginBottom: 8, borderRadius: 27, overflow: 'hidden', backgroundColor: '#E7EFEB' },
  detailOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 10, paddingBottom: 10, paddingTop: 20, backgroundColor: 'rgba(245, 248, 246, 0.84)', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  detailHandle: { position: 'absolute', top: 8, alignSelf: 'center', width: 34, height: 4, backgroundColor: '#C5D0CA', borderRadius: 3 },
  footer: { height: 35, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#176B56' },
  footerText: { color: '#71817C', fontSize: 10, fontWeight: '600' },
  footerData: { color: '#A0ABA6', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  pressed: { opacity: 0.75 },
});
