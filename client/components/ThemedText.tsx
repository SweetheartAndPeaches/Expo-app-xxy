import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/theme';

type TypographyVariant = keyof typeof Typography;

interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

export function ThemedText({
  variant = 'body',
  color,
  style,
  children,
  ...props
}: ThemedTextProps) {
  const { theme } = useTheme();
  const typographyStyle = Typography[variant];

  const textStyle: TextStyle = {
    ...typographyStyle,
    color: color ?? theme.textPrimary,
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
}
