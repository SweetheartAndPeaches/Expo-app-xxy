import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

enum COLOR_SCHEME_CHOICE {
  FOLLOW_SYSTEM = 'follow-system', // 跟随系统自动变化
  DARK = 'dark', // 固定为 dark 主题，不随系统变化
  LIGHT = 'light', // 固定为 light 主题，不随系统变化
};

const userPreferColorScheme: COLOR_SCHEME_CHOICE = COLOR_SCHEME_CHOICE.FOLLOW_SYSTEM;

function getTheme(colorScheme?: 'dark' | 'light' | null) {
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  return {
    theme,
    isDark,
  };
}

function useTheme() {
  const systemColorScheme = useColorScheme()
  const colorScheme = userPreferColorScheme === COLOR_SCHEME_CHOICE.FOLLOW_SYSTEM ?
    systemColorScheme :
    userPreferColorScheme;

  return getTheme(colorScheme);
}

export {
  useTheme,
}
