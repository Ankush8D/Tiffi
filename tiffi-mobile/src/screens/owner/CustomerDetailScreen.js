import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { customerAPI, paymentAPI, leaveAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

const STATUS_OPTIONS = ['active', 'paused', 'expired'];
const STATUS_COLORS = { active: colors.success, paused: colors.warning, expired: colors.error };

export default function CustomerDetailScreen({ navigation, route }) {
  const { customerId } = route.params;
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        customerAPI.get(customerId),
        paymentAPI.history(customerId),
      ]);
      setCustomer(cRes.data);
      setPayments(pRes.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = (status) => {
    Alert.alert('Change Status', `Set customer to ${status}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          try {
            await customerAPI.updateStatus(customerId, status);
            setCustomer(c => ({ ...c, status }));
          } catch (e) { Alert.alert('Error', 'Failed to update status'); }
        },
      },
    ]);
  };

  const deleteCustomer = () => {
    Alert.alert('Delete Customer', `Delete ${customer?.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await customerAPI.delete(customerId);
            navigation.goBack();
          } catch (e) { Alert.alert('Error', 'Failed to delete'); }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!customer) return <View style={styles.center}><Text>Customer not found</Text></View>;

  const progress = customer.tiffinsTotal > 0
    ? Math.round((customer.tiffinsRemaining / customer.tiffinsTotal) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name[0]}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{customer.name}</Text>
            <Text style={styles.sub}>{customer.customerCode} • {customer.phone}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[customer.status] }]}>
              <Text style={styles.statusText}>{customer.status?.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tiffin Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tiffin Balance</Text>
        <View style={styles.progressRow}>
          <Text style={styles.tiffinBig}>{customer.tiffinsRemaining}</Text>
          <Text style={styles.tiffinOf}>/ {customer.tiffinsTotal} remaining</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progress > 30 ? colors.success : colors.error }]} />
        </View>
        <Text style={styles.dates}>{customer.subscriptionStart} → {customer.subscriptionEnd}</Text>
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <Row label="Zone" value={customer.zone || '—'} />
        <Row label="Address" value={customer.address || '—'} />
        <Row label="Notes" value={customer.notes || '—'} />
      </View>

      {/* Change Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.statusBtn, customer.status === s && { backgroundColor: STATUS_COLORS[s] }]}
              onPress={() => customer.status !== s && changeStatus(s)}>
              <Text style={[styles.statusBtnText, customer.status === s && { color: colors.surface }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddCustomer', { customer })}>
          <Text style={styles.editBtnText}>Edit Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={deleteCustomer}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Payment History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment History</Text>
        {payments.length === 0
          ? <Text style={styles.empty}>No payments recorded</Text>
          : payments.map(p => (
            <View key={p.id} style={styles.paymentRow}>
              <View>
                <Text style={styles.payAmount}>₹{p.amount}</Text>
                <Text style={styles.paySub}>{p.paymentMode} • {p.paymentDate || 'Pending'}</Text>
              </View>
              <View style={[styles.payStatus, { backgroundColor: p.status === 'paid' ? colors.success : colors.warning }]}>
                <Text style={styles.payStatusText}>{p.status}</Text>
              </View>
            </View>
          ))
        }
      </View>

      <View style={{ height: 32 }} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingTop: 60 },
  back: { color: colors.surface, opacity: 0.8, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg },
  avatarText: { fontSize: fontSizes.h2, fontWeight: '800', color: colors.primary },
  headerInfo: { flex: 1 },
  name: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.surface },
  sub: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginVertical: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { fontSize: 11, fontWeight: '800', color: colors.surface },
  card: { margin: spacing.lg, marginBottom: 0, backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.lg, ...shadows.card },
  cardTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm },
  tiffinBig: { fontSize: 40, fontWeight: '800', color: colors.primary },
  tiffinOf: { fontSize: fontSizes.body, color: colors.textSecondary, marginLeft: spacing.sm },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: 8, borderRadius: 4 },
  dates: { fontSize: fontSizes.small, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: fontSizes.small, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: fontSizes.small, color: colors.textPrimary, fontWeight: '500', flex: 2, textAlign: 'right' },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: { flex: 1, padding: spacing.md, borderRadius: radius.medium, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statusBtnText: { fontSize: fontSizes.small, fontWeight: '600', color: colors.textSecondary },
  actionsRow: { flexDirection: 'row', margin: spacing.lg, marginBottom: 0, gap: spacing.md },
  editBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  editBtnText: { color: colors.surface, fontWeight: '700' },
  deleteBtn: { flex: 1, backgroundColor: '#FEF2F2', borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  deleteBtnText: { color: colors.error, fontWeight: '700' },
  empty: { color: colors.textSecondary, fontSize: fontSizes.small, textAlign: 'center', padding: spacing.lg },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  payAmount: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  paySub: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  payStatus: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  payStatusText: { fontSize: 11, fontWeight: '700', color: colors.surface },
});
