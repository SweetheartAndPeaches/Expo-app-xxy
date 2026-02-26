import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    webView: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.backgroundRoot,
    },
    loadingText: {
      marginTop: Spacing.md,
    },
    errorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: theme.backgroundRoot,
    },
    errorText: {
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: Spacing['2xl'],
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    backHint: {
      position: 'absolute',
      bottom: Spacing.xl,
      left: 0,
      right: 0,
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      marginHorizontal: Spacing.xl,
      borderRadius: BorderRadius.full,
    },
  });
};
