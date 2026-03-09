import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'primary';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose?: () => void;
  icon?: 'info' | 'warning' | 'success' | 'error' | 'settings';
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: '确定', style: 'primary' }],
  onClose,
  icon = 'info',
}: CustomAlertProps) {
  const { theme } = useTheme();

  const getIconConfig = () => {
    switch (icon) {
      case 'warning':
        return { name: 'triangle-exclamation', colors: ['#FF9800', '#F57C00'] };
      case 'success':
        return { name: 'circle-check', colors: ['#4CAF50', '#388E3C'] };
      case 'error':
        return { name: 'circle-xmark', colors: ['#F44336', '#D32F2F'] };
      case 'settings':
        return { name: 'gear', colors: [theme.primary, theme.accent] };
      case 'info':
      default:
        return { name: 'circle-info', colors: [theme.primary, theme.accent] };
    }
  };

  const iconConfig = getIconConfig();

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onClose?.();
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 360,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      alignSelf: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
      textAlign: 'center',
      marginBottom: 12,
    },
    messageContainer: {
      maxHeight: 300,
      marginBottom: 20,
    },
    message: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.textSecondary,
      textAlign: 'left',
    },
    buttonContainer: {
      gap: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
    },
    primaryButton: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    primaryButtonInner: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    defaultButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.primary,
      alignItems: 'center',
      backgroundColor: `${theme.primary}10`,
    },
    defaultButtonText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.primary,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.textMuted,
    },
  });

  const renderButton = (button: AlertButton, index: number) => {
    if (button.style === 'primary') {
      return (
        <TouchableOpacity
          key={index}
          style={styles.primaryButton}
          onPress={() => handleButtonPress(button)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.primary, theme.accent]}
            style={styles.primaryButtonInner}
          >
            <Text style={styles.primaryButtonText}>{button.text}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (button.style === 'cancel') {
      return (
        <TouchableOpacity
          key={index}
          style={styles.cancelButton}
          onPress={() => handleButtonPress(button)}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>{button.text}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={styles.defaultButton}
        onPress={() => handleButtonPress(button)}
        activeOpacity={0.7}
      >
        <Text style={styles.defaultButtonText}>{button.text}</Text>
      </TouchableOpacity>
    );
  };

  // 将按钮分组：如果有2个按钮，放在一行；否则垂直排列
  const renderButtons = () => {
    if (buttons.length === 2) {
      return (
        <View style={styles.buttonRow}>
          {buttons.map((button, index) => renderButton(button, index))}
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => renderButton(button, index))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 图标 */}
          <LinearGradient
            colors={iconConfig.colors as [string, string]}
            style={styles.iconContainer}
          >
            <FontAwesome6 name={iconConfig.name as any} size={24} color="#FFFFFF" />
          </LinearGradient>

          {/* 标题 */}
          <Text style={styles.title}>{title}</Text>

          {/* 消息内容 */}
          <ScrollView style={styles.messageContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>

          {/* 按钮 */}
          {renderButtons()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
