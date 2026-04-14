import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, FlatList, SafeAreaView,
} from 'react-native';
import { ownerAPI, customerAPI, deliveryAPI, paymentAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

// ─── Stat detail configs ────────────────────────────────────────────────────
const STAT_CONFIG = {
  active:    { label: 'Active Customers', color: colors.success,  emoji: '✅' },
  delivered: { label: 'Delivered Today',  color: colors.primary,  emoji: '🚴' },
  pending:   { label: 'Pending Today',    color: colors.warning,  emoji: '⏳' },
  unpaid:    { label: 'Unpaid / Due',     color: colors.error,    emoji: '💸' },
};

// ─── Bottom sheet ────────────────────────────────────────────────────────────
function DetailSheet({ type, visible, onClose, navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const cfg = STAT_CONFIG[type] || {};

  const now = new Date();

  useEffect(() => {
    if (!visible || !type) return;
    setLoading(true);
    setItems([]);

    const fetch = async () => {
      try {
        if (type === 'active') {
          const res = await customerAPI.list({ status: 'active', page: 0 });
          setItems(res.data?.content || []);
        } else if (type === 'delivered' || type === 'pending') {
          const res = await deliveryAPI.getToday();
          const all = res.data || [];
          const filtered = all.filter(d => d.status === (type === 'delivered' ? 'delivered' : 'pending'));
          // Deduplicate by customerId — show one row per customer
          const seen = new Set();
          const unique = [];
          for (const d of filtered) {
            if (!seen.has(d.customerId)) {
              seen.add(d.customerId);
              unique.push(d);
            }
          }
          setItems(unique);
        } else if (type === 'unpaid') {
          const res = await paymentAPI.list(now.getMonth() + 1, now.getFullYear());
          const all = res.data || [];
          setItems(all.filter(p => p.status === 'pending' || p.status === 'partial'));
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [visible, type]);

  const renderItem = ({ item }) => {
    if (type === 'active') {
      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => { onClose(); navigation.navigate('CustomerDetail', { customerId: item.id }); }}>
          <View style={[styles.rowAvatar, { backgroundColor: colors.success + '22' }]}>
            <Text style={[styles.rowAvatarText, { color: colors.success }]}>{item.name?.[0]}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowSub}>{item.customerCode} • {item.zone || 'No zone'}</Text>
          </View>
          <Text style={styles.rowRight}>{item.tiffinsRemaining} left</Text>
        </TouchableOpacity>
      );
    }
    if (type === 'delivered') {
      return (
        <View style={styles.row}>
          <View style={[styles.rowAvatar, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.rowAvatarText, { color: colors.primary }]}>{item.name?.[0]}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowSub}>{item.customerCode} • {item.zone || '—'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={styles.badgeText}>Delivered</Text>
          </View>
        </View>
      );
    }
    if (type === 'pending') {
      return (
        <View style={styles.row}>
          <View style={[styles.rowAvatar, { backgroundColor: colors.warning + '33' }]}>
            <Text style={[styles.rowAvatarText, { color: colors.warning }]}>{item.name?.[0]}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowSub}>{item.customerCode} • {item.zone || '—'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.warning }]}>
            <Text style={styles.badgeText}>Pending</Text>
          </View>
        </View>
      );
    }
    if (type === 'unpaid') {
      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => { onClose(); navigation.navigate('Payments'); }}>
          <View style={[styles.rowAvatar, { backgroundColor: colors.error + '22' }]}>
            <Text style={[styles.rowAvatarText, { color: colors.error }]}>{item.customerName?.[0] || '?'}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName}>{item.customerName}</Text>
            <Text style={styles.rowSub}>{item.paymentMode?.toUpperCase()} • {item.status}</Text>
          </View>
          <Text style={[styles.rowRight, { color: colors.error }]}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetEmoji}>{cfg.emoji}</Text>
          <Text style={[styles.sheetTitle, { color: cfg.color }]}>{cfg.label}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.sheetCenter}>
            <ActivityIndicator size="large" color={cfg.color} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.sheetCenter}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>Nothing here!</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(null); // 'active' | 'delivered' | 'pending' | 'unpaid'

  const load = useCallback(async () => {
    try {
      const res = await ownerAPI.getDashboard();
      setData(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.date}>{new Date().toDateString()}</Text>
        </View>

        {/* Stats Row — now tappable */}
        <View style={styles.statsRow}>
          <StatCard label="Active"    value={data?.totalActiveCustomers ?? 0} color={colors.success} onPress={() => setSheet('active')} />
          <StatCard label="Delivered" value={data?.deliveredToday ?? 0}       color={colors.primary} onPress={() => setSheet('delivered')} />
          <StatCard label="Pending"   value={data?.pendingToday ?? 0}         color={colors.warning} onPress={() => setSheet('pending')} />
          <StatCard label="Unpaid"    value={data?.pendingPayments ?? 0}      color={colors.error}   onPress={() => setSheet('unpaid')} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <ActionBtn label="Deliveries" emoji="🚴" onPress={() => navigation.navigate('Delivery')} />
            <ActionBtn label="Customers"  emoji="👥" onPress={() => navigation.navigate('Customers')} />
            <ActionBtn label="Payments"   emoji="💰" onPress={() => navigation.navigate('Payments')} />
          </View>
        </View>

        {/* Low Tiffin Alerts */}
        {data?.lowTiffinCustomers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Low Tiffin Alert</Text>
            {data.lowTiffinCustomers.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.alertCard}
                onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id })}>
                <Text style={styles.alertName}>{c.name} ({c.customerCode})</Text>
                <Text style={styles.alertBadge}>{c.tiffinsRemaining} left</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Expiring Soon */}
        {data?.expiringCustomers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expiring This Week</Text>
            {data.expiringCustomers.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.alertCard}
                onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id })}>
                <Text style={styles.alertName}>{c.name} ({c.customerCode})</Text>
                <Text style={[styles.alertBadge, { backgroundColor: colors.warning }]}>Expires {c.subscriptionEnd}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <DetailSheet
        type={sheet}
        visible={!!sheet}
        onClose={() => setSheet(null)}
        navigation={navigation}
      />
    </>
  );
}

