import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomNav } from '@/components/AppBottomNav';
import { BANDUNG_CENTER, CATEGORY_STYLE, HAZARD_STYLE } from '@/constants/map';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useReports } from '@/hooks/useReports';
import type { HazardLevel, InfrastructureReport, ReportCategory } from '@/types/report';

const CATEGORIES: ReportCategory[] = ['Jalan berlubang', 'Jalan rusak', 'Banjir', 'Tanah longsor', 'Infrastruktur umum rusak'];
const HAZARDS: HazardLevel[] = ['Rendah', 'Sedang', 'Tinggi'];

export default function ReportScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Jalan berlubang');
  const [hazard, setHazard] = useState<HazardLevel>('Sedang');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const location = useLocationTracking();
  const { addReport } = useReports();

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin kamera diperlukan', 'Izinkan akses kamera untuk mengambil foto kondisi di lapangan.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Lengkapi laporan', 'Judul dan deskripsi perlu diisi sebelum laporan dikirim.');
      return;
    }
    if (!location.coordinate) {
      Alert.alert('Lokasi belum tersedia', 'Aktifkan lokasi terlebih dahulu agar laporan ditempatkan pada titik yang benar.');
      return;
    }

    setSubmitting(true);
    const report: InfrastructureReport = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      hazard,
      status: 'Baru',
      reportedAt: 'Baru saja',
      coordinate: location.coordinate ?? BANDUNG_CENTER,
      source: 'warga',
      photoUri,
    };
    await addReport(report);
    setSubmitting(false);
    router.replace('/my-reports');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Kembali">
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>KONTRIBUSI WARGA</Text>
              <Text style={styles.title}>Buat laporan</Text>
            </View>
            <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>01</Text></View>
          </View>

          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Bantu tandai masalah di sekitar</Text>
            <Text style={styles.introText}>Laporan yang jelas membantu warga lain lebih waspada dan memudahkan tindak lanjut.</Text>
          </View>

          <Text style={styles.label}>Kategori masalah</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((item) => (
              <Pressable key={item} onPress={() => setCategory(item)} style={[styles.choiceChip, category === item && styles.choiceChipActive]}>
                <Text style={[styles.choiceSymbol, category === item && styles.choiceTextActive]}>{CATEGORY_STYLE[item].symbol}</Text>
                <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{CATEGORY_STYLE[item].short}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Judul singkat</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Contoh: Lubang besar di dekat sekolah" placeholderTextColor="#9AA7A1" style={styles.input} maxLength={80} />

          <Text style={styles.label}>Ceritakan kondisinya</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Jelaskan lokasi, dampak, dan kondisi terbaru" placeholderTextColor="#9AA7A1" style={[styles.input, styles.textArea]} multiline textAlignVertical="top" maxLength={400} />

          <Text style={styles.label}>Tingkat bahaya</Text>
          <View style={styles.hazardRow}>
            {HAZARDS.map((item) => (
              <Pressable key={item} onPress={() => setHazard(item)} style={[styles.hazardChoice, hazard === item && { borderColor: HAZARD_STYLE[item].color, backgroundColor: `${HAZARD_STYLE[item].color}12` }]}>
                <View style={[styles.hazardDot, { backgroundColor: HAZARD_STYLE[item].color }]} />
                <Text style={[styles.hazardChoiceText, hazard === item && { color: HAZARD_STYLE[item].color }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Foto kondisi <Text style={styles.optional}>(opsional)</Text></Text>
          {photoUri ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <Pressable onPress={() => setPhotoUri(undefined)} style={styles.removePhoto}><Text style={styles.removePhotoText}>Hapus</Text></Pressable>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <Pressable onPress={takePhoto} style={styles.photoButton}><Text style={styles.photoButtonIcon}>⌾</Text><Text style={styles.photoButtonText}>Ambil foto</Text></Pressable>
              <Pressable onPress={choosePhoto} style={styles.photoButton}><Text style={styles.photoButtonIcon}>▧</Text><Text style={styles.photoButtonText}>Pilih galeri</Text></Pressable>
            </View>
          )}

          <Text style={styles.label}>Lokasi laporan</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationIcon}><Text style={styles.locationIconText}>⌖</Text></View>
            <View style={styles.locationCopy}>
              <Text style={styles.locationTitle}>{location.coordinate ? 'Lokasi perangkat siap' : 'Lokasi belum dipilih'}</Text>
              <Text style={styles.locationText}>{location.coordinate ? 'Titik laporan akan memakai posisi Anda saat ini.' : 'Diperlukan agar laporan muncul pada titik yang tepat.'}</Text>
            </View>
            <Pressable onPress={location.startTracking} disabled={location.loading} style={[styles.locationAction, location.loading && styles.disabled]}>
              <Text style={styles.locationActionText}>{location.coordinate ? 'Diperbarui' : 'Gunakan'}</Text>
            </Pressable>
          </View>
          {location.error && <Text style={styles.errorText}>{location.error}</Text>}

          <Pressable onPress={submit} disabled={submitting} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, submitting && styles.disabled]}>
            <Text style={styles.submitText}>{submitting ? 'Menyimpan…' : 'Simpan laporan'}</Text>
            <Text style={styles.submitArrow}>→</Text>
          </Pressable>
          <Text style={styles.privacyNote}>Untuk saat ini laporan disimpan di perangkat ini. Sinkronisasi server akan ditambahkan pada tahap backend.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppBottomNav active="report" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F7F9F7' },
  content: { padding: 20, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  back: { color: '#176B56', fontSize: 38, lineHeight: 34, width: 34 },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#7D8C86', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: '#172B26', fontSize: 26, fontWeight: '900', marginTop: 2 },
  headerBadge: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E8F4EF', alignItems: 'center', justifyContent: 'center' },
  headerBadgeText: { color: '#176B56', fontWeight: '900' },
  introCard: { backgroundColor: '#176B56', borderRadius: 20, padding: 18, marginBottom: 20 },
  introTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  introText: { color: '#D5F2E8', fontSize: 12, lineHeight: 18, marginTop: 5 },
  label: { color: '#304E44', fontSize: 12, fontWeight: '900', marginBottom: 9, marginTop: 14 },
  optional: { color: '#8A9993', fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 1, borderColor: '#E0E9E4', backgroundColor: '#FFFFFF', paddingHorizontal: 11, paddingVertical: 9 },
  choiceChipActive: { borderColor: '#176B56', backgroundColor: '#E8F4EF' },
  choiceSymbol: { color: '#71817C', fontWeight: '900' },
  choiceText: { color: '#5E7069', fontSize: 11, fontWeight: '800' },
  choiceTextActive: { color: '#176B56' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E9E4', borderRadius: 15, paddingHorizontal: 14, paddingVertical: 13, color: '#203A32', fontSize: 13 },
  textArea: { minHeight: 104 },
  hazardRow: { flexDirection: 'row', gap: 8 },
  hazardChoice: { flex: 1, minHeight: 45, borderWidth: 1, borderColor: '#E0E9E4', borderRadius: 14, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  hazardDot: { width: 8, height: 8, borderRadius: 4 },
  hazardChoiceText: { color: '#53645F', fontSize: 10, fontWeight: '800' },
  photoActions: { flexDirection: 'row', gap: 9 },
  photoButton: { flex: 1, borderWidth: 1, borderColor: '#D8E5DE', borderStyle: 'dashed', borderRadius: 15, minHeight: 70, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  photoButtonIcon: { color: '#176B56', fontSize: 22, fontWeight: '800' },
  photoButtonText: { color: '#53645F', fontSize: 11, fontWeight: '800', marginTop: 3 },
  photoPreviewWrap: { height: 160, borderRadius: 17, overflow: 'hidden', backgroundColor: '#EAF1ED' },
  photoPreview: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', right: 10, top: 10, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 7 },
  removePhotoText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  locationCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E9E4', borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E8F4EF', alignItems: 'center', justifyContent: 'center' },
  locationIconText: { color: '#176B56', fontSize: 20 },
  locationCopy: { flex: 1 },
  locationTitle: { color: '#304E44', fontSize: 11, fontWeight: '900' },
  locationText: { color: '#7D8C86', fontSize: 10, lineHeight: 14, marginTop: 3 },
  locationAction: { borderRadius: 10, backgroundColor: '#176B56', paddingHorizontal: 10, paddingVertical: 9 },
  locationActionText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  errorText: { color: '#C3423F', fontSize: 10, lineHeight: 14, marginTop: 7 },
  submitButton: { marginTop: 22, minHeight: 54, borderRadius: 17, backgroundColor: '#176B56', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  submitArrow: { color: '#D5F2E8', fontSize: 20, fontWeight: '900' },
  privacyNote: { color: '#8A9993', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 10 },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
});
