import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.backgroundTertiary,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    statusBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    toolbarLeft: {
      flexDirection: 'row',
      gap: Spacing.sm,
      flex: 1,
    },
    toolbarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.sm,
      backgroundColor: theme.backgroundTertiary,
      gap: Spacing.xs,
    },
    buttonText: {
      fontSize: 12,
    },
    clearButton: {
      padding: Spacing.sm,
      borderRadius: BorderRadius.sm,
      backgroundColor: theme.backgroundTertiary,
    },
    listContent: {
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    listEmpty: {
      flex: 1,
    },
    notificationItem: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.md,
      gap: Spacing.xs,
      backgroundColor: theme.backgroundTertiary,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    appInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    appIcon: {
      opacity: 0.7,
    },
    appName: {
      fontSize: 11,
      opacity: 0.8,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    notificationText: {
      fontSize: 13,
      lineHeight: 18,
      opacity: 0.8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing['2xl'],
      gap: Spacing.md,
    },
    emptyIcon: {
      opacity: 0.5,
    },
    emptyTitle: {
      textAlign: 'center',
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 14,
    },
    pathContainer: {
      backgroundColor: theme.backgroundTertiary,
      padding: Spacing.md,
      borderRadius: BorderRadius.sm,
      width: '100%',
      gap: Spacing.xs,
    },
    pathTitle: {
      fontSize: 11,
      fontWeight: '600',
      opacity: 0.8,
    },
    pathText: {
      fontSize: 11,
      lineHeight: 16,
      opacity: 0.7,
    },
    buttonContainer: {
      width: '100%',
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    permissionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.primary,
      gap: Spacing.sm,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      backgroundColor: theme.backgroundTertiary,
      gap: Spacing.sm,
    },
    buttonIcon: {
      marginRight: Spacing.xs,
    },
  });
};
