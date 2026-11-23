import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav } from '@/components/AppBottomNav';
import { CATEGORY_STYLE, HAZARD_STYLE } from '@/constants/map';
import { useReports } from '@/hooks/useReports';

export default function MyReportsScreen() {
  const { localReports, hydrated } = useReports();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>RIWAYAT KONTRIBUSI</Text>
            <Text style={styles.title}>Laporan saya</Text>
          </View>
          <View style={styles.countBadge}><Text style={styles.countText}>{localReports.length}</Text></View>
        </View>

        <View style={styles.summaryCard}>
          <View><Text style={styles.summaryLabel}>TOTAL LAPORAN</Text><Text style={styles.summaryValue}>{localReports.length}</Text></View>
          <View style={styles.summaryDivider} />
          <View><Text style={styles.summaryLabel}>STATUS AKTIF</Text><Text style={styles.summaryValue}>{localReports.filter((report) => report.status !== 'Selesai').length}</Text></View>
          <View style={styles.summaryIcon}><Text style={styles.summaryIconText}>✓</Text></View>
        </View>

        {!hydrated ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>Memuat laporan…</Text></View>
        ) : localReports.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>≡</Text></View>
            <Text style={styles.emptyTitle}>Belum ada laporan pribadi</Text>
            <Text style={styles.emptyText}>Temukan masalah di sekitar dan bantu warga lain dengan membuat laporan pertama.</Text>
            <Pressable onPress={() => router.push('/report')} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Buat laporan</Text></Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {localReports.map((report) => {
              const hazard = HAZARD_STYLE[report.hazard];
              return (
                <View key={report.id} style={styles.reportCard}>
                  {report.photoUri && <Image source={{ uri: report.photoUri }} style={styles.reportImage} />}
                  <View style={styles.reportBody}>
                    <View style={styles.reportTopLine}>
                      <View style={styles.categoryPill}><Text style={styles.categorySymbol}>{CATEGORY_STYLE[report.category].symbol}</Text><Text style={styles.categoryText}>{CATEGORY_STYLE[report.category].short}</Text></View>
                      <View style={[styles.statusPill, { backgroundColor: `${hazard.color}15` }]}><Text style={[styles.statusText, { color: hazard.color }]}>{report.status}</Text></View>
                    </View>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportDescription} numberOfLines={2}>{report.description}</Text>
                    <Text style={styles.reportDate}>{report.reportedAt} · {report.hazard}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      <AppBottomNav active="mine" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F9F7' },
  content: { padding: 20, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: '#7D8C86', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#172B26', fontSize: 26, fontWeight: '900', marginTop: 2 },
  countBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#176B56', alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  summaryCard: { backgroundColor: '#E8F4EF', borderRadius: 20, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  summaryLabel: { color: '#5D776D', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  summaryValue: { color: '#176B56', fontSize: 24, fontWeight: '900', marginTop: 3 },
  summaryDivider: { width: 1, height: 35, backgroundColor: '#C9E1D6', marginHorizontal: 22 },
  summaryIcon: { marginLeft: 'auto', width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { color: '#31856B', fontSize: 20, fontWeight: '900' },
  list: { gap: 12 },
  reportCard: { backgroundColor: '#FFFFFF', borderRadius: 19, overflow: 'hidden', borderWidth: 1, borderColor: '#E7ECE9' },
  reportImage: { width: '100%', height: 150, backgroundColor: '#EAF1ED' },
  reportBody: { padding: 15 },
  reportTopLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF5F2', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  categorySymbol: { color: '#176B56', fontWeight: '900', fontSize: 13 },
  categoryText: { color: '#31594E', fontSize: 11, fontWeight: '800' },
  statusPill: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 10, fontWeight: '900' },
  reportTitle: { color: '#172B26', fontSize: 16, lineHeight: 21, fontWeight: '900', marginTop: 12 },
  reportDescription: { color: '#71817C', fontSize: 12, lineHeight: 18, marginTop: 4 },
  reportDate: { color: '#98A39F', fontSize: 10, fontWeight: '700', marginTop: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, padding: 28, minHeight: 270 },
  emptyIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: '#E8F4EF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyIconText: { color: '#176B56', fontSize: 28, fontWeight: '900' },
  emptyTitle: { color: '#203A32', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  emptyText: { color: '#7D8C86', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  emptyButton: { backgroundColor: '#176B56', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, marginTop: 17 },
  emptyButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
});
