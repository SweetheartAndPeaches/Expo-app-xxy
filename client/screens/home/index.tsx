import React, { useRef, useCallback, useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, BackHandler, Platform } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AdvancedLoading } from '@/components/AdvancedLoading';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { createStyles } from './styles';

// 默认配置（可通过环境变量或配置文件覆盖）
const DEFAULT_CONFIG = {
  url: process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://gamepay-app-rouge.vercel.app',
  title: process.env.EXPO_PUBLIC_APP_TITLE || 'WebView',
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
  
  // 路由导航
  const router = useSafeRouter();
  
  // 获取重试延迟时间（指数退避，最大 5 秒）
  const getRetryDelay = useCallback((count: number) => {
    return Math.min(1000 * Math.pow(2, count), 5000);
  }, []);

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

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    // 重置重试计数
    setRetryCount(0);
  }, []);

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
    
    setError(errorMessage);
  }, []);

  // 重新加载（仅原生平台）
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
        {/* 错误提示 */}
        {error && (
          <ThemedView level="default" style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <FontAwesome6 name="wifi" size={40} color={theme.error} />
            </View>
            
            <ThemedText variant="h3" color={theme.textPrimary} style={styles.errorTitle}>
              无法加载页面
            </ThemedText>
            
            <ThemedText variant="body" color={theme.textSecondary} style={styles.errorText}>
              {error}
            </ThemedText>
            
            {errorCode && (
              <ThemedText variant="caption" color={theme.textMuted} style={styles.errorCode}>
                错误代码: {errorCode}
              </ThemedText>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.retryButton, styles.primaryButton]} 
                onPress={handleReload}
              >
                <FontAwesome6 name="rotate-right" size={16} color={theme.buttonPrimaryText} style={styles.buttonIcon} />
                <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>
                  立即重试
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.retryButton, styles.secondaryButton]} 
                onPress={handleAutoRetry}
              >
                <FontAwesome6 name="clock" size={16} color={theme.textPrimary} style={styles.buttonIcon} />
                <ThemedText variant="smallMedium" color={theme.textPrimary}>
                  自动重试 ({retryCount}/{maxRetry})
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: DEFAULT_CONFIG.url }}
          style={styles.webView}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Android 特定配置
          androidLayerType="hardware"
          cacheEnabled={true}
          // 安全配置
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          // 自定义 User-Agent（可选，用于伪装成浏览器）
          // userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          renderLoading={() => (
            <AdvancedLoading appName={DEFAULT_CONFIG.title} />
          )}
        />

        {/* 返回键提示（仅在用户第一次按下返回键时显示 2 秒） */}
        {showBackHint && (
          <View style={styles.backHint}>
            <ThemedText variant="caption" color={theme.textMuted}>
              再按一次返回键退出应用
            </ThemedText>
          </View>
        )}
        
        {/* 通知监听按钮（仅 Android 平台） */}
        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <FontAwesome6 name="bell" size={20} color={theme.buttonPrimaryText} />
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}
