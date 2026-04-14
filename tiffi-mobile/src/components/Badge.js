import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, fontSizes, fonts } from '../theme';

const STATUS = {
  active:    { key: 'success' },
  delivered: { key: 'success' },
  paused:    { key: 'warning' },
  leave:     { key: 'warning' },
  expired:   { key: 'error' },
  missed:    { key: 'error' },
  pending:   { key: 'info' },
  paid:      { key: 'success' },
  partial:   { key: 'warning' },
};

export function Badge({ label, status, color, bgColor }) {
  const { theme } = useTheme();
  const cfg = STATUS[status?.toLowerCase()] || { key: 'info' };
  const fg = color || theme[cfg.key];
  const bg = bgColor || theme[cfg.key + 'Light'];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: fg + '55' }}>
      <Text style={{ color: fg, fontSize: fontSizes.xs, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label || status}
      </Text>
    </View>
  );
}
