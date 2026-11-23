# LaporKeun — MVP lokal

Aplikasi mobile React Native + Expo untuk memantau dan membuat laporan kondisi infrastruktur/bencana di sekitar Bandung. Versi ini sudah memiliki peta native, fallback web yang aman, alur buat laporan, foto, lokasi, serta penyimpanan lokal di perangkat.

## Audit awal

Repository saat mulai dikerjakan kosong: tidak ada `package.json`, lockfile, source, maupun konfigurasi framework. Proyek dibuat menggunakan template Expo Router + TypeScript. Stack saat ini: Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript 6, Expo Router, `react-native-maps`, `expo-location`, `expo-image-picker`, dan Async Storage. Paket Expo disinkronkan menggunakan `npx expo install --fix`.

Lint awal menambahkan ESLint dan `eslint-config-expo` karena template tidak menyertakan konfigurasi lint. Audit npm menemukan isu high pada `decode-uri-component` transitif di Expo Router; `package.json` memakai override patch `^0.5.1` yang tervalidasi lewat lockfile dan dependency tree. Audit terakhir masih melaporkan 11 isu moderate tanpa temuan high/critical (4 moderate pada dependency produksi/tooling Expo dan 7 pada tooling pengembangan). Perbaikan otomatis npm meminta upgrade/downgrade lintas SDK; itu tidak diterapkan agar pasangan dependency SDK tetap selaras.

## Menjalankan aplikasi

```sh
npm install
npx expo start
```

Buka proyek melalui Expo Go di Android/iOS dan berikan izin lokasi saat diminta. Pilih “Aktifkan” pada kartu laporan untuk meminta izin dan memulai pembaruan posisi foreground. Navigasi utama berisi Peta, Laporkan, dan Laporan saya. Untuk memeriksa tipe: `npx tsc --noEmit`; untuk lint: `npm run lint`; untuk audit konfigurasi: `npx expo-doctor`.

Peta native aktif pada Android/iOS. Browser menampilkan fallback daftar laporan karena `react-native-maps` adalah komponen native. Import peta dipisahkan menggunakan `ReportMapSurface.native.tsx` dan `ReportMapSurface.web.tsx`, sehingga modul native tidak lagi masuk ke bundle web. Expo Go menyediakan konfigurasi peta untuk pengembangan; build Android mandiri/produksi memerlukan Google Maps API key yang dibatasi sesuai package dan sertifikat. Jangan simpan key di repository; pasok melalui konfigurasi build/environment saat milestone deployment.

## Arsitektur

- `src/app/`: route Expo Router dan shell aplikasi.
- `src/components/`: navigasi bawah, marker peta, kartu detail, dan surface peta per platform.
- `src/hooks/useLocationTracking.ts`: state izin, service GPS, posisi, error, loading, subscription foreground, dan cleanup.
- `src/hooks/useReports.ts`: laporan lokal warga dengan persistensi Async Storage.
- `src/types/`: tipe koordinat, kategori, bahaya, status, dan laporan.
- `src/constants/`: pusat peta Bandung dan gaya kategori/bahaya.
- `src/data/mock-reports.ts`: lima laporan demonstrasi; seluruhnya berlabel data simulasi.
- `src/utils/distance.ts`: validasi koordinat, Haversine, dan format meter/kilometer.

## Pelacakan lokasi

`useLocationTracking` memeriksa izin foreground dan layanan lokasi ketika layar dibuka, tetapi meminta izin hanya setelah pengguna menekan tombol. Setelah izin dan layanan tersedia, hook mencoba posisi terakhir untuk respons cepat, membaca posisi terkini, lalu berlangganan `watchPositionAsync`. Jika izin ditolak, GPS nonaktif, atau pembacaan gagal, kartu menampilkan instruksi yang sesuai. Jika izin tidak dapat diminta lagi, tombol membuka pengaturan aplikasi. Subscription dihapus saat tracking dihentikan atau layar dilepas; callback async yang selesai setelah unmount juga langsung dibersihkan.

Interval perpindahan disesuaikan dengan platform dan presisi izin: posisi presisi memakai 20 m (iOS) atau 30 m (Android); posisi perkiraan memakai 60 m (iOS) atau 100 m (Android). Jarak lebih besar untuk perkiraan mencegah pembaruan peta berulang dari noise posisi yang memang tidak akurat. Android juga diberi batas waktu minimum 10 detik antar-update. Ini pelacakan foreground untuk layar peta, bukan background tracking.

## Jarak dan data

Haversine menerima lintang/bujur dalam rentang valid, mengembalikan jarak dalam meter, lalu ditampilkan dalam meter untuk jarak di bawah 1 km dan kilometer dengan satu angka desimal untuk jarak yang lebih jauh. Nilai tersebut adalah jarak garis lurus di permukaan bumi, bukan rute jalan. Jika koordinat tidak valid, utilitas melempar `RangeError` alih-alih menampilkan jarak menyesatkan.

Marker memiliki simbol kategori dan tingkat bahaya: rendah, sedang, atau tinggi; tiap tingkat dibedakan dengan bentuk/teks serta warna. Menekan marker memilih laporan dan memperbarui kartu detail dengan kategori, deskripsi, status, tingkat bahaya, jarak, dan label data simulasi.

## Status dan batasan MVP

- Laporan warga tersimpan lokal pada perangkat, belum terkirim ke server.
- Status laporan awal selalu `Baru`; dashboard petugas dan verifikasi belum terhubung.
- Foto menyimpan URI lokal; upload cloud belum tersedia.
- Tracking lokasi tetap foreground untuk layar peta, bukan background tracking.

## Tahap berikutnya

- Backend/API untuk laporan nyata beserta autentikasi dan otorisasi.
- Alur verifikasi, pembaruan penanganan, dan dokumentasi sebelum/sesudah.
- Sinkronisasi real-time/notifikasi bila diperlukan.
- Konfigurasi key peta dan build distribusi untuk Android/iOS.
