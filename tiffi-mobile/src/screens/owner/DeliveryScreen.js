import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { deliveryAPI } from '../../services/api';
import useDeliveryStore from '../../store/deliveryStore';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

const FILTERS = ['All', 'Pending', 'Delivered', 'Leave'];

export default function DeliveryScreen() {
  const { todayList, setTodayList, updateDeliveryStatus, isOffline } = useDeliveryStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await deliveryAPI.getToday();
      setTodayList(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markDelivery = async (item, status) => {
    updateDeliveryStatus(item.customerId, item.mealType, status);
    try {
      await deliveryAPI.mark({
        customerId: item.customerId,
        date: new Date().toISOString().split('T')[0],
        mealType: item.mealType,
        status,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to mark delivery');
      updateDeliveryStatus(item.customerId, item.mealType, item.status);
    }
  };

  const markAllDelivered = () => {
    Alert.alert('Mark All Delivered', 'Mark all pending customers as delivered today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          const pending = todayList.filter((i) => i.status === 'pending');
          for (const item of pending) {
            await markDelivery(item, 'delivered');
          }
        },
      },
    ]);
  };

  const filtered = todayList.filter((i) => {
    if (activeFilter === 'All') return true;
    return i.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const counts = {
    All: todayList.length,
    Pending: todayList.filter((i) => i.status === 'pending').length,
    Delivered: todayList.filter((i) => i.status === 'delivered').length,
    Leave: todayList.filter((i) => i.status === 'leave').length,
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Deliveries</Text>
        {isOffline && <Text style={styles.offlineBanner}>Offline Mode</Text>}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterBtn, activeFilter === f && styles.filterActive]} onPress={() => setActiveFilter(f)}>
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f} {counts[f] > 0 && `(${counts[f]})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => `${item.customerId}-${item.mealType}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.hasApprovedLeave && <View style={styles.leaveBanner}><Text style={styles.leaveBannerText}>On Leave Today</Text></View>}
            <View style={styles.cardContent}>
              <View style={styles.customerInfo}>
                <Text style={styles.code}>{item.customerCode}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.zone}>{item.zone} • {item.mealType}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
            {!item.hasApprovedLeave && item.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.deliverBtn} onPress={() => markDelivery(item, 'delivered')}>
                  <Text style={styles.deliverBtnText}>Delivered</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.missedBtn} onPress={() => markDelivery(item, 'missed')}>
                  <Text style={styles.missedBtnText}>Missed</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          counts.Pending > 0 ? (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllDelivered}>
              <Text style={styles.markAllText}>Mark All Delivered ({counts.Pending})</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

function StatusBadge({ status }) {
  const map = { delivered: [colors.success, 'Delivered'], missed: [colors.error, 'Missed'], leave: [colors.warning, 'Leave'], pending: [colors.border, 'Pending'] };
  const [color, label] = map[status] || [colors.border, status];
  return <View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingBottom: spacing.lg },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  offlineBanner: { backgroundColor: colors.warning, color: colors.textPrimary, padding: spacing.xs, borderRadius: radius.small, marginTop: spacing.sm, textAlign: 'center', fontWeight: '700' },
  filters: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSizes.small, color: colors.textSecondary },
  filterTextActive: { color: colors.surface, fontWeight: '700' },
  card: { margin: spacing.md, marginBottom: 0, backgroundColor: colors.surface, borderRadius: radius.medium, ...shadows.card, overflow: 'hidden' },
  leaveBanner: { backgroundColor: colors.leave, padding: spacing.xs, paddingHorizontal: spacing.md },
  leaveBannerText: { fontSize: fontSizes.small, fontWeight: '600', color: '#92400E' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  customerInfo: { flex: 1 },
  code: { fontSize: fontSizes.small, color: colors.textSecondary, fontWeight: '600' },
  name: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary, marginVertical: 2 },
  zone: { fontSize: fontSizes.small, color: colors.textSecondary },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  badgeText: { fontSize: fontSizes.small, fontWeight: '700', color: colors.surface },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  deliverBtn: { flex: 1, padding: spacing.md, alignItems: 'center', backgroundColor: '#F0FDF4' },
  deliverBtnText: { color: colors.success, fontWeight: '700', fontSize: fontSizes.small },
  missedBtn: { flex: 1, padding: spacing.md, alignItems: 'center', backgroundColor: '#FEF2F2', borderLeftWidth: 1, borderLeftColor: colors.border },
  missedBtnText: { color: colors.error, fontWeight: '700', fontSize: fontSizes.small },
  markAllBtn: { margin: spacing.lg, backgroundColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  markAllText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
