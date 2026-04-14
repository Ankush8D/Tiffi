import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../theme';

const PALETTE = ['#FF6B2B','#6366F1','#10B981','#F59E0B','#3B82F6','#EC4899','#8B5CF6','#14B8A6'];

function colorFor(name = '') {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return PALETTE[code % PALETTE.length];
}

export function Avatar({ name = '?', size = 44, style }) {
  const { theme } = useTheme();
  const color = colorFor(name);
  const bg = color + (theme.isDark ? '28' : '18');
  return (
    <View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: bg, borderWidth: 1.5, borderColor: color + '55',
      justifyContent: 'center', alignItems: 'center',
    }, style]}>
      <Text style={{ color, fontSize: size * 0.4, fontFamily: fonts.bold }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
