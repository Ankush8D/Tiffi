import React from 'react';
import { View, StyleSheet } from 'react-native';

export function LinearGradient({ colors: gradColors, style, children }) {
  return (
    <View style={[{ backgroundColor: gradColors[0] }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: gradColors[gradColors.length - 1], opacity: 0.55 }]} />
      {children}
    </View>
  );
}
