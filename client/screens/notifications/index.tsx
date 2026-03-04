import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Platform, Linking, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { requestPermission, checkPermission, startListening, stopListening, getNotifications, NotificationItem, addNotificationListener, removeNotificationListener } from '@/modules/NotificationListenerModule';

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // 检查权限状态
  const checkPermissionStatus = useCallback(async () => {
    try {
      const granted = await checkPermission();
      setHasPermission(granted);
    } catch (error) {
      console.error('检查权限失败:', error);
    }
  }, []);
  
  // 请求权限
  const handleRequestPermission = useCallback(async () => {
    try {
      await requestPermission();
      await checkPermissionStatus();
    } catch (error) {
      console.error('请求权限失败:', error);
    }
  }, [checkPermissionStatus]);
  
  // 开始监听
  const handleStartListening = useCallback(async () => {
    try {
      await startListening();
      setIsListening(true);
      // 加载已有通知
      const existingNotifications = await getNotifications();
      setNotifications(existingNotifications);
    } catch (error) {
      console.error('启动监听失败:', error);
    }
  }, []);
  
  // 停止监听
  const handleStopListening = useCallback(async () => {
    try {
      await stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('停止监听失败:', error);
    }
  }, []);
  
  // 清空通知
  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // 监听新通知
  useEffect(() => {
    const handleNewNotification = (notification: NotificationItem) => {
      setNotifications(prev => [notification, ...prev].slice(0, 100)); // 最多保留 100 条
    };
    
    if (isListening) {
      addNotificationListener(handleNewNotification);
    }
    
    return () => {
      removeNotificationListener(handleNewNotification);
    };
  }, [isListening]);
  
  // 初始化检查权限
  useEffect(() => {
    if (Platform.OS === 'android') {
      (async () => {
        try {
          const granted = await checkPermission();
          setHasPermission(granted);
        } catch (error) {
          console.error('检查权限失败:', error);
        }
      })();
    }
  }, []);
  
  // 打开系统设置
  const openSystemSettings = useCallback(async () => {
    try {
      // 方案1：打开通知访问权限页面（标准 Android）
      const intent = `android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS`;
      try {
        await Linking.openURL(intent);
        return;
      } catch (e) {
        console.log('方案1失败，尝试方案2');
      }
      
      // 方案2：打开应用详情页（荣耀/华为等需要从这里进入）
      const packageName = 'com.anonymous.x7610999068365602850';
      const appDetailsUrl = `android.settings.APPLICATION_DETAILS_SETTINGS`;
      try {
        await Linking.openURL(appDetailsUrl + '?package=' + packageName);
        return;
      } catch (e) {
        console.log('方案2失败，尝试方案3');
      }
      
      // 方案3：打开通用设置
      await Linking.openSettings();
    } catch (error) {
      console.error('打开设置失败:', error);
      alert('无法打开系统设置，请手动进入：\n设置 → 应用和服务 → 权限管理 → 特殊访问权限 → 通知访问权限');
    }
  }, []);
  
  // 打开应用详情页
  const openAppDetails = useCallback(async () => {
    try {
      const packageName = 'com.anonymous.x7610999068365602850';
      const appDetailsUrl = `android.settings.APPLICATION_DETAILS_SETTINGS`;
      await Linking.openURL(appDetailsUrl + '?package=' + packageName);
    } catch (error) {
      console.error('打开应用详情失败:', error);
    }
  }, []);
  
  // 渲染通知项
  const renderNotificationItem = useCallback(({ item, index }: { item: NotificationItem; index: number }) => {
    return (
      <ThemedView level="default" style={styles.notificationItem}>
        <View style={styles.notificationHeader}>
          <View style={styles.appInfo}>
            <FontAwesome6 
              name="app-store-ios" 
              size={16} 
              color={theme.textMuted} 
              style={styles.appIcon}
            />
            <ThemedText variant="caption" color={theme.textMuted} style={styles.appName}>
              {item.packageName}
            </ThemedText>
          </View>
          <ThemedText variant="caption" color={theme.textMuted}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </ThemedText>
        </View>
        
        {item.title && (
          <ThemedText variant="body" color={theme.textPrimary} style={styles.notificationTitle}>
            {item.title}
          </ThemedText>
        )}
        
        {item.text && (
          <ThemedText variant="small" color={theme.textSecondary} style={styles.notificationText}>
            {item.text}
          </ThemedText>
        )}
      </ThemedView>
    );
  }, [theme, styles]);
  
  // 渲染空状态
  const renderEmptyState = useCallback(() => {
    if (!hasPermission) {
      return (
        <ThemedView style={styles.emptyContainer}>
          <FontAwesome6 name="lock" size={60} color={theme.textMuted} style={styles.emptyIcon} />
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.emptyTitle}>
            需要通知访问权限
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.emptyText}>
            此功能需要通知监听权限才能读取其他应用的通知
          </ThemedText>
          
          {/* 荣耀/华为手机路径说明 */}
          <View style={styles.pathContainer}>
            <ThemedText variant="caption" color={theme.textSecondary} style={styles.pathTitle}>
              荣耀/华为手机路径：
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary} style={styles.pathText}>
              设置 → 应用和服务 → 权限管理 → 特殊访问权限 → 通知访问权限
            </ThemedText>
          </View>
          
          {/* 其他手机路径说明 */}
          <View style={styles.pathContainer}>
            <ThemedText variant="caption" color={theme.textSecondary} style={styles.pathTitle}>
              其他手机路径：
            </ThemedText>
            <ThemedText variant="caption" color={theme.textSecondary} style={styles.pathText}>
              设置 → 应用 → 权限管理 → 特殊访问权限 → 通知访问权限
            </ThemedText>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={openSystemSettings}
            >
              <FontAwesome6 name="gear" size={16} color={theme.buttonPrimaryText} style={styles.buttonIcon} />
              <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>
                打开通知权限设置
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={openAppDetails}
            >
              <FontAwesome6 name="circle-info" size={16} color={theme.textPrimary} style={styles.buttonIcon} />
              <ThemedText variant="smallMedium" color={theme.textPrimary}>
                打开应用详情
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      );
    }
    
    if (!isListening) {
      return (
        <ThemedView style={styles.emptyContainer}>
          <FontAwesome6 name="bell-slash" size={60} color={theme.textMuted} style={styles.emptyIcon} />
          <ThemedText variant="h3" color={theme.textPrimary} style={styles.emptyTitle}>
            未开启监听
          </ThemedText>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.emptyText}>
            点击下方按钮开始监听系统通知
          </ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <ThemedView style={styles.emptyContainer}>
        <FontAwesome6 name="inbox" size={60} color={theme.textMuted} style={styles.emptyIcon} />
        <ThemedText variant="h3" color={theme.textPrimary} style={styles.emptyTitle}>
          暂无通知
        </ThemedText>
        <ThemedText variant="body" color={theme.textSecondary} style={styles.emptyText}>
          收到的通知将显示在这里
        </ThemedText>
      </ThemedView>
    );
  }, [hasPermission, isListening, openSystemSettings, openAppDetails, theme, styles]);
  
  // 仅 Android 平台支持
  if (Platform.OS !== 'android') {
    return (
      <Screen
        backgroundColor={theme.backgroundRoot}
        statusBarStyle={isDark ? 'light' : 'dark'}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.emptyContainer}>
            <FontAwesome6 name="android" size={60} color={theme.textMuted} style={styles.emptyIcon} />
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.emptyTitle}>
              仅支持 Android 平台
            </ThemedText>
            <ThemedText variant="body" color={theme.textSecondary} style={styles.emptyText}>
              通知监听功能仅在 Android 设备上可用
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Screen>
    );
  }
  
  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <ThemedView style={styles.container}>
        {/* 头部 */}
        <ThemedView level="default" style={styles.header}>
          <ThemedText variant="h2" color={theme.textPrimary}>
            通知监听
          </ThemedText>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: hasPermission ? theme.success : theme.error }
            ]}>
              <FontAwesome6 
                name={hasPermission ? "check" : "times"} 
                size={12} 
                color={theme.buttonPrimaryText} 
              />
            </View>
            <ThemedText variant="caption" color={theme.textSecondary}>
              {hasPermission ? '已授权' : '未授权'}
            </ThemedText>
          </View>
        </ThemedView>
        
        {/* 工具栏 */}
        <ThemedView level="tertiary" style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity
              style={[
                styles.toolbarButton,
                { backgroundColor: isListening ? theme.error : theme.success }
              ]}
              onPress={isListening ? handleStopListening : handleStartListening}
              disabled={!hasPermission}
            >
              <FontAwesome6 
                name={isListening ? "stop" : "play"} 
                size={16} 
                color={theme.buttonPrimaryText} 
              />
              <ThemedText variant="smallMedium" color={theme.buttonPrimaryText} style={styles.buttonText}>
                {isListening ? '停止' : '开始'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleRequestPermission}
            >
              <FontAwesome6 
                name="rotate-right" 
                size={16} 
                color={theme.textPrimary} 
              />
              <ThemedText variant="smallMedium" color={theme.textPrimary} style={styles.buttonText}>
                检查权限
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearNotifications}
            >
              <FontAwesome6 name="trash" size={16} color={theme.error} />
            </TouchableOpacity>
          )}
        </ThemedView>
        
        {/* 通知列表 */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) => `${item.packageName}-${item.timestamp}-${index}`}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.listEmpty
          ]}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </Screen>
  );
}
