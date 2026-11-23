import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { CATEGORY_STYLE, HAZARD_STYLE } from '@/constants/map';
import type { InfrastructureReport } from '@/types/report';

type Props = {
  report: InfrastructureReport;
  selected: boolean;
  onPress: () => void;
};

export function ReportMarker({ report, selected, onPress }: Props) {
  const tone = HAZARD_STYLE[report.hazard].color;
  return (
    <Marker
      coordinate={report.coordinate}
      onPress={onPress}
      title={report.category}
      description={report.title}
      accessibilityLabel={`${report.category}, bahaya ${report.hazard}`}
      tracksViewChanges={false}
    >
      <View style={[styles.pin, { backgroundColor: tone }, selected && styles.selectedPin]}>
        <Text style={styles.symbol}>{CATEGORY_STYLE[report.category].symbol}</Text>
        <View style={[styles.severityDot, { backgroundColor: tone }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#17352E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
  },
  selectedPin: {
    transform: [{ scale: 1.15 }],
    borderWidth: 3,
  },
  symbol: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  severityDot: {
    position: 'absolute',
    width: 11,
    height: 11,
    top: -3,
    right: -4,
    borderRadius: 6,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
  },
});