function StatCard({ label, value, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderTopColor: color }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statTap, { color }]}>tap ›</Text>
    </TouchableOpacity>
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
  statTap: { fontSize: 9, fontWeight: '600', marginTop: 4, opacity: 0.7 },

  section: { padding: spacing.lg, paddingTop: spacing.sm },
  sectionTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center', ...shadows.card },
  actionEmoji: { fontSize: 28, marginBottom: spacing.xs },
  actionLabel: { fontSize: fontSizes.small, fontWeight: '600', color: colors.textPrimary },
  alertCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  alertName: { fontSize: fontSizes.body, color: colors.textPrimary, fontWeight: '500' },
  alertBadge: { backgroundColor: colors.error, color: colors.surface, fontSize: fontSizes.small, fontWeight: '700', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, overflow: 'hidden' },

  // Sheet styles
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '75%', minHeight: 200 },
  handle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.xs },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetEmoji: { fontSize: 20, marginRight: spacing.sm },
  sheetTitle: { flex: 1, fontSize: fontSizes.h3, fontWeight: '700' },
  closeBtn: { padding: spacing.sm },
  closeBtnText: { fontSize: fontSizes.body, color: colors.textSecondary, fontWeight: '600' },
  sheetCenter: { alignItems: 'center', justifyContent: 'center', padding: spacing.huge },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { fontSize: fontSizes.body, color: colors.textSecondary },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  rowAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  rowAvatarText: { fontWeight: '800', fontSize: fontSizes.body },
  rowInfo: { flex: 1 },
  rowName: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  rowRight: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  badge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.surface },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
});
