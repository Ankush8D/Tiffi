import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { menuAPI } from '../../services/api';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function MenuScreen() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await menuAPI.getToday();
      setMenu(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Menu</Text>
        <Text style={styles.date}>{menu?.date || new Date().toDateString()}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.mealTitle}>☀️ Lunch</Text>
        <Text style={menu?.lunch ? styles.mealDesc : styles.mealEmpty}>
          {menu?.lunch || 'Not updated yet'}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.mealTitle}>🌙 Dinner</Text>
        <Text style={menu?.dinner ? styles.mealDesc : styles.mealEmpty}>
          {menu?.dinner || 'Not updated yet'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  date: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },
  card: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.xxl, ...shadows.card },
  mealTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  mealDesc: { fontSize: fontSizes.body, color: colors.textPrimary, lineHeight: 22 },
  mealEmpty: { fontSize: fontSizes.body, color: colors.textSecondary, fontStyle: 'italic' },
});
