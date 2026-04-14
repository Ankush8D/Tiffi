import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, FlatList, SafeAreaView,
} from 'react-native';
import { LinearGradient } from '../../components/LinearGradient';
import { ownerAPI, customerAPI, deliveryAPI, paymentAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows, gradients } from '../../theme';

const STAT_CONFIG = {
  active:    { label: 'Active',    color: colors.success,  glow: colors.successGlow, icon: '●' },
  delivered: { label: 'Delivered', color: colors.info,     glow: colors.infoGlow,    icon: '▲' },
  pending:   { label: 'Pending',   color: colors.warning,  glow: colors.warningGlow, icon: '◆' },
  unpaid:    { label: 'Unpaid',    color: colors.error,    glow: colors.errorGlow,   icon: '■' },
};

// ─── Glass Card ──────────────────────────────────────────────────────────────
function GlassCard({ style, children }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
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
          const seen = new Set();
          const unique = [];
          for (const d of filtered) {
            if (!seen.has(d.customerId)) { seen.add(d.customerId); unique.push(d); }
          }
          setItems(unique);
        } else if (type === 'unpaid') {
          const res = await paymentAPI.list(now.getMonth() + 1, now.getFullYear());
          setItems((res.data || []).filter(p => p.status === 'pending' || p.status === 'partial'));
        }
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [visible, type]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sheetRow}
      onPress={() => {
        onClose();
        if (type === 'active') navigation.navigate('CustomerDetail', { customerId: item.id });
        if (type === 'unpaid') navigation.navigate('Payments');
      }}
      activeOpacity={0.7}>
      <View style={[styles.sheetAvatar, { backgroundColor: cfg.glow }]}>
        <Text style={[styles.sheetAvatarText, { color: cfg.color }]}>
          {(item.name || item.customerName || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sheetRowName}>{item.name || item.customerName}</Text>
        <Text style={styles.sheetRowSub}>
          {item.customerCode || item.paymentMode?.toUpperCase()} • {item.zone || item.status || '—'}
        </Text>
      </View>
      {type === 'active' && <Text style={[styles.sheetRowBadge, { color: cfg.color }]}>{item.tiffinsRemaining} left</Text>}
      {type === 'unpaid' && <Text style={[styles.sheetRowBadge, { color: colors.error }]}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>}
      {(type === 'delivered' || type === 'pending') && (
        <View style={[styles.pill, { backgroundColor: cfg.glow, borderColor: cfg.color }]}>
          <Text style={[styles.pillText, { color: cfg.color }]}>{type}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeaderRow}>
          <View style={[styles.sheetIconDot, { backgroundColor: cfg.glow, borderColor: cfg.color }]}>
            <Text style={{ color: cfg.color, fontSize: 14 }}>{cfg.icon}</Text>
          </View>
          <Text style={[styles.sheetTitle, { color: cfg.color }]}>{cfg.label}</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <Text style={styles.sheetCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.sheetCenter}>
            <ActivityIndicator size="large" color={cfg.color} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.sheetCenter}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎉</Text>
            <Text style={styles.emptyText}>All clear!</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View style={styles.sheetDivider} />}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheet, setSheet] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await ownerAPI.getDashboard();
      setData(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <LinearGradient colors={gradients.dark} style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </LinearGradient>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    { key: 'active',    value: data?.totalActiveCustomers ?? 0 },
    { key: 'delivered', value: data?.deliveredToday ?? 0 },
    { key: 'pending',   value: data?.pendingToday ?? 0 },
    { key: 'unpaid',    value: data?.pendingPayments ?? 0 },
  ];

  return (
    <LinearGradient colors={gradients.dark} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient colors={['#1E0A3C', '#0A0A18']} style={styles.header}>
          <SafeAreaView>
            <View style={styles.headerInner}>
              <View>
                <Text style={styles.greeting}>{greeting()} 👋</Text>
                <Text style={styles.subGreeting}>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>S</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          {stats.map(({ key, value }) => {
            const cfg = STAT_CONFIG[key];
            return (
              <TouchableOpacity key={key} onPress={() => setSheet(key)} activeOpacity={0.75} style={styles.statWrap}>
                <GlassCard style={styles.statCard}>
                  <View style={[styles.statDot, { backgroundColor: cfg.glow }]}>
                    <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '800' }}>{cfg.icon}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: cfg.color, textShadowColor: cfg.glow, textShadowRadius: 8 }]}>
                    {value}
                  </Text>
                  <Text style={styles.statLabel}>{cfg.label}</Text>
                  <View style={[styles.statBorder, { backgroundColor: cfg.color }]} />
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {[
              { label: 'Deliveries', icon: '🚴', screen: 'Delivery', color: colors.info },
              { label: 'Customers',  icon: '👥', screen: 'Customers', color: colors.success },
              { label: 'More',       icon: '⚙️', screen: 'More', color: colors.accent1 },
            ].map(a => (
              <TouchableOpacity key={a.label} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.75} style={{ flex: 1 }}>
                <GlassCard style={styles.actionCard}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Low Tiffin Alerts ── */}
        {data?.lowTiffinCustomers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️  Low Tiffin Alert</Text>
            {data.lowTiffinCustomers.map(c => (
              <TouchableOpacity key={c.id} onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id })} activeOpacity={0.75}>
                <GlassCard style={styles.alertRow}>
                  <View style={[styles.alertDot, { backgroundColor: colors.warningGlow }]}>
                    <Text style={{ color: colors.warning, fontWeight: '800' }}>{c.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertName}>{c.name}</Text>
                    <Text style={styles.alertSub}>{c.customerCode}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: colors.warningGlow, borderColor: colors.warning }]}>
                    <Text style={[styles.pillText, { color: colors.warning }]}>{c.tiffinsRemaining} left</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Expiring Soon ── */}
        {data?.expiringCustomers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅  Expiring This Week</Text>
            {data.expiringCustomers.map(c => (
              <TouchableOpacity key={c.id} onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id })} activeOpacity={0.75}>
                <GlassCard style={styles.alertRow}>
                  <View style={[styles.alertDot, { backgroundColor: colors.errorGlow }]}>
                    <Text style={{ color: colors.error, fontWeight: '800' }}>{c.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertName}>{c.name}</Text>
                    <Text style={styles.alertSub}>{c.subscriptionEnd}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: colors.errorGlow, borderColor: colors.error }]}>
                    <Text style={[styles.pillText, { color: colors.error }]}>Expiring</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      <DetailSheet type={sheet} visible={!!sheet} onClose={() => setSheet(null)} navigation={navigation} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: { paddingBottom: spacing.xl },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  greeting: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.textPrimary },
  subGreeting: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryGlow, borderWidth: 2, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  headerAvatarText: { color: colors.primary, fontWeight: '800', fontSize: fontSizes.body },

  // Glass card
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: spacing.md },
  statWrap: { width: '47%' },
  statCard: { padding: spacing.lg, alignItems: 'flex-start', overflow: 'hidden' },
  statDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  statValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  statLabel: { fontSize: fontSizes.tiny, color: colors.textSecondary, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.6 },

  // Actions
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSizes.small, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionCard: { padding: spacing.lg, alignItems: 'center' },
  actionIcon: { fontSize: 26, marginBottom: spacing.sm },
  actionLabel: { fontSize: fontSizes.tiny, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Alert rows
  alertRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  alertDot: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  alertName: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  alertSub: { fontSize: fontSizes.tiny, color: colors.textSecondary, marginTop: 2 },

  // Pill badge
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1 },
  pillText: { fontSize: fontSizes.tiny, fontWeight: '700' },

  // Sheet
  overlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: '#13132B', borderTopLeftRadius: radius.large, borderTopRightRadius: radius.large, borderTopWidth: 1, borderColor: colors.glassBorder, maxHeight: '75%', minHeight: 200 },
  sheetHandle: { width: 36, height: 4, backgroundColor: colors.glassBorder, borderRadius: 2, alignSelf: 'center', marginTop: spacing.md },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  sheetIconDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  sheetTitle: { flex: 1, fontSize: fontSizes.h3, fontWeight: '800' },
  sheetClose: { padding: spacing.sm },
  sheetCloseText: { color: colors.textSecondary, fontSize: fontSizes.body },
  sheetCenter: { alignItems: 'center', justifyContent: 'center', padding: spacing.huge },
  emptyText: { color: colors.textSecondary, fontSize: fontSizes.body },
  sheetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md },
  sheetAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sheetAvatarText: { fontWeight: '800', fontSize: fontSizes.body },
  sheetRowName: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  sheetRowSub: { fontSize: fontSizes.tiny, color: colors.textSecondary, marginTop: 2 },
  sheetRowBadge: { fontSize: fontSizes.body, fontWeight: '800' },
  sheetDivider: { height: 1, backgroundColor: colors.divider, marginLeft: 70 },
});
