import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { active: 'map' | 'report' | 'mine' };
type RouteHref = '/' | '/report' | '/my-reports';

const ITEMS = [
  { key: 'map' as const, href: '/' as RouteHref, icon: '⌖', label: 'Peta' },
  { key: 'report' as const, href: '/report' as RouteHref, icon: '+', label: 'Laporkan' },
  { key: 'mine' as const, href: '/my-reports' as RouteHref, icon: '≡', label: 'Laporan saya' },
];

export function AppBottomNav({ active }: Props) {
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      {ITEMS.map((item) => {
        const selected = active === item.key || (item.key === 'map' && pathname === '/');
        return (
          <Link key={item.key} href={item.href} asChild>
            <Pressable accessibilityRole="button" accessibilityState={{ selected }} style={styles.navItem}>
              <View style={[styles.navIcon, selected && styles.navIconActive]}><Text style={[styles.navIconText, selected && styles.navIconTextActive]}>{item.icon}</Text></View>
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { height: 72, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8EEEA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 20 },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 82, gap: 4 },
  navIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#E8F4EF' },
  navIconText: { color: '#8A9993', fontSize: 20, fontWeight: '700' },
  navIconTextActive: { color: '#176B56' },
  navLabel: { color: '#8A9993', fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: '#176B56' },
});
