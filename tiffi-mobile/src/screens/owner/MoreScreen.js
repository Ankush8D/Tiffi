import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import useAuthStore from '../../store/authStore';
import { colors, spacing, radius, fontSizes, shadows } from '../../theme';

export default function MoreScreen() {
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: clearAuth },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <View style={styles.section}>
        <MenuItem emoji="💰" label="Payments" sub="View and record payments" />
        <MenuItem emoji="📋" label="Leave Requests" sub="Approve or reject leaves" />
        <MenuItem emoji="🍽" label="Menu Management" sub="Set today's lunch & dinner" />
        <MenuItem emoji="📦" label="Packages" sub="Manage subscription packages" />
        <MenuItem emoji="🚴" label="Delivery Boys" sub="Manage delivery staff" />
        <MenuItem emoji="📊" label="Analytics" sub="Revenue and customer reports" />
        <MenuItem emoji="⚙️" label="Settings" sub="Business profile and preferences" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ emoji, label, sub }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <View style={styles.menuInfo}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xxl, paddingBottom: spacing.lg },
  title: { fontSize: fontSizes.h2, fontWeight: '700', color: colors.surface },
  section: { margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.large, ...shadows.card },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuEmoji: { fontSize: 24, marginRight: spacing.lg },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: fontSizes.body, fontWeight: '600', color: colors.textPrimary },
  menuSub: { fontSize: fontSizes.small, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textSecondary },
  logoutBtn: { margin: spacing.lg, backgroundColor: colors.error, borderRadius: radius.medium, padding: spacing.lg, alignItems: 'center' },
  logoutText: { color: colors.surface, fontWeight: '700', fontSize: fontSizes.body },
});
