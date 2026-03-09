import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, Text, BackHandler, Platform, Linking, Alert, AppState, AppStateStatus } from 'react-native';
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
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

// 通知监听模块（仅在原生平台使用）
import * as NotificationListenerModule from 'react-native-notification-listener';

const NotificationListener = Platform.OS === 'web' ? null : NotificationListenerModule;

// 默认配置（可通过环境变量或配置文件覆盖）
const DEFAULT_CONFIG = {
  url: process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://gamepay-app-rouge.vercel.app',
  title: process.env.EXPO_PUBLIC_APP_TITLE || '蜂享钱包',
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
  const [forceStartListener, setForceStartListener] = useState(false); // 强制启动监听器
  const [showStatusIndicator, setShowStatusIndicator] = useState(false); // 显示状态指示器
  
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
  const checkNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'web' || !NotificationListener) {
      console.log('[checkNotificationPermission] Platform is web or NotificationListener is null, returning true');
      return true;
    }

    try {
      // 使用 react-native-notification-listener 提供的 getPermissionStatus() 方法
      // @ts-ignore - react-native-notification-listener 类型定义不完整
      const status = await NotificationListener.getPermissionStatus();
      console.log('[checkNotificationPermission] Permission status:', status);
      
      // 只有当系统明确返回 'authorized' 时，才认为权限已开启
      // 'unknown' 表示系统还没有确认权限状态，需要引导用户去开启
      // 'denied' 表示未授权
      if (status === 'authorized') {
        console.log('[checkNotificationPermission] Permission is authorized');
        return true;
      } else if (status === 'unknown') {
        console.log('[checkNotificationPermission] Permission status is unknown, treating as not authorized');
        // unknown 状态不代表权限已开启，返回 false，让用户去确认是否开启了权限
        return false;
      } else {
        console.log('[checkNotificationPermission] Permission is denied or other status');
        return false;
      }
    } catch (error) {
      console.error('[checkNotificationPermission] Failed to check permission:', error);
      // 检测失败时，保守处理，认为权限未开启
      console.log('[checkNotificationPermission] Check failed, treating as not authorized');
      return false;
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
          const message = `请在系统设置中按以下步骤操作：

【小米/红米手机】
1. 打开"设置"
2. 点击"应用设置" > "应用管理"
3. 找到并点击"蜂享钱包"
4. 点击"通知管理"
5. 找到"通知使用权"并开启

【华为/荣耀手机】
1. 打开"设置"
2. 点击"应用和服务" > "应用管理"
3. 找到并点击"蜂享钱包"
4. 点击"通知管理" > "通知使用权"
5. 开启"蜂享钱包"开关

【OPPO/Vivo手机】
1. 打开"设置"
2. 点击"应用" > "应用管理"
3. 找到并点击"蜂享钱包"
4. 点击"通知管理" > "通知使用情况"
5. 开启"蜂享钱包"开关

【通用方法】
1. 打开"设置"
2. 点击"特殊访问"
3. 点击"通知访问权限"
4. 在列表中找到"蜂享钱包"并开启开关

💡 提示：不是"允许通知"开关，而是"通知访问权限"或"通知使用权"开关！`;

          Alert.alert(
            '无法自动跳转',
            message,
            [
              { text: '取消', style: 'cancel' },
              { text: '打开设置', onPress: () => Linking.openSettings() }
            ]
          );
        }
      });
    }
  }, []);

  // 处理权限请求 - 立即授权
  const handleRequestPermissionNow = useCallback(() => {
    setShowPermissionModal(false);
    
    // 显示提示，告诉用户接下来要做什么
    const message = `系统会尝试自动跳转到"通知访问权限"页面。

如果跳转成功：
- 在列表中找到"蜂享钱包"
- 打开开关即可

如果跳转到了错误的页面（比如"应用通知"页面）：
- 返回，再次点击"去开启权限"按钮
- 或者按以下步骤手动操作：
  1. 打开手机"设置"
  2. 找到"特殊访问"
  3. 点击"通知访问权限"
  4. 找到"蜂享钱包"并开启

⚠️ 重要：
- ❌ 不要开启"允许通知"开关
- ✅ 要开启"通知访问权限"开关`;

    Alert.alert(
      '即将打开设置',
      message,
      [
        { text: '稍后提醒', style: 'cancel', onPress: () => {
          // 用户选择稍后，3分钟后再次提示
          setTimeout(() => {
            setShowPermissionModal(true);
          }, 180000);
        }},
        { 
          text: '我知道了', 
          onPress: () => {
            openNotificationSettings();
          }
        }
      ]
    );
  }, [openNotificationSettings]);

  // 处理权限请求 - 稍后提醒
  const handleRequestPermissionLater = useCallback(() => {
    setShowPermissionModal(false);
    // 1分钟后再次检查
    setTimeout(() => {
      if (!hasNotificationPermission && !loading) {
        setShowPermissionModal(true);
      }
    }, 60000);
  }, [hasNotificationPermission, loading]);

  // 处理重新检查权限
  const handleRecheckPermission = useCallback(async () => {
    console.log('[handleRecheckPermission] Starting permission recheck...');
    
    const hasPermission = await checkNotificationPermission();
    console.log('[handleRecheckPermission] Permission check result:', hasPermission);
    
    setHasNotificationPermission(hasPermission);
    
    if (hasPermission) {
      // 权限已开启，关闭弹窗
      setShowPermissionModal(false);
      Alert.alert('✅ 权限已开启', '您已成功开启通知访问权限，现在可以正常使用功能了！');
    } else {
      // 权限仍未开启，显示详细的调试信息
      const debugInfo = `权限检测结果：未授权

调试信息：
- 权限状态：未授权
- 监听器状态：${unsubscribeNotificationListener.current ? '运行中' : '未启动'}

可能的原因：
1. 您在"通知访问权限"页面开启了"蜂享钱包"开关
2. 但系统需要时间更新权限状态（可能需要 10-30 秒）
3. 或者您开启的是"允许通知"而不是"通知访问权限"

建议操作：
1. 返回"通知访问权限"页面
2. 确认"蜂享钱包"的开关是打开的
3. 等待 10-30 秒
4. 再次点击"已开启，重新检查"
5. 如果仍然失败，请尝试：
   - 关闭开关，再重新打开
   - 或者重启应用`;

      Alert.alert('未检测到权限', debugInfo, [{ text: '我知道了' }]);
    }
  }, [checkNotificationPermission]);

  // 调试：显示当前状态
  const handleDebug = useCallback(async () => {
    try {
      // @ts-ignore
      const status = await NotificationListener?.getPermissionStatus?.();
      
      const notifications = await (await import('@/utils/notificationManager')).getNotifications();
      
      const debugInfo = `📱 调试信息

权限状态：
- hasNotificationPermission: ${hasNotificationPermission}
- getPermissionStatus(): ${status || 'unknown'}

监听器状态：
- 轮询监听器：${unsubscribeNotificationListener.current ? '✅ 运行中' : '❌ 未启动'}

通知数据：
- 已存储通知数量：${notifications.length}
- 最新通知：${notifications.length > 0 ? JSON.stringify(notifications[0], null, 2) : '无'}

应用状态：
- Platform: ${Platform.OS}
- Loading: ${loading}`;

      Alert.alert('调试信息', debugInfo, [{ text: '关闭' }]);
    } catch (error) {
      console.error('[Debug] Error:', error);
      Alert.alert('调试错误', `获取调试信息失败：${error}`);
    }
  }, [hasNotificationPermission, loading, forceStartListener]);

  // 测试权限：通过实际测试验证权限
  const handleTestPermission = useCallback(async () => {
    console.log('[handleTestPermission] Testing permission by checking listener status...');
    
    // 检查监听器是否在运行
    const isListenerRunning = unsubscribeNotificationListener.current !== null;
    console.log('[handleTestPermission] Listener running:', isListenerRunning);
    
    // 检查是否有收到过通知
    const { getNotifications } = await import('@/utils/notificationManager');
    const notifications = await getNotifications();
    const hasReceivedNotifications = notifications.length > 0;
    console.log('[handleTestPermission] Received notifications count:', notifications.length);
    
    // 检查权限状态
    // @ts-ignore
    const status = await NotificationListener?.getPermissionStatus?.();
    console.log('[handleTestPermission] Permission status:', status);
    
    // 综合判断权限是否开启
    let permissionResult = false;
    let resultReason = '';
    
    if (isListenerRunning) {
      // 监听器在运行，说明系统允许监听通知
      permissionResult = true;
      resultReason = '监听器正在运行，说明系统已授权通知访问权限';
    } else if (hasReceivedNotifications) {
      // 收到过通知，说明之前有权限
      permissionResult = true;
      resultReason = '之前收到过通知，说明有通知访问权限';
    } else if (status === 'authorized') {
      // 系统状态是已授权
      permissionResult = true;
      resultReason = '系统返回已授权状态';
    } else {
      permissionResult = false;
      resultReason = '监听器未运行，未收到过通知，系统状态也不是已授权';
    }
    
    console.log('[handleTestPermission] Test result:', permissionResult, 'Reason:', resultReason);
    
    // 更新权限状态
    setHasNotificationPermission(permissionResult);
    
    // 显示测试结果
    Alert.alert(
      permissionResult ? '✅ 权限测试通过' : '❌ 权限测试失败',
      `测试结果：${permissionResult ? '已授权' : '未授权'}

判定依据：${resultReason}

详细信息：
- 监听器状态：${isListenerRunning ? '✅ 运行中' : '❌ 未运行'}
- 已接收通知数量：${notifications.length}
- 系统权限状态：${status || 'unknown'}`,
      [
        { text: '关闭' },
        ...(permissionResult ? [{ text: '确定', onPress: () => setShowPermissionModal(false) }] : [])
      ]
    );
  }, []);

  // 强制启动监听器
  const handleForceStartListener = useCallback(() => {
    console.log('[handleForceStartListener] Forcing listener to start');
    setForceStartListener(true);
    Alert.alert(
      '✅ 监听器已强制启动',
      '监听器已强制启动，现在会尝试监听通知。请用 QQ 发送一条消息测试。' + 
      '\n\n如果还是收不到通知，请确认：\n1. 您已在"通知访问权限"页面开启"蜂享钱包"开关\n2. 应用在前台运行\n3. QQ 消息已出现在系统通知栏',
      [{ text: '我知道了' }]
    );
  }, []);

  // 处理通知显示模态框关闭
  const handleCloseNotificationModal = useCallback(() => {
    setShowNotificationModal(false);
  }, []);

  // 通知监听清理函数
  const unsubscribeNotificationListener = useRef<(() => void) | null>(null);

  // 监听新通知（仅在有权限时或强制启动时）
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('[Home] Notification listener not started: platform is web');
      return;
    }

    // 只有在有权限或强制启动时才启动监听器
    if (!hasNotificationPermission && !forceStartListener) {
      console.log('[Home] Notification listener not started: no permission and not forced');
      return;
    }

    console.log('[Home] Starting notification listener (permission:', hasNotificationPermission, ', forced:', forceStartListener, ')');

    try {
      // 使用轮询监听新通知
      const { listenForNewNotifications } = require('@/utils/notificationManager');
      
      unsubscribeNotificationListener.current = listenForNewNotifications(
        (notification: any) => {
          console.log('[Home] New notification received:', notification);
          
          // 显示通知内容
          setCurrentNotification({
            title: notification.title || '新消息',
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
  }, [hasNotificationPermission, forceStartListener]);

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
        const hasPermission = await checkNotificationPermission();
        setHasNotificationPermission(hasPermission);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkNotificationPermission]);

  // 首次启动时显示权限已开启的提示（如果监听器在运行）
  useEffect(() => {
    if (Platform.OS !== 'web' && unsubscribeNotificationListener.current && hasNotificationPermission) {
      // 监听器正在运行且权限已开启，显示一次性提示
      const hasShownPermissionSuccess = AsyncStorage.getItem('@app_shown_permission_success');
      
      if (!hasShownPermissionSuccess) {
        // 延迟 3 秒显示，让用户先看到页面
        setTimeout(() => {
          Alert.alert(
            '✅ 通知访问权限已开启',
            '通知监听器正在运行，可以接收并显示通知。\n\n点击右上角的 ℹ️ 图标可以查看监听状态。',
            [
              { text: '我知道了' }
            ]
          );
          AsyncStorage.setItem('@app_shown_permission_success', 'true');
        }, 3000);
      }
    }
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
    if (Platform.OS !== 'web' && !hasNotificationPermission) {
      const hasPermission = await checkNotificationPermission();
      if (!hasPermission) {
        // 延迟 2 秒后显示权限请求弹窗，让用户先看到页面内容
        setTimeout(() => {
          setShowPermissionModal(true);
        }, 2000);
      }
    }
  }, [hasNotificationPermission, checkNotificationPermission]);

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
                    通知监听状态
                  </Text>
                  <TouchableOpacity onPress={() => setShowStatusIndicator(false)}>
                    <FontAwesome6 name="xmark" size={14} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.statusIndicatorContent}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>监听器状态：</Text>
                    <Text style={[styles.statusValue, { color: unsubscribeNotificationListener.current ? '#4CAF50' : '#FF9800' }]}>
                      {unsubscribeNotificationListener.current ? '✅ 运行中' : '❌ 未运行'}
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>权限状态：</Text>
                    <Text style={[styles.statusValue, { color: hasNotificationPermission ? '#4CAF50' : '#FF9800' }]}>
                      {hasNotificationPermission ? '✅ 已开启' : '❌ 未开启'}
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>强制启动：</Text>
                    <Text style={[styles.statusValue, { color: forceStartListener ? '#4CAF50' : '#999' }]}>
                      {forceStartListener ? '✅ 已开启' : '未开启'}
                    </Text>
                  </View>
                </View>
                
                {unsubscribeNotificationListener.current && (
                  <View style={[styles.statusHint, { backgroundColor: '#4CAF5020', borderColor: '#4CAF5040' }]}>
                    <FontAwesome6 name="circle-check" size={12} color="#4CAF50" />
                    <Text style={[styles.statusHintText, { color: theme.textSecondary }]}>
                      通知监听器正在运行，可以接收通知
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
          onRecheck={handleRecheckPermission}
          onDebug={handleDebug}
          onForceStart={handleForceStartListener}
          onTestPermission={handleTestPermission}
        />

        {/* 通知显示模态框 */}
        <NotificationDisplayModal
          visible={showNotificationModal}
          notification={currentNotification}
          onClose={handleCloseNotificationModal}
        />
      </View>
    </Screen>
  );
}
