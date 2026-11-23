export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type ReportCategory =
  | 'Jalan berlubang'
  | 'Jalan rusak'
  | 'Banjir'
  | 'Tanah longsor'
  | 'Infrastruktur umum rusak';

export type HazardLevel = 'Rendah' | 'Sedang' | 'Tinggi';
export type ReportStatus = 'Baru' | 'Dalam penanganan' | 'Selesai';
export type ReportSource = 'simulasi' | 'warga';

export type InfrastructureReport = {
  id: string;
  title: string;
  category: ReportCategory;
  description: string;
  coordinate: Coordinate;
  hazard: HazardLevel;
  status: ReportStatus;
  reportedAt: string;
  source?: ReportSource;
  photoUri?: string;
};
