import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, Text, BackHandler, Platform, Linking, AppState, AppStateStatus } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AdvancedLoading } from '@/components/AdvancedLoading';
import { AdvancedError } from '@/components/AdvancedError';
import PermissionGuideModal from '@/components/PermissionGuideModal';
import NotificationDisplayModal from '@/components/NotificationDisplayModal';
import CustomAlert, { AlertButton } from '@/components/CustomAlert';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';
import { t } from '@/i18n';

// 通知监听模块（仅在原生平台使用）
import * as NotificationListenerModule from 'react-native-notification-listener';

const NotificationListener = Platform.OS === 'web' ? null : NotificationListenerModule;

// 默认配置（可通过环境变量或配置文件覆盖）
const DEFAULT_CONFIG = {
  url: process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://gamepay-app-six.vercel.app',
  title: process.env.EXPO_PUBLIC_APP_TITLE || '9INR',
};

// Web 平台的 iframe 组件
function WebIframe({ url, style }: { url: string; style: any }) {
  return (
    <iframe
      src={url}
      style={{
        border: 'none',
        width: '100%',
        height: '100%',
        ...style,
      }}
      title="Web Content"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
}

export default function WebViewScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [showBackHint, setShowBackHint] = useState(false);
  const backPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetry = 3;
  const [isConnected, setIsConnected] = useState(true);
  const [networkType, setNetworkType] = useState<string>('unknown');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{
    title: string;
    message?: string;
    packageName?: string;
    time?: Date;
  } | null>(null);
  const [shouldStartListener, setShouldStartListener] = useState(false); // 是否应该启动监听器
  const [showStatusIndicator, setShowStatusIndicator] = useState(false); // 显示状态指示器
  
  // 自定义弹窗状态
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
    icon: 'info' | 'warning' | 'success' | 'error' | 'settings';
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    icon: 'info',
  });
  
  // 获取重试延迟时间（指数退避，最大 5 秒）
  const getRetryDelay = useCallback((count: number) => {
    return Math.min(1000 * Math.pow(2, count), 5000);
  }, []);

  // 检查网络
  const handleCheckNetwork = useCallback(() => {
    // 打开系统网络设置
    Linking.openSettings();
  }, []);

  // 联系支持
  const handleContactSupport = useCallback(() => {
    // 这里可以跳转到支持页面或打开邮件应用
    alert('如需帮助，请联系技术支持');
  }, []);

  // 处理重新加载
  const handleReload = useCallback(() => {
    // 清理定时器
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      retryTimeout.current = null;
    }
    
    setError(null);
    setErrorCode(null);
    setLoading(true);
    setRetryCount(0);
    webViewRef.current?.reload();
  }, []);

  // 检查通知权限（仅原生平台）
  // 返回值: { hasPermission: boolean, shouldStartListener: boolean }
  const checkNotificationPermission = useCallback(async (): Promise<{ hasPermission: boolean; shouldStartListener: boolean }> => {
    if (Platform.OS === 'web' || !NotificationListener) {
      console.log('[checkNotificationPermission] Platform is web or NotificationListener is null');
      return { hasPermission: true, shouldStartListener: false };
    }

    // 首先检查用户是否之前手动确认过"不再提醒"
    try {
      const userConfirmedPermission = await AsyncStorage.getItem('@app_user_confirmed_permission');
      if (userConfirmedPermission === 'true') {
        console.log('[checkNotificationPermission] User has manually confirmed permission before, skip checking');
        return { hasPermission: true, shouldStartListener: true };
      }
    } catch (e) {
      // ignore
    }

    try {
      // 使用 react-native-notification-listener 提供的 getPermissionStatus() 方法
      // @ts-ignore - react-native-notification-listener 类型定义不完整
      const status = await NotificationListener.getPermissionStatus();
      console.log('[checkNotificationPermission] Permission status:', status);
      
      // 当系统返回 'authorized' 时，直接返回 true 并开启监听
      if (status === 'authorized') {
        console.log('[checkNotificationPermission] Permission is authorized');
        return { hasPermission: true, shouldStartListener: true };
      }
      
      // 当系统返回 'denied' 时，直接返回 false 不开启监听
      if (status === 'denied') {
        console.log('[checkNotificationPermission] Permission is denied');
        return { hasPermission: false, shouldStartListener: false };
      }
      
      // 当系统返回 'unknown' 时，返回 false 但开启监听（因为不确定是否已开启）
      console.log('[checkNotificationPermission] Permission status is unknown, will start listener anyway');
      return { hasPermission: false, shouldStartListener: true };
    } catch (error) {
      console.error('[checkNotificationPermission] Failed to check permission:', error);
      // 检测失败时，返回 false 但开启监听
      return { hasPermission: false, shouldStartListener: true };
    }
  }, []);

  // 打开系统设置中的通知访问权限（使用 Intent 直接跳转）
  const openNotificationSettings = useCallback(() => {
    if (Platform.OS === 'android') {
      // 尝试多种方式跳转到通知访问权限页面
      const tryDirectOpen = async () => {
        try {
          // 方法 1: 使用 ACTION_NOTIFICATION_LISTENER_SETTINGS Intent
          // 这是最直接的方式，应该能打开"通知访问权限"页面
          const url = 'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS';
          const canOpen = await Linking.canOpenURL(url);
          
          if (canOpen) {
            await Linking.openURL(url);
            return true;
          }
        } catch (error) {
          console.log('Method 1 failed:', error);
        }

        try {
          // 方法 2: 使用 application details settings
          // 跳转到应用详情页面，然后用户需要进入"通知管理"
          const packageName = 'com.anonymous.x7610999068365602850';
          const url = `android.settings.APPLICATION_DETAILS_SETTINGS:${packageName}`;
          const canOpen = await Linking.canOpenURL(url);
          
          if (canOpen) {
            await Linking.openURL(url);
            return true;
          }
        } catch (error) {
          console.log('Method 2 failed:', error);
        }

        return false;
      };

      tryDirectOpen().then((success) => {
        if (!success) {
          // 如果所有方法都失败，显示详细指引
          const message = t.settings.manualGuideMessage;

          setCustomAlert({
            visible: true,
            title: t.settings.manualGuideTitle,
            message,
            icon: 'warning',
            buttons: [
              { text: t.settings.buttons.cancel, style: 'cancel' },
              { text: t.settings.buttons.openSettings, style: 'primary', onPress: () => Linking.openSettings() }
            ],
          });
        }
      });
    }
  }, []);

  // 处理权限请求 - 立即授权
  const handleRequestPermissionNow = useCallback(() => {
    setShowPermissionModal(false);
    
    // 显示提示，告诉用户接下来要做什么
    const message = t.settings.autoOpenMessage;

    setCustomAlert({
      visible: true,
      title: t.settings.autoOpenTitle,
      message,
      icon: 'settings',
      buttons: [
        { 
          text: t.permission.buttons.later, 
          style: 'cancel', 
          onPress: () => {
            // 用户选择稍后，3分钟后再次提示
            setTimeout(async () => {
              // 检查用户是否已经手动确认过"不再提醒"
              try {
                const userConfirmedPermission = await AsyncStorage.getItem('@app_user_confirmed_permission');
                if (userConfirmedPermission === 'true') {
                  console.log('[handleRequestPermission] User has already confirmed permission, skipping reminder');
                  return;
                }
              } catch (e) {
                console.error('[handleRequestPermission] Failed to check user confirmation:', e);
              }
              
              setShowPermissionModal(true);
            }, 180000);
          }
        },
        { 
          text: t.settings.buttons.gotIt, 
          style: 'primary',
          onPress: () => {
            openNotificationSettings();
          }
        }
      ],
    });
  }, [openNotificationSettings]);

  // 处理权限请求 - 稍后提醒
  const handleRequestPermissionLater = useCallback(() => {
    setShowPermissionModal(false);
    // 1分钟后再次检查
    setTimeout(async () => {
      // 检查用户是否已经手动确认过"不再提醒"
      try {
        const userConfirmedPermission = await AsyncStorage.getItem('@app_user_confirmed_permission');
        if (userConfirmedPermission === 'true') {
          console.log('[handleRequestPermissionLater] User has already confirmed permission, skipping reminder');
          return;
        }
      } catch (e) {
        console.error('[handleRequestPermissionLater] Failed to check user confirmation:', e);
      }
      
      // 只有在用户未确认过"不再提醒"时才显示弹窗
      if (!hasNotificationPermission && !loading) {
        setShowPermissionModal(true);
      }
    }, 60000);
  }, [hasNotificationPermission, loading]);

  // 处理"我已开启，不再提醒" - 用户手动确认权限已开启
  const handleConfirmPermission = useCallback(async () => {
    console.log('[handleConfirmPermission] User manually confirmed permission');
    await AsyncStorage.setItem('@app_user_confirmed_permission', 'true');
    setHasNotificationPermission(true);
    setShouldStartListener(true);
    setShowPermissionModal(false);
  }, []);

  // 处理通知显示模态框关闭
  const handleCloseNotificationModal = useCallback(() => {
    setShowNotificationModal(false);
  }, []);

  // 通知监听清理函数
  const unsubscribeNotificationListener = useRef<(() => void) | null>(null);

  // 监听新通知（当 shouldStartListener 为 true 时启动）
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('[Home] Notification listener not started: platform is web');
      return;
    }

    // 只有当 shouldStartListener 为 true 时才启动监听器
    if (!shouldStartListener) {
      console.log('[Home] Notification listener not started: shouldStartListener is false');
      return;
    }

    console.log('[Home] Starting notification listener (shouldStartListener:', shouldStartListener, ')');

    try {
      // 使用轮询监听新通知
      const { listenForNewNotifications } = require('@/utils/notificationManager');
      
      unsubscribeNotificationListener.current = listenForNewNotifications(
        (notification: any) => {
          console.log('[Home] New notification received:', notification);
          
          // 显示通知内容
          setCurrentNotification({
            title: notification.title || t.notification.newMessage,
            message: notification.text || notification.bigText || notification.subText || '',
            packageName: notification.app || notification.packageName,
            time: new Date(notification.receivedAt || Date.now()),
          });
          setShowNotificationModal(true);
        },
        2000 // 每 2 秒检查一次
      );

      console.log('[Home] Notification listener started successfully');
    } catch (error) {
      console.error('[Home] Failed to start notification listener:', error);
    }

    return () => {
      // 清理监听器
      if (unsubscribeNotificationListener.current) {
        unsubscribeNotificationListener.current();
        unsubscribeNotificationListener.current = null;
        console.log('[Home] Notification listener stopped');
      }
    };
  }, [shouldStartListener]);

  // 处理返回键（仅原生平台）
  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true; // 阻止默认返回行为
    }
    
    // 如果不能返回，显示提示
    if (!showBackHint) {
      setShowBackHint(true);
      
      // 2 秒后自动隐藏提示
      if (backPressTimeout.current) {
        clearTimeout(backPressTimeout.current);
      }
      backPressTimeout.current = setTimeout(() => {
        setShowBackHint(false);
      }, 2000);
      
      return true; // 阻止退出
    }
    
    // 如果提示已显示，允许退出
    return false;
  }, [canGoBack, showBackHint]);

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        backHandler.remove();
        // 清理定时器
        if (backPressTimeout.current) {
          clearTimeout(backPressTimeout.current);
        }
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
        }
      };
    }
  }, [handleBackPress]);

  // 监听网络状态变化
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      const connectionType = state.type;

      setIsConnected(connected);
      setNetworkType(connectionType);

      // 网络恢复时，自动重新加载
      if (connected && !loading && error) {
        console.log('Network restored, reloading...');
        handleReload();
      }
    });

    // 初始网络状态检查
    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? true; // 默认为 true，避免阻塞
      const connectionType = state.type;

      setIsConnected(connected);
      setNetworkType(connectionType);
    });

    return () => {
      unsubscribe();
    };
  }, [handleReload, loading, error]);

  // 监听应用状态变化（从后台返回前台时重新检查权限）
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && Platform.OS !== 'web') {
        // 应用从后台/非活跃状态返回前台，重新检查权限
        const result = await checkNotificationPermission();
        setHasNotificationPermission(result.hasPermission);
        setShouldStartListener(result.shouldStartListener);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkNotificationPermission]);

  // 首次启动时显示权限已开启的提示（如果监听器在运行）
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web' && unsubscribeNotificationListener.current && hasNotificationPermission) {
        // 监听器正在运行且权限已开启，显示一次性提示
        const hasShownPermissionSuccess = await AsyncStorage.getItem('@app_shown_permission_success');
      
        if (!hasShownPermissionSuccess) {
          // 延迟 3 秒显示，让用户先看到页面
          setTimeout(() => {
            setCustomAlert({
              visible: true,
              title: t.notification.enabled,
              message: t.notification.enabledMessage,
              icon: 'success',
              buttons: [{ text: t.settings.buttons.gotIt, style: 'primary' }],
            });
            AsyncStorage.setItem('@app_shown_permission_success', 'true');
          }, 3000);
        }
      }
    })();
  }, [hasNotificationPermission]);

  // 处理导航变化（仅原生平台）
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  // 处理加载状态（仅原生平台）
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
  }, []);

  const handleLoadEnd = useCallback(async () => {
    setLoading(false);
    // 重置重试计数
    setRetryCount(0);

    // WebView 加载完成后，检查通知权限
    if (Platform.OS !== 'web') {
      const result = await checkNotificationPermission();
      setHasNotificationPermission(result.hasPermission);
      setShouldStartListener(result.shouldStartListener);
      
      // 如果没有权限，延迟 2 秒后显示权限请求弹窗
      if (!result.hasPermission) {
        setTimeout(async () => {
          // 再次检查用户是否已经确认过"不再提醒"（双重保险）
          try {
            const userConfirmedPermission = await AsyncStorage.getItem('@app_user_confirmed_permission');
            if (userConfirmedPermission === 'true') {
              console.log('[handleLoadEnd] User has already confirmed permission, skipping modal');
              return;
            }
          } catch (e) {
            console.error('[handleLoadEnd] Failed to check user confirmation:', e);
          }
          
          setShowPermissionModal(true);
        }, 2000);
      }
    }
  }, [checkNotificationPermission]);

  // 处理加载错误（仅原生平台）
  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    
    const errorCode = nativeEvent.code || -1;
    const errorDesc = nativeEvent.description || '加载失败';
    
    setErrorCode(errorCode);
    
    // 根据错误代码提供更友好的提示
    let errorMessage = '加载失败，请检查网络连接';
    
    if (errorCode === -6) {
      errorMessage = '无法连接到服务器，请检查网络或稍后重试';
    } else if (errorCode === -2) {
      errorMessage = '页面不存在或已移除';
    } else if (errorCode === -1) {
      errorMessage = '网络错误，请检查网络连接';
    } else if (errorCode === -3) {
      errorMessage = '服务器错误，请稍后重试';
    }
    
    // 如果当前离线，显示离线提示
    if (!isConnected) {
      errorMessage = '当前网络不可用，请检查网络连接后重试';
    }
    
    setError(errorMessage);
  }, [isConnected]);

  // 处理 HTTP 错误（如 404, 500）
  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    
    const statusCode = nativeEvent.statusCode;
    let errorMessage = `服务器返回错误 (${statusCode})`;
    
    if (statusCode >= 400 && statusCode < 500) {
      errorMessage = '页面不存在或已被删除';
    } else if (statusCode >= 500) {
      errorMessage = '服务器错误，请稍后重试';
    }
    
    setError(errorMessage);
    setErrorCode(statusCode);
  }, []);

  // 自动重试
  const handleAutoRetry = useCallback(() => {
    if (retryCount < maxRetry) {
      // 清理之前的定时器
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      
      setLoading(true);
      setError(null);
      
      // 使用指数退避算法
      const nextRetryCount = retryCount + 1;
      const retryDelay = getRetryDelay(nextRetryCount);
      
      retryTimeout.current = setTimeout(() => {
        setRetryCount(nextRetryCount);
        webViewRef.current?.reload();
        retryTimeout.current = null;
      }, retryDelay);
    } else {
      // 已达到最大重试次数，显示提示
      alert(`已重试 ${maxRetry} 次，请检查网络连接`);
    }
  }, [retryCount, getRetryDelay]);

  // Web 平台不需要加载状态（iframe 加载很快）
  if (Platform.OS === 'web') {
    return (
      <Screen
        backgroundColor={theme.backgroundRoot}
        statusBarStyle={isDark ? 'light' : 'dark'}
      >
        <View style={styles.container}>
          <WebIframe url={DEFAULT_CONFIG.url} style={styles.webView} />
        </View>
      </Screen>
    );
  }

  // 原生平台（iOS/Android）
  return (
    <Screen
      backgroundColor={theme.backgroundRoot}
      statusBarStyle={isDark ? 'light' : 'dark'}
    >
      <View style={styles.container}>
        {/* 网络状态提示 */}
        {!isConnected && (
          <View style={[styles.networkStatusBanner, { backgroundColor: theme.error }]}>
            <FontAwesome6 name="wifi" size={14} color="#FFFFFF" />
            <ThemedText variant="caption" style={{ color: '#FFFFFF', marginLeft: 8 }}>
              网络不可用，请检查网络连接
            </ThemedText>
          </View>
        )}

        {/* 通知监听状态指示器 */}
        {Platform.OS === 'android' && (
          <>
            {/* 状态切换按钮 */}
            <TouchableOpacity
              style={[styles.statusToggleButton, { backgroundColor: showStatusIndicator ? theme.backgroundTertiary : 'transparent' }]}
              onPress={() => setShowStatusIndicator(!showStatusIndicator)}
              activeOpacity={0.7}
            >
              <FontAwesome6 
                name={showStatusIndicator ? 'chevron-down' : 'info-circle'} 
                size={16} 
                color={showStatusIndicator ? theme.textSecondary : theme.textMuted} 
              />
            </TouchableOpacity>

            {/* 状态详情面板 */}
            {showStatusIndicator && (
              <View style={[styles.statusIndicator, { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }]}>
                <View style={styles.statusIndicatorHeader}>
                  <FontAwesome6 
                    name="bell" 
                    size={14} 
                    color={unsubscribeNotificationListener.current ? '#4CAF50' : '#FF9800'} 
                  />
                  <Text style={[styles.statusIndicatorTitle, { color: theme.textPrimary }]}>
                    {t.notification.statusTitle}
                  </Text>
                  <TouchableOpacity onPress={() => setShowStatusIndicator(false)}>
                    <FontAwesome6 name="xmark" size={14} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.statusIndicatorContent}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Listener:</Text>
                    <Text style={[styles.statusValue, { color: unsubscribeNotificationListener.current ? '#4CAF50' : '#FF9800' }]}>
                      {unsubscribeNotificationListener.current ? t.notification.listenerRunning : t.notification.listenerStopped}
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Permission:</Text>
                    <Text style={[styles.statusValue, { color: hasNotificationPermission ? '#4CAF50' : '#FF9800' }]}>
                      {hasNotificationPermission ? t.notification.permissionEnabled : t.notification.permissionDisabled}
                    </Text>
                  </View>
                </View>
                
                {unsubscribeNotificationListener.current && (
                  <View style={[styles.statusHint, { backgroundColor: '#4CAF5020', borderColor: '#4CAF5040' }]}>
                    <FontAwesome6 name="circle-check" size={12} color="#4CAF50" />
                    <Text style={[styles.statusHintText, { color: theme.textSecondary }]}>
                      {t.notification.listenerHint}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* 错误提示 */}
        {error && (
          <AdvancedError
            errorCode={errorCode || -6}
            errorDescription={error}
            onRetry={handleReload}
            onCheckNetwork={handleCheckNetwork}
            onContactSupport={handleContactSupport}
          />
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: DEFAULT_CONFIG.url }}
          style={styles.webView}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleHttpError}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          androidLayerType="hardware"
          cacheEnabled={true}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          renderLoading={() => (
            <AdvancedLoading appName={DEFAULT_CONFIG.title} />
          )}
          renderError={(errorDomain, errorCode, errorDesc) => {
            // 记录错误信息但不显示任何内容（使用自定义错误页面）
            console.log('WebView Error:', errorDomain, errorCode, errorDesc);
            return <View style={{ width: 0, height: 0 }} />;
          }} // 使用自定义错误页面，禁用 WebView 原生错误页面
        />

        {/* 返回键提示（仅在用户第一次按下返回键时显示 2 秒） */}
        {showBackHint && (
          <View style={styles.backHint}>
            <ThemedText variant="caption" color={theme.textMuted}>
              再按一次返回键退出应用
            </ThemedText>
          </View>
        )}

        {/* 权限引导模态框 */}
        <PermissionGuideModal
          visible={showPermissionModal}
          onRequestLater={handleRequestPermissionLater}
          onRequestNow={handleRequestPermissionNow}
          onConfirmPermission={handleConfirmPermission}
        />

        {/* 通知显示模态框 */}
        <NotificationDisplayModal
          visible={showNotificationModal}
          notification={currentNotification}
          onClose={handleCloseNotificationModal}
        />

        {/* 自定义弹窗 */}
        <CustomAlert
          visible={customAlert.visible}
          title={customAlert.title}
          message={customAlert.message}
          buttons={customAlert.buttons}
          icon={customAlert.icon}
          onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
        />
      </View>
    </Screen>
  );
}
