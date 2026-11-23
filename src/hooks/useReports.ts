import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { MOCK_REPORTS } from '@/data/mock-reports';
import type { InfrastructureReport } from '@/types/report';

const STORAGE_KEY = '@laporkeun/reports/v1';

function readStoredReports(value: string | null): InfrastructureReport[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((report): report is InfrastructureReport => (
      typeof report === 'object'
      && report !== null
      && typeof (report as InfrastructureReport).id === 'string'
      && typeof (report as InfrastructureReport).title === 'string'
      && (report as InfrastructureReport).source === 'warga'
    ));
  } catch {
    return [];
  }
}

export function useReports() {
  const [localReports, setLocalReports] = useState<InfrastructureReport[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!active) return;
        setLocalReports(readStoredReports(value));
        setHydrated(true);
      })
      .catch(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const addReport = useCallback(async (report: InfrastructureReport) => {
    const nextReport = { ...report, source: 'warga' as const };
    setLocalReports((current) => [nextReport, ...current]);

    try {
      const existing = readStoredReports(await AsyncStorage.getItem(STORAGE_KEY));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([nextReport, ...existing]));
    } catch {
      // The report remains visible for this session even if local persistence fails.
    }
  }, []);

  return {
    reports: [...localReports, ...MOCK_REPORTS],
    localReports,
    hydrated,
    addReport,
  };
}
