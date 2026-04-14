import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius, fontSizes, fonts } from '../theme';

export function SearchBar({ value, onChangeText, placeholder = 'Search...', style }) {
  const { theme } = useTheme();
  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.inputBg,
      borderRadius: radius.md, borderWidth: 1, borderColor: theme.inputBorder,
      paddingHorizontal: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md,
    }, style]}>
      <Text style={{ color: theme.textMuted, fontSize: 16, marginRight: spacing.sm }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={{ flex: 1, color: theme.text, fontSize: fontSizes.body, fontFamily: fonts.regular, paddingVertical: spacing.md }}
      />
    </View>
  );
}
