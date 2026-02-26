import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type BackgroundLevel = 'root' | 'default' | 'tertiary';

interface ThemedViewProps extends ViewProps {
  level?: BackgroundLevel;
  backgroundColor?: string;
}

const backgroundMap: Record<BackgroundLevel, string> = {
  root: 'backgroundRoot',
  default: 'backgroundDefault',
  tertiary: 'backgroundTertiary',
};

export function ThemedView({
  level = 'root',
  backgroundColor,
  style,
  children,
  ...props
}: ThemedViewProps) {
  const { theme } = useTheme();
  const bgColor = backgroundColor ?? (theme as any)[backgroundMap[level]];

  const viewStyle: ViewStyle = {
    backgroundColor: bgColor,
  };

  return (
    <View style={[viewStyle, style]} {...props}>
      {children}
    </View>
  );
}
