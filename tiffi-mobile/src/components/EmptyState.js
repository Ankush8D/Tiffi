import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSizes, fonts } from '../theme';

export function EmptyState({ emoji = '📭', title = 'Nothing here', subtitle }) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.huge }}>
      <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>{emoji}</Text>
      <Text style={{ color: theme.text, fontSize: fontSizes.h3, fontFamily: fonts.semibold }}>{title}</Text>
      {subtitle && <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: spacing.xs, textAlign: 'center' }}>{subtitle}</Text>}
    </View>
  );
}
