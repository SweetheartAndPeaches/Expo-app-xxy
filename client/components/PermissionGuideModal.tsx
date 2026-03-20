import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import { t } from '@/i18n';

interface PermissionGuideModalProps {
  visible: boolean;
  onRequestLater: () => void;
  onRequestNow: () => void;
  onConfirmPermission: () => void;
}

export default function PermissionGuideModal({
  visible,
  onRequestLater,
  onRequestNow,
  onConfirmPermission,
}: PermissionGuideModalProps) {
  const { theme, isDark } = useTheme();

  // Web 平台不需要通知权限
  if (Platform.OS === 'web') {
    return null;
  }

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
      padding: 28,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      alignSelf: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    featureList: {
      marginBottom: 24,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 14,
      color: theme.textSecondary,
      flex: 1,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.primary}15`,
      padding: 12,
      borderRadius: 8,
      marginBottom: 24,
    },
    tipIcon: {
      marginRight: 8,
    },
    tipText: {
      fontSize: 13,
      color: theme.textSecondary,
      flex: 1,
    },
    primaryButton: {
      width: '100%',
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonContainer: {
      gap: 12,
    },
    secondaryButton: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.textMuted,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestLater}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onRequestLater}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 图标 */}
          <LinearGradient
            colors={[theme.primary, theme.accent]}
            style={styles.iconContainer}
          >
            <FontAwesome6 name="wand-magic-sparkles" size={36} color="#FFFFFF" />
          </LinearGradient>

          {/* 标题 */}
          <ThemedText style={styles.title}>
            {t.permission.title}
          </ThemedText>

          {/* 描述 */}
          <Text style={styles.description}>
            {t.permission.description}
          </Text>

          {/* 功能列表 */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <FontAwesome6
                name="circle-check"
                size={16}
                color={theme.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{t.permission.features.smartIdentify}</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome6
                name="circle-check"
                size={16}
                color={theme.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{t.permission.features.quickActions}</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome6
                name="circle-check"
                size={16}
                color={theme.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{t.permission.features.optimizeSpeed}</Text>
            </View>
          </View>

          {/* 提示信息 */}
          <View style={styles.tipContainer}>
            <FontAwesome6
              name="shield-halved"
              size={14}
              color={theme.primary}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              {t.permission.privacyTip}
            </Text>
          </View>

          {/* 按钮 */}
          <View style={styles.buttonContainer}>
            {/* 去开启权限 */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRequestNow}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.primary, theme.accent]}
                style={{ width: '100%', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center' }}
              >
                <Text style={styles.primaryButtonText}>{t.permission.buttons.enable}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 我已开启，不再提醒 */}
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.primary }]}
              onPress={onConfirmPermission}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15, fontWeight: '500', color: theme.primary }}>
                {t.permission.buttons.confirmed}
              </Text>
            </TouchableOpacity>

            {/* 稍后提醒 */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRequestLater}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>{t.permission.buttons.later}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
