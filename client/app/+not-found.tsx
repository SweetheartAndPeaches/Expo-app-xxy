import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Text>
        页面不存在
      </Text>
      <Link href="/" style={[styles.gohome]}>
        返回首页
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gohome: {
    marginTop: Spacing['2xl'],
  },
});
