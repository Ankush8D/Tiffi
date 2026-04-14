import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, shadows } from '../theme';

export function Card({ children, style, onPress }) {
  const { theme } = useTheme();
  const cardStyle = {
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    ...(theme.isDark ? shadows.strong : shadows.card),
  };
  if (onPress) {
    return (
      <TouchableOpacity style={[cardStyle, style]} onPress={onPress} activeOpacity={0.75}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}
