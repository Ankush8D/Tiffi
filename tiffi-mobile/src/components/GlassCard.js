import React from 'react';
import { View } from 'react-native';
import { colors, radius, shadows } from '../theme';

export default function GlassCard({ style, children }) {
  return (
    <View style={[{
      backgroundColor: colors.glass,
      borderRadius: radius.medium,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      ...shadows.card,
    }, style]}>
      {children}
    </View>
  );
}
