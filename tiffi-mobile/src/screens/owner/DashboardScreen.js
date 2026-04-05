import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { ownerAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await ownerAPI.getDashboard();
      setData(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Active" value={data?.totalActiveCustomers ?? 0} color={colors.success} />
        <StatCard label="Delivered" value={data?.deliveredToday ?? 0} color={colors.primary} />
        <StatCard label="Pending" value={data?.pendingToday ?? 0} color={colors.warning} />
        <StatCard label="Unpaid" value={data?.pendingPayments ?? 0} color={colors.error} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionBtn label="Deliveries" emoji="🚴" onPress={() => navigation.navigate('Delivery')} />
          <ActionBtn label="Customers" emoji="👥" onPress={() => navigation.navigate('Customers')} />
          <ActionBtn label="Payments" emoji="💰" onPress={() => navigation.navigate('More')} />
        </View>
      </View>

      {/* Low Tiffin Alerts */}
      {data?.lowTiffinCustomers?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Low Tiffin Alert</Text>
          {data.lowTiffinCustomers.map((c) => (
            <View key={c.id} style={styles.alertCard}>
              <Text style={styles.alertName}>{c.name} ({c.customerCode})</Text>
              <Text style={styles.alertBadge}>{c.tiffinsRemaining} left</Text>
            </View>
          ))}
        </View>
      )}

      {/* Expiring Soon */}
      {data?.expiringCustomers?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiring This Week</Text>
          {data.expiringCustomers.map((c) => (
            <View key={c.id} style={styles.alertCard}>
              <Text style={styles.alertName}>{c.name} ({c.customerCode})</Text>
              <Text style={[styles.alertBadge, { backgroundColor: colors.warning }]}>Expires {c.subscriptionEnd}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({ label, emoji, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { padding: spacing.xxl, paddingBottom: spacing.lg, backgroundColor: colors.primary },
  greeting: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  date: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.md, alignItems: 'center', borderTopWidth: 3, ...shadows.card },
  statValue: { fontSize: fontSizes.h2, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  section: { padding: spacing.lg, paddingTop: spacing.sm },
  sectionTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center', ...shadows.card },
  actionEmoji: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSizes.small, fontWeight: '600', color: colors.textPrimary },
  alertCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  alertName: { fontSize: fontSizes.body, color: colors.textPrimary, fontWeight: '500' },
  alertBadge: { backgroundColor: colors.error, color: colors.surface, fontSize: fontSizes.small, fontWeight: '700', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
});
