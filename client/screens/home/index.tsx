import React, { useRef, useCallback, useState, useMemo } from 'react';
import { View, TouchableOpacity, Text, BackHandler, Platform, Linking } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AdvancedLoading } from '@/components/AdvancedLoading';
import { AdvancedError } from '@/components/AdvancedError';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

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

  React.useEffect(() => {
    // 监听网络状态变化
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      const connectionType = state.type;

      setIsConnected(isConnected);
      setNetworkType(connectionType);

      // 网络恢复时，自动重新加载
      if (isConnected && !loading && error) {
        console.log('Network restored, reloading...');
        handleReload();
      }
    });

    // 初始网络状态检查
    NetInfo.fetch().then((state) => {
      const isConnected = state.isConnected ?? true; // 默认为 true，避免阻塞
      const connectionType = state.type;

      setIsConnected(isConnected);
      setNetworkType(connectionType);
    });

    // 返回键监听（仅原生平台）
    if (Platform.OS !== 'web') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        backHandler.remove();
        unsubscribe();
        // 清理定时器
        if (backPressTimeout.current) {
          clearTimeout(backPressTimeout.current);
        }
        if (retryTimeout.current) {
          clearTimeout(retryTimeout.current);
        }
      };
    }

    return () => {
      unsubscribe();
    };
  }, [handleBackPress, loading, error]);

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
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          incognito={false}
          saveFormDataDisabled={false}
          thirdPartyCookiesEnabled={true}
          bounces={false}
          overScrollMode="never"
          renderLoading={() => (
            <AdvancedLoading appName={DEFAULT_CONFIG.title} />
          )}
          renderError={(errorDomain, errorCode, errorDesc) => {
            // 记录错误信息但不显示任何内容（使用自定义错误页面）
            console.log('WebView Error:', errorDomain, errorCode, errorDesc);
            return <View style={{ width: 0, height: 0 }} />;
          }} // 使用自定义错误页面，禁用 WebView 原生错误页面
          injectedJavaScript={`
            (function() {
              // 优化 WebView 内部性能
              // 1. 延迟加载非关键资源
              if ('IntersectionObserver' in window) {
                const lazyLoadObserver = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      const img = entry.target;
                      if (img.dataset.src) {
                        img.src = img.dataset.src;
                        lazyLoadObserver.unobserve(img);
                      }
                    }
                  });
                });
                
                document.querySelectorAll('img[data-src]').forEach(img => {
                  lazyLoadObserver.observe(img);
                });
              }
              
              // 2. 减少重排和重绘
              const style = document.createElement('style');
              style.textContent = \`
                * { will-change: transform; }
                img, video { will-change: transform, opacity; }
              \`;
              document.head.appendChild(style);
            })();
            true;
          `}
        />

        {/* 返回键提示（仅在用户第一次按下返回键时显示 2 秒） */}
        {showBackHint && (
          <View style={styles.backHint}>
            <ThemedText variant="caption" color={theme.textMuted}>
              再按一次返回键退出应用
            </ThemedText>
          </View>
        )}
      </View>
    </Screen>
  );
}
