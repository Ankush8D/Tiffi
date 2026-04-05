import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius, fontSizes } from '../../theme';

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TIFFI</Text>
        <Text style={styles.tagline}>Aapka Tiffin, Aapka Hisaab</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Phone', { role: 'OWNER' })}>
          <Text style={styles.cardEmoji}>🏪</Text>
          <Text style={styles.cardTitle}>Tiffin Center Owner</Text>
          <Text style={styles.cardSub}>Manage customers, deliveries & payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardSecondary]}
          onPress={() => navigation.navigate('Phone', { role: 'CUSTOMER' })}>
          <Text style={styles.cardEmoji}>🍱</Text>
          <Text style={styles.cardTitle}>Customer</Text>
          <Text style={styles.cardSub}>Track tiffins, apply leaves & pay bills</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.huge },
  logo: { fontSize: 48, fontWeight: '800', color: colors.primary, letterSpacing: 4 },
  tagline: { fontSize: fontSizes.body, color: colors.textSecondary, marginTop: spacing.sm },
  cards: { gap: spacing.lg },
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.large,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  cardSecondary: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
  cardEmoji: { fontSize: 40, marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.surface, marginBottom: spacing.xs },
  cardSub: { fontSize: fontSizes.small, color: colors.surface, textAlign: 'center', opacity: 0.85 },
});
