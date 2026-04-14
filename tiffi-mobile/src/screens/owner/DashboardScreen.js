import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { ownerAPI, customerAPI, deliveryAPI, paymentAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { GradBg, OrbDecor } from '../../components/Grad';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { spacing, fontSizes, fonts, radius } from '../../theme';

// ─── Bottom Sheet ──────────────────────────────────────────────────────────────
function DetailSheet({ type, visible, onClose, navigation }) {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  const STAT_CONFIG = {
    active:    { label: 'Active',    colorKey: 'success' },
    delivered: { label: 'Delivered', colorKey: 'info' },
    pending:   { label: 'Pending',   colorKey: 'warning' },
    unpaid:    { label: 'Unpaid',    colorKey: 'error' },
  };

  const cfg = STAT_CONFIG[type] || {};
  const accentColor = cfg.colorKey ? theme[cfg.colorKey] : theme.primary;

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
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.md }}
      onPress={() => {
        onClose();
        if (type === 'active') navigation.navigate('CustomerDetail', { customerId: item.id });
        if (type === 'unpaid') navigation.navigate('Payments');
      }}
      activeOpacity={0.7}>
      <Avatar name={item.name || item.customerName || '?'} size={42} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.semibold }}>{item.name || item.customerName}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2 }}>
          {item.customerCode || item.paymentMode?.toUpperCase()} • {item.zone || item.status || '—'}
        </Text>
      </View>
      {type === 'active' && (
        <Text style={{ color: accentColor, fontSize: fontSizes.sm, fontFamily: fonts.bold }}>{item.tiffinsRemaining} left</Text>
      )}
      {type === 'unpaid' && (
        <Text style={{ color: theme.error, fontSize: fontSizes.body, fontFamily: fonts.bold }}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
      )}
      {(type === 'delivered' || type === 'pending') && (
        <Badge status={type} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: theme.overlay }} activeOpacity={1} onPress={onClose} />
      <View style={{
        backgroundColor: theme.sheetBg,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        borderTopWidth: 1,
        borderColor: theme.border,
        maxHeight: '75%',
        minHeight: 200,
      }}>
        <View style={{ width: 36, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginTop: spacing.md }} />
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
          borderBottomWidth: 1, borderBottomColor: theme.border,
        }}>
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: cfg.colorKey ? theme[cfg.colorKey + 'Light'] : theme.primaryLight,
            borderWidth: 1, borderColor: accentColor + '55',
            justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm,
          }}>
            <Text style={{ fontSize: 14 }}>
              {type === 'active' ? '●' : type === 'delivered' ? '✓' : type === 'pending' ? '◆' : '₹'}
            </Text>
          </View>
          <Text style={{ flex: 1, color: accentColor, fontSize: fontSizes.h3, fontFamily: fonts.bold }}>{cfg.label}</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: spacing.sm }}>
            <Text style={{ color: theme.textSecondary, fontSize: fontSizes.body, fontFamily: fonts.regular }}>✕</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.huge }}>
            <ActivityIndicator size="large" color={accentColor} />
          </View>
        ) : items.length === 0 ? (
          <EmptyState emoji="🎉" title="All clear!" />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.border, marginLeft: 70 }} />}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const { theme, isDark } = useTheme();
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
    <GradBg colors={isDark ? ['#1A0A2E', '#0B0E1A'] : ['#FFFFFF', theme.background]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </GradBg>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = [
    { key: 'active',    value: data?.totalActiveCustomers ?? 0, colorKey: 'success', icon: '👥', label: 'Active' },
    { key: 'delivered', value: data?.deliveredToday ?? 0,       colorKey: 'info',    icon: '✅', label: 'Delivered' },
    { key: 'pending',   value: data?.pendingToday ?? 0,         colorKey: 'warning', icon: '⏳', label: 'Pending' },
    { key: 'unpaid',    value: data?.pendingPayments ?? 0,      colorKey: 'error',   icon: '💰', label: 'Unpaid' },
  ];

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <ScreenHeader
          title={`${greeting()} 👋`}
          subtitle={dateStr}
          right={
            <Avatar name="S" size={38} style={{ marginRight: spacing.sm }} />
          }
        />

        {/* ── Stats Grid ── */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
          {stats.map(({ key, value, colorKey, icon, label }) => {
            const color = theme[colorKey];
            const colorLight = theme[colorKey + 'Light'];
            return (
              <TouchableOpacity key={key} onPress={() => setSheet(key)} activeOpacity={0.75} style={{ width: '47%' }}>
                <Card style={{ padding: spacing.lg, alignItems: 'flex-start', overflow: 'hidden' }}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: colorLight,
                    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
                  }}>
                    <Text style={{ fontSize: 16 }}>{icon}</Text>
                  </View>
                  <Text style={{ fontSize: 36, fontFamily: fonts.extrabold, color, letterSpacing: -1 }}>
                    {value}
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: theme.textSecondary, fontFamily: fonts.semibold, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                  </Text>
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: color, opacity: 0.6 }} />
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Quick Actions ── */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Text style={{ fontSize: fontSizes.xs, fontFamily: fonts.bold, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {[
              { label: 'Deliveries', icon: '🚴', screen: 'Delivery', colorKey: 'info' },
              { label: 'Customers',  icon: '👥', screen: 'Customers', colorKey: 'success' },
              { label: 'More',       icon: '⚙️', screen: 'More', colorKey: 'warning' },
            ].map(a => (
              <TouchableOpacity key={a.label} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.75} style={{ flex: 1 }}>
                <Card style={{ padding: spacing.lg, alignItems: 'center' }}>
                  <Text style={{ fontSize: 26, marginBottom: spacing.sm }}>{a.icon}</Text>
                  <Text style={{ fontSize: fontSizes.xs, fontFamily: fonts.bold, color: theme[a.colorKey], textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {a.label}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Low Tiffin Alerts ── */}
        {data?.lowTiffinCustomers?.length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <Text style={{ fontSize: fontSizes.xs, fontFamily: fonts.bold, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md }}>
              ⚠️  Low Tiffin Alert
            </Text>
            {data.lowTiffinCustomers.map(c => (
              <TouchableOpacity key={c.id} onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id })} activeOpacity={0.75} style={{ marginBottom: spacing.sm }}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md }}>
                  <Avatar name={c.name} size={38} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.semibold }}>{c.name}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2 }}>{c.customerCode}</Text>
                  </View>
                  <Badge label={`${c.tiffinsRemaining} left`} status="paused" />
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Expiring Soon ── */}
        {data?.expiringCustomers?.length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <Text style={{ fontSize: fontSizes.xs, fontFamily: fonts.bold, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md }}>
              📅  Expiring This Week
            </Text>
            {data.expiringCustomers.map(c => (
              <TouchableOpacity key={c.id} onPress={() => navigation.navigate('CustomerDetail', { customerId: c.id })} activeOpacity={0.75} style={{ marginBottom: spacing.sm }}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md }}>
                  <Avatar name={c.name} size={38} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.semibold }}>{c.name}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2 }}>{c.subscriptionEnd}</Text>
                  </View>
                  <Badge label="Expiring" status="expired" />
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      <DetailSheet type={sheet} visible={!!sheet} onClose={() => setSheet(null)} navigation={navigation} />
    </GradBg>
  );
}
