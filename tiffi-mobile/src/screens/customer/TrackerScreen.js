import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { deliveryAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius, fontSizes } from '../../theme';

export default function TrackerScreen() {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await deliveryAPI.getHistory(user?.userId, month, year);
        setDeliveries(res.data || []);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    load();
  }, [month, year]);

  const getDayStatus = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const items = deliveries.filter((d) => d.date === dateStr);
    if (items.length === 0) return null;
    if (items.some((d) => d.status === 'delivered')) return 'delivered';
    if (items.some((d) => d.status === 'leave')) return 'leave';
    if (items.some((d) => d.status === 'holiday')) return 'holiday';
    if (items.some((d) => d.status === 'missed')) return 'missed';
    return null;
  };

  const statusColors = { delivered: colors.success, missed: colors.error, leave: colors.warning, holiday: colors.holiday };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const stats = {
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
    missed: deliveries.filter((d) => d.status === 'missed').length,
    leave: deliveries.filter((d) => d.status === 'leave').length,
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}>
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        <TouchableOpacity onPress={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Text style={[styles.stat, { color: colors.success }]}>Delivered: {stats.delivered}</Text>
        <Text style={[styles.stat, { color: colors.error }]}>Missed: {stats.missed}</Text>
        <Text style={[styles.stat, { color: colors.warning }]}>Leave: {stats.leave}</Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendar}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Text key={i} style={styles.dayHeader}>{d}</Text>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <View key={`empty-${i}`} style={styles.dayCell} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const status = getDayStatus(day);
          return (
            <View key={day} style={[styles.dayCell, status && { backgroundColor: statusColors[status] + '33' }]}>
              {status && <View style={[styles.dot, { backgroundColor: statusColors[status] }]} />}
              <Text style={styles.dayNum}>{day}</Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(statusColors).map(([s, c]) => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: c }]} />
            <Text style={styles.legendText}>{s}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xxl, backgroundColor: colors.primary },
  arrow: { fontSize: 32, color: colors.surface, fontWeight: '300' },
  monthTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.surface },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: spacing.lg, backgroundColor: colors.surface },
  stat: { fontSize: fontSizes.small, fontWeight: '700' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: 4 },
  dayHeader: { width: '13%', textAlign: 'center', fontSize: fontSizes.small, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  dayCell: { width: '13%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: radius.small },
  dot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', top: 4 },
  dayNum: { fontSize: fontSizes.small, color: colors.textPrimary },
  legend: { flexDirection: 'row', justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: fontSizes.small, color: colors.textSecondary, textTransform: 'capitalize' },
});
