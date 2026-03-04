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
    errorIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.backgroundTertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    errorTitle: {
      marginBottom: Spacing.sm,
    },
    errorText: {
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    errorCode: {
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    buttonContainer: {
      width: '100%',
      gap: Spacing.md,
    },
    retryButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing['2xl'],
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    primaryButton: {
      backgroundColor: theme.primary,
    },
    secondaryButton: {
      backgroundColor: theme.backgroundTertiary,
    },
    buttonIcon: {
      marginRight: Spacing.xs,
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
