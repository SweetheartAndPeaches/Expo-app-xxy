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
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 340,
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
      marginBottom: 14,
      alignSelf: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 14,
    },
    featureList: {
      marginBottom: 14,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    featureIcon: {
      marginRight: 10,
    },
    featureText: {
      fontSize: 13,
      color: theme.textSecondary,
      flex: 1,
    },
    tipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.primary}15`,
      padding: 10,
      borderRadius: 8,
      marginBottom: 16,
    },
    tipIcon: {
      marginRight: 8,
    },
    tipText: {
      fontSize: 12,
      color: theme.textSecondary,
      flex: 1,
    },
    primaryButton: {
      width: '100%',
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonContainer: {
      gap: 10,
    },
    secondaryButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
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
            <FontAwesome6 name="wand-magic-sparkles" size={24} color="#FFFFFF" />
          </LinearGradient>

          {/* 标题 */}
          <ThemedText style={styles.title}>
            नोटिफिकेशन एक्सेस अनुमति आवश्यक है
          </ThemedText>

          {/* 描述 */}
          <Text style={styles.description}>
            महत्वपूर्ण संदेशों को स्मार्ट रूप से पहचानने और प्रबंधित करने में आपकी सहायता के लिए, हमें &quot;नोटिफिकेशन एक्सेस अनुमति&quot; की आवश्यकता है।
          </Text>

          {/* 功能列表 */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <FontAwesome6
                name="circle-check"
                size={14}
                color={theme.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>महत्वपूर्ण संदेशों की स्मार्ट पहचान</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome6
                name="circle-check"
                size={14}
                color={theme.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>सुविधाजनक शॉर्टकट प्रदान करें</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome6
                name="circle-check"
                size={14}
                color={theme.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>प्रतिक्रिया गति में सुधार</Text>
            </View>
          </View>

          {/* 提示信息 */}
          <View style={styles.tipContainer}>
            <FontAwesome6
              name="shield-halved"
              size={12}
              color={theme.primary}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              यह अनुमति केवल नोटिफिकेशन सामग्री पढ़ने के लिए है, आपके किसी भी नोटिफिकेशन को संशोधित या हटाएगी नहीं। आप कभी भी सेटिंग्स में बंद कर सकते हैं।
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
                style={{ width: '100%', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' }}
              >
                <Text style={styles.primaryButtonText}>अनुमति चालू करें</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 我已开启，不再提醒 */}
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.primary }]}
              onPress={onConfirmPermission}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: theme.primary }}>
                मैंने चालू कर दिया है, दोबारा याद न दिलाएं
              </Text>
            </TouchableOpacity>

            {/* 稍后提醒 */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRequestLater}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>बाद में याद दिलाएं</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
