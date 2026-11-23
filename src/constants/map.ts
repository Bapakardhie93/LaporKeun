import type { Coordinate, HazardLevel, ReportCategory } from '@/types/report';

export const BANDUNG_CENTER: Coordinate = {
  latitude: -6.9175,
  longitude: 107.6191,
};

export const CATEGORY_STYLE: Record<ReportCategory, { symbol: string; short: string }> = {
  'Jalan berlubang': { symbol: '◉', short: 'Lubang' },
  'Jalan rusak': { symbol: '⌁', short: 'Jalan' },
  Banjir: { symbol: '≈', short: 'Banjir' },
  'Tanah longsor': { symbol: '▲', short: 'Longsor' },
  'Infrastruktur umum rusak': { symbol: '▦', short: 'Fasilitas' },
};

export const HAZARD_STYLE: Record<HazardLevel, { color: string; label: string }> = {
  Rendah: { color: '#31856B', label: '● Rendah' },
  Sedang: { color: '#C68017', label: '▲ Sedang' },
  Tinggi: { color: '#C3423F', label: '■ Tinggi' },
};
