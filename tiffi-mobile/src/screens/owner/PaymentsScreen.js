import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { paymentAPI, customerAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

const MODE_ICONS = { cash: '💵', upi: '📱', card: '💳', online: '🌐' };
const STATUS_COLORS = { paid: colors.success, partial: colors.warning, pending: colors.error };

export default function PaymentsScreen({ navigation }) {
  const [stats, setStats] = useState({ collected: 0, pendingCount: 0 });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ customerId: '', amount: '', notes: '' });
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const load = useCallback(async () => {
    try {
      const [sumRes, listRes, custRes] = await Promise.all([
        paymentAPI.summary(month, year),
        paymentAPI.list(month, year),
        customerAPI.list({ page: 0 }),
      ]);
      setStats(sumRes.data || { collected: 0, pendingCount: 0 });
      setPayments(listRes.data || []);
      setCustomers(custRes.data?.content || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const recordCash = async () => {
    if (!form.customerId || !form.amount) {
      Alert.alert('Validation', 'Customer and amount are required');
      return;
    }
    setSaving(true);
    try {
      await paymentAPI.recordCash({
        customerId: parseInt(form.customerId),
        amount: parseFloat(form.amount),
        notes: form.notes || null,
      });
      setModalVisible(false);
      setForm({ customerId: '', amount: '', notes: '' });
      setSearch('');
      setRefreshing(true);
      load();
    } catch (e) {
      Alert.alert('Error', 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.customerCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.sub}>{now.toLocaleString('default', { month: 'long' })} {year}</Text>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.statLabel}>Collected</Text>
                <Text style={styles.statAmount}>₹{Number(stats.collected).toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.error }]}>
                <Text style={styles.statLabel}>Pending</Text>
                <Text style={styles.statAmount}>{stats.pendingCount} dues</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>
        }
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Text style={{ fontSize: 20 }}>{MODE_ICONS[item.paymentMode] || '💰'}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.custName}>{item.customerName || `Customer #${item.customerId}`}</Text>
              <Text style={styles.cardSub}>
                {item.paymentMode?.toUpperCase()} • {item.paymentDate || 'Pending'}
              </Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.amount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || colors.border }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions this month</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ Record Cash</Text>
      </TouchableOpacity>

      {/* Record Cash Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Record Cash Payment</Text>

            <Text style={styles.fieldLabel}>Search Customer *</Text>
            <TextInput
              style={styles.input}
              placeholder="Name or customer code..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && !form.customerId && (
              <View style={styles.dropdown}>
                {filteredCustomers.slice(0, 5).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.dropItem}
                    onPress={() => {
                      setForm(f => ({ ...f, customerId: String(c.id) }));
                      setSearch(`${c.name} (${c.customerCode})`);
                    }}>
                    <Text style={styles.dropName}>{c.name}</Text>
                    <Text style={styles.dropCode}>{c.customerCode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Amount (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1500"
              placeholderTextColor={colors.textSecondary}
              value={form.amount}
              onChangeText={v => setForm(f => ({ ...f, amount: v }))}
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional note..."
              placeholderTextColor={colors.textSecondary}
              value={form.notes}
              onChangeText={v => setForm(f => ({ ...f, notes: v }))}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                setModalVisible(false);
                setForm({ customerId: '', amount: '', notes: '' });
                setSearch('');
              }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={recordCash} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveBtnText}>Record</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingTop: 60 },
  back: { color: colors.surface, opacity: 0.8, marginBottom: spacing.sm },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  sub: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statBox: { flex: 1, borderRadius: radius.large, padding: spacing.lg, alignItems: 'center' },
  statLabel: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.85 },
  statAmount: { fontSize: fontSizes.h3, fontWeight: '800', color: colors.surface, marginTop: 4 },
  sectionTitle: { fontSize: fontSizes.small, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', ...shadows.card },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  cardInfo: { flex: 1 },
  custName: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  notes: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2, fontStyle: 'italic' },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: fontSizes.body, fontWeight: '800', color: colors.textPrimary },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.surface, textTransform: 'uppercase' },
  empty: { padding: spacing.huge, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: fontSizes.body },
  fab: { position: 'absolute', bottom: spacing.xxl, right: spacing.xxl, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, ...shadows.card },
  fabText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xxl, paddingBottom: 40 },
  modalTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSizes.small, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: radius.medium, padding: spacing.md, fontSize: fontSizes.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  dropdown: { backgroundColor: colors.surface, borderRadius: radius.medium, borderWidth: 1, borderColor: colors.border, marginTop: 2, zIndex: 10 },
  dropItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' },
  dropName: { fontSize: fontSizes.body, color: colors.textPrimary, fontWeight: '600' },
  dropCode: { fontSize: fontSizes.small, color: colors.textSecondary },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  saveBtnText: { color: colors.surface, fontWeight: '700' },
});
