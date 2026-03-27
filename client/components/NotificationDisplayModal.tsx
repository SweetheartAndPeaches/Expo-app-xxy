import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

interface Notification {
  title: string;
  message?: string;
  packageName?: string;
  time?: Date;
}

interface NotificationDisplayModalProps {
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationDisplayModal({
  visible,
  notification,
  onClose,
}: NotificationDisplayModalProps) {
  const { theme, isDark } = useTheme();
  const [slideOffset] = useState(new Animated.Value(-300));

  // 动画效果
  useEffect(() => {
    if (visible) {
      Animated.timing(slideOffset, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideOffset, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideOffset]);

  // 自动关闭（5秒后）
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  // Web 平台不需要
  if (Platform.OS === 'web') {
    return null;
  }

  if (!notification) {
    return null;
  }

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      paddingTop: 60,
    },
    notificationCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      transform: [{ translateY: slideOffset }],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    headerText: {
      flex: 1,
    },
    newMessageLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.primary,
      marginBottom: 4,
    },
    timeText: {
      fontSize: 11,
      color: theme.textMuted,
    },
    content: {
      marginBottom: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    closeButton: {
      backgroundColor: theme.backgroundTertiary,
    },
    closeButtonText: {
      color: theme.textMuted,
    },
  });

  // 获取应用名称
  const getAppName = (packageName?: string) => {
    if (!packageName) return '';
    if (packageName.includes('wechat')) return 'WeChat';
    if (packageName.includes('qq')) return 'QQ';
    if (packageName.includes('alipay')) return 'Alipay';
    if (packageName.includes('taobao')) return 'Taobao';
    if (packageName.includes('jd')) return 'JD';
    if (packageName.includes('douyin')) return 'TikTok';
    if (packageName.includes('weibo')) return 'Weibo';
    return packageName;
  };

  const appName = getAppName(notification.packageName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.notificationCard}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <View style={styles.header}>
            <LinearGradient
              colors={[theme.primary, theme.accent]}
              style={styles.iconContainer}
            >
              <FontAwesome6 name="bell" size={22} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.newMessageLabel}>नया संदेश प्राप्त हुआ</Text>
              <Text style={styles.timeText}>
                {notification.time?.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                {appName && `• ${appName}`}
              </Text>
            </View>
          </View>

          {/* 内容 */}
          <View style={styles.content}>
            <ThemedText style={styles.title}>{notification.title}</ThemedText>
            {notification.message && (
              <Text style={styles.message}>{notification.message}</Text>
            )}
          </View>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.buttonText, styles.closeButtonText]}>
                बंद करें
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
