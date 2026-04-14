import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';

export function GradBg({ colors: gradColors = ['#1A0A2E', '#0B0E1A'], style, children }) {
  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={gradColors[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={gradColors[1]} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bg)" />
      </Svg>
      {children}
    </View>
  );
}

// Decorative orb for dark mode backgrounds
export function OrbDecor({ color = '#6366F1', size = 200, x = '70%', y = '-20%', opacity = 0.18 }) {
  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} width="100%" height="100%">
      <Defs>
        <LinearGradient id={`orb_${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={String(opacity)} />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Circle cx={x} cy={y} r={size} fill={`url(#orb_${color.replace('#', '')})`} />
    </Svg>
  );
}
