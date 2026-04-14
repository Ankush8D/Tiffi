import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import useAuthStore from '../../store/authStore';
import { customerAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function CustomerProfileScreen() {
  const { user, clearAuth } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await customerAPI.get(user?.userId);
        setData(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{data?.name?.[0] || 'C'}</Text>
        </View>
        <Text style={styles.name}>{data?.name || 'Customer'}</Text>
        <Text style={styles.phone}>{data?.phone}</Text>
        <View style={[styles.statusBadge, { backgroundColor: data?.status === 'active' ? colors.success : colors.warning }]}>
          <Text style={styles.statusText}>{data?.status?.toUpperCase() || 'ACTIVE'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Row label="Customer ID" value={data?.customerCode || '—'} />
        <Row label="Zone" value={data?.zone || '—'} />
        <Row label="Address" value={data?.address || '—'} />
        <Row label="Tiffins Remaining" value={`${data?.tiffinsRemaining ?? '—'} / ${data?.tiffinsTotal ?? '—'}`} />
        <Row label="Subscription" value={`${data?.subscriptionStart || '—'} → ${data?.subscriptionEnd || '—'}`} />
      </View>

      <TouchableOpacity style={styles.logoutBtn}
        onPress={() => Alert.alert('Logout', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: clearAuth },
        ])}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 36, fontWeight: '800', color: colors.primary },
  name: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  phone: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 4 },
  statusBadge: { marginTop: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: 11, fontWeight: '800', color: colors.surface },
  card: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.lg, ...shadows.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: fontSizes.small, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: fontSizes.small, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  logoutBtn: { margin: spacing.lg, backgroundColor: colors.error, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  logoutText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
