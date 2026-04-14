import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { GradBg, OrbDecor } from './Grad';
import { spacing, fontSizes, fonts } from '../theme';

export function ScreenHeader({ title, subtitle, onBack, right }) {
  const { theme, isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();

  const gradColors = isDark
    ? ['#1A0A2E', theme.background]
    : ['#FFFFFF', theme.background];

  return (
    <GradBg colors={gradColors} style={{ paddingTop: insets.top + 8, paddingBottom: spacing.xl }}>
      {isDark && <OrbDecor color="#6366F1" size={160} x="85%" y="-30%" opacity={0.22} />}
      {isDark && <OrbDecor color={theme.primary} size={100} x="10%" y="120%" opacity={0.14} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: spacing.md, padding: 4 }} activeOpacity={0.7}>
            <Text style={{ color: theme.text, fontSize: 22, fontFamily: fonts.bold }}>←</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontSize: fontSizes.h2, fontFamily: fonts.bold, letterSpacing: -0.3 }}>{title}</Text>
          {subtitle ? <Text style={{ color: theme.textSecondary, fontSize: fontSizes.sm, fontFamily: fonts.regular, marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
        {right}
        <TouchableOpacity onPress={toggle} style={{
          marginLeft: spacing.sm, width: 36, height: 20, borderRadius: 10,
          backgroundColor: isDark ? theme.primary : '#E2E8F0',
          justifyContent: 'center', paddingHorizontal: 3,
        }} activeOpacity={0.8}>
          <View style={{
            width: 14, height: 14, borderRadius: 7, backgroundColor: isDark ? '#FFF' : '#94A3B8',
            alignSelf: isDark ? 'flex-end' : 'flex-start',
          }} />
        </TouchableOpacity>
      </View>
    </GradBg>
  );
}
