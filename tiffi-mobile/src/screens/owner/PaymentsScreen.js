import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { paymentAPI, customerAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { GradBg } from '../../components/Grad';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { spacing, fontSizes, fonts, radius, shadows } from '../../theme';

const MODE_ICONS = { cash: '💵', upi: '📱', card: '💳', online: '🌐' };

export default function PaymentsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
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
  const monthLabel = now.toLocaleString('default', { month: 'long' });

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

  if (loading) return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </GradBg>
  );

  return (
    <GradBg colors={isDark ? ['#0B0E1A', '#0B0E1A'] : [theme.background, theme.background]} style={{ flex: 1 }}>
      <ScreenHeader
        title="Payments"
        subtitle={`${monthLabel} ${year}`}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: theme.primary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: 20,
              marginRight: spacing.sm,
            }}
            activeOpacity={0.8}>
            <Text style={{ color: '#FFF', fontSize: fontSizes.sm, fontFamily: fonts.bold }}>+ Record</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={payments}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl }}>
              <Card style={{ flex: 1, padding: spacing.lg, alignItems: 'center', overflow: 'hidden' }}>
                <Text style={{ fontSize: fontSizes.xs, color: theme.textSecondary, fontFamily: fonts.semibold, textTransform: 'uppercase', letterSpacing: 0.5 }}>Collected</Text>
                <Text style={{ fontSize: fontSizes.h2, fontFamily: fonts.extrabold, color: theme.success, marginTop: 4 }}>
                  ₹{Number(stats.collected).toLocaleString('en-IN')}
                </Text>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: theme.success, opacity: 0.6 }} />
              </Card>
              <Card style={{ flex: 1, padding: spacing.lg, alignItems: 'center', overflow: 'hidden' }}>
                <Text style={{ fontSize: fontSizes.xs, color: theme.textSecondary, fontFamily: fonts.semibold, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending</Text>
                <Text style={{ fontSize: fontSizes.h2, fontFamily: fonts.extrabold, color: theme.error, marginTop: 4 }}>
                  {stats.pendingCount} dues
                </Text>
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: theme.error, opacity: 0.6 }} />
              </Card>
            </View>
            <Text style={{ fontSize: fontSizes.xs, fontFamily: fonts.bold, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md }}>
              Recent Transactions
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, gap: spacing.md }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: theme.surface,
              borderWidth: 1, borderColor: theme.border,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 20 }}>{MODE_ICONS[item.paymentMode] || '💰'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.semibold }}>
                {item.customerName || `Customer #${item.customerId}`}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2 }}>
                {item.paymentMode?.toUpperCase()} • {item.paymentDate || 'Pending'}
              </Text>
              {item.notes ? (
                <Text style={{ color: theme.textMuted, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2, fontStyle: 'italic' }}>
                  {item.notes}
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
              <Text style={{ color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.extrabold }}>
                ₹{Number(item.amount).toLocaleString('en-IN')}
              </Text>
              <Badge status={item.status} />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState emoji="💳" title="No transactions" subtitle="No transactions recorded this month" />
        }
      />

      {/* Record Cash Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.overlay }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{
            backgroundColor: theme.sheetBg,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: spacing.xxl,
            paddingBottom: 40,
            borderTopWidth: 1,
            borderColor: theme.border,
          }}>
            <Text style={{ fontSize: fontSizes.h3, fontFamily: fonts.bold, color: theme.text, marginBottom: spacing.lg }}>
              Record Cash Payment
            </Text>

            <Text style={{ fontSize: fontSizes.sm, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: spacing.xs }}>
              Search Customer *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.inputBg,
                borderRadius: radius.md,
                padding: spacing.md,
                fontSize: fontSizes.body,
                fontFamily: fonts.regular,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.inputBorder,
              }}
              placeholder="Name or customer code..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && !form.customerId && (
              <View style={{
                backgroundColor: theme.sheetBg,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: theme.border,
                marginTop: 2,
                zIndex: 10,
              }}>
                {filteredCustomers.slice(0, 5).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={{
                      padding: spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => {
                      setForm(f => ({ ...f, customerId: String(c.id) }));
                      setSearch(`${c.name} (${c.customerCode})`);
                    }}>
                    <Text style={{ fontSize: fontSizes.body, color: theme.text, fontFamily: fonts.semibold }}>{c.name}</Text>
                    <Text style={{ fontSize: fontSizes.sm, color: theme.textSecondary, fontFamily: fonts.regular }}>{c.customerCode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={{ fontSize: fontSizes.sm, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md }}>
              Amount (₹) *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.inputBg,
                borderRadius: radius.md,
                padding: spacing.md,
                fontSize: fontSizes.body,
                fontFamily: fonts.regular,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.inputBorder,
              }}
              placeholder="e.g. 1500"
              placeholderTextColor={theme.textMuted}
              value={form.amount}
              onChangeText={v => setForm(f => ({ ...f, amount: v }))}
              keyboardType="number-pad"
            />

            <Text style={{ fontSize: fontSizes.sm, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md }}>
              Notes
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.inputBg,
                borderRadius: radius.md,
                padding: spacing.md,
                fontSize: fontSizes.body,
                fontFamily: fonts.regular,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.inputBorder,
              }}
              placeholder="Optional note..."
              placeholderTextColor={theme.textMuted}
              value={form.notes}
              onChangeText={v => setForm(f => ({ ...f, notes: v }))}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setModalVisible(false);
                  setForm({ customerId: '', amount: '', notes: '' });
                  setSearch('');
                }}>
                <Text style={{ color: theme.textSecondary, fontFamily: fonts.semibold, fontSize: fontSizes.body }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.primary,
                  borderRadius: radius.md,
                  padding: spacing.lg,
                  alignItems: 'center',
                  opacity: saving ? 0.5 : 1,
                }}
                onPress={recordCash}
                disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={{ color: '#FFF', fontFamily: fonts.bold, fontSize: fontSizes.body }}>Record</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </GradBg>
  );
}
