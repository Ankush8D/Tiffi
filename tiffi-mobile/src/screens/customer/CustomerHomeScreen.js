import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { customerAPI, deliveryAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function CustomerHomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await customerAPI.get(user?.userId);
        setData(res.data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const remaining = data?.tiffinsRemaining ?? 0;
  const total = data?.tiffinsTotal ?? 1;
  const percent = Math.round((remaining / total) * 100);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Namaste, {data?.name?.split(' ')[0]}!</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>

      {/* Tiffin Counter Ring */}
      <View style={styles.ringContainer}>
        <View style={styles.ring}>
          <Text style={styles.ringNumber}>{remaining}</Text>
          <Text style={styles.ringLabel}>tiffins left</Text>
          <Text style={styles.ringPercent}>{percent}%</Text>
        </View>
        <Text style={styles.ringUsed}>{total - remaining} used this month</Text>

        {remaining <= 5 && (
          <View style={styles.lowAlert}>
            <Text style={styles.lowAlertText}>Only {remaining} tiffins remaining! Renew soon.</Text>
          </View>
        )}
      </View>

      {/* Today's Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Status</Text>
        <View style={styles.mealRow}>
          <Text style={styles.mealEmoji}>☀️</Text>
          <Text style={styles.mealLabel}>Lunch</Text>
          <View style={[styles.statusChip, { backgroundColor: colors.warning }]}>
            <Text style={styles.statusChipText}>Pending</Text>
          </View>
        </View>
        <View style={styles.mealRow}>
          <Text style={styles.mealEmoji}>🌙</Text>
          <Text style={styles.mealLabel}>Dinner</Text>
          <View style={[styles.statusChip, { backgroundColor: colors.warning }]}>
            <Text style={styles.statusChipText}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Apply Leave */}
      <TouchableOpacity style={styles.leaveBtn}>
        <Text style={styles.leaveBtnText}>Apply Leave</Text>
      </TouchableOpacity>

      {/* Payment Alert */}
      {data?.status === 'active' && (
        <View style={styles.paymentCard}>
          <Text style={styles.paymentText}>Payment due for this month</Text>
          <TouchableOpacity style={styles.payNowBtn}>
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingBottom: spacing.lg },
  greeting: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  date: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },
  ringContainer: { alignItems: 'center', padding: spacing.xxl },
  ring: { width: 160, height: 160, borderRadius: 80, borderWidth: 12, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, ...shadows.card },
  ringNumber: { fontSize: 48, fontWeight: '800', color: colors.primary },
  ringLabel: { fontSize: fontSizes.small, color: colors.textSecondary },
  ringPercent: { fontSize: fontSizes.small, color: colors.primary, fontWeight: '600' },
  ringUsed: { marginTop: spacing.md, color: colors.textSecondary, fontSize: fontSizes.body },
  lowAlert: { marginTop: spacing.md, backgroundColor: colors.warning, borderRadius: radius.medium, padding: spacing.md },
  lowAlertText: { color: '#92400E', fontWeight: '600', fontSize: fontSizes.small, textAlign: 'center' },
  card: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.lg, ...shadows.card },
  cardTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  mealEmoji: { fontSize: 20, marginRight: spacing.md },
  mealLabel: { flex: 1, fontSize: fontSizes.body, color: colors.textPrimary, fontWeight: '500' },
  statusChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusChipText: { fontSize: fontSizes.small, fontWeight: '700', color: colors.surface },
  leaveBtn: { margin: spacing.lg, borderWidth: 2, borderColor: colors.primary, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  leaveBtnText: { color: colors.primary, fontWeight: '700', fontSize: fontSizes.body },
  paymentCard: { margin: spacing.lg, backgroundColor: '#FEF2F2', borderRadius: radius.medium, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  paymentText: { color: colors.error, fontWeight: '600', fontSize: fontSizes.small, flex: 1 },
  payNowBtn: { backgroundColor: colors.error, borderRadius: radius.medium, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  payNowText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.small },
});
