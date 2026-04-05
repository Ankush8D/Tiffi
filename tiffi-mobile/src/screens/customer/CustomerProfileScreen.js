import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function CustomerProfileScreen() {
  const { user, clearAuth } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.phone?.[0] || 'C'}</Text>
        </View>
        <Text style={styles.phone}>{user?.phone}</Text>
        <Text style={styles.role}>Customer</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Customer ID</Text>
        <Text style={styles.value}>{user?.customerCode || 'TF-001'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn}
        onPress={() => Alert.alert('Logout', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: clearAuth },
        ])}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 36, fontWeight: '800', color: colors.primary },
  phone: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.surface },
  role: { fontSize: fontSizes.small, color: colors.surface, opacity: 0.8, marginTop: 4 },
  card: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.medium, padding: spacing.lg, ...shadows.card },
  label: { fontSize: fontSizes.small, color: colors.textSecondary },
  value: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
  logoutBtn: { margin: spacing.lg, backgroundColor: colors.error, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  logoutText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
