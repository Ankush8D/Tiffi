import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Menu</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.mealTitle}>☀️ Lunch</Text>
        <Text style={styles.mealDesc}>Owner hasn't updated today's menu yet</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.mealTitle}>🌙 Dinner</Text>
        <Text style={styles.mealDesc}>Owner hasn't updated today's menu yet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  date: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 2 },
  card: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.large, padding: spacing.xxl, ...shadows.card },
  mealTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  mealDesc: { fontSize: fontSizes.body, color: colors.textSecondary },
});
