import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { View, BackHandler, Platform, Linking } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { AdvancedLoading } from '@/components/AdvancedLoading';
import { AdvancedError } from '@/components/AdvancedError';
import { FontAwesome6 } from '@expo/vector-icons';
import { createStyles } from './styles';

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
  
  // 获取重试延迟时间（指数退避，最大 5 秒）
  const getRetryDelay = useCallback((count: number) => {
    return Math.min(1000 * Math.pow(2, count), 5000);
  }, []);

  // 检查网络
  const handleCheckNetwork = useCallback(() => {
    Linking.openSettings();
  }, []);

  // 联系支持
  const handleContactSupport = useCallback(() => {
    alert('如需帮助，请联系技术支持');
  }, []);

  // 处理重新加载
  const handleReload = useCallback(() => {
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

  // 处理返回键（仅原生平台）
  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    
    if (!showBackHint) {
      setShowBackHint(true);
      
      if (backPressTimeout.current) {
        clearTimeout(backPressTimeout.current);
      }
      backPressTimeout.current = setTimeout(() => {
        setShowBackHint(false);
      }, 2000);
      
      return true;
    }
    
    return false;
  }, [canGoBack, showBackHint]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        backHandler.remove();
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
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      const connectionType = state.type;

      setIsConnected(connected);
      setNetworkType(connectionType);

      if (connected && !loading && error) {
        console.log('Network restored, reloading...');
        handleReload();
      }
    });

    NetInfo.fetch().then((state) => {
      const connected = state.isConnected ?? true;
      const connectionType = state.type;

      setIsConnected(connected);
      setNetworkType(connectionType);
    });

    return () => {
      unsubscribe();
    };
  }, [handleReload, loading, error]);

  const [networkType, setNetworkType] = useState<string>('unknown');

  // 处理导航变化
  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  // 处理加载状态
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
  }, []);

  const handleLoadEnd = useCallback(async () => {
    setLoading(false);
    setRetryCount(0);
  }, []);

  // 处理加载错误
  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    
    const code = nativeEvent.code || -1;
    const errorDesc = nativeEvent.description || '加载失败';
    
    setErrorCode(code);
    
    let errorMessage = 'लोड विफल, कृपया नेटवर्क कनेक्शन जांचें';
    
    if (code === -6) {
      errorMessage = 'सर्वर से कनेक्ट नहीं हो सका, कृपया नेटवर्क जांचें या बाद में पुनः प्रयास करें';
    } else if (code === -2) {
      errorMessage = 'पृष्ठ मौजूद नहीं है या हटा दिया गया है';
    } else if (code === -1) {
      errorMessage = 'नेटवर्क त्रुटि, कृपया नेटवर्क कनेक्शन जांचें';
    } else if (code === -3) {
      errorMessage = 'सर्वर त्रुटि, कृपया बाद में पुनः प्रयास करें';
    }
    
    if (!isConnected) {
      errorMessage = 'नेटवर्क उपलब्ध नहीं है, कृपया नेटवर्क कनेक्शन जांचें और पुनः प्रयास करें';
    }
    
    setError(errorMessage);
  }, [isConnected]);

  // 处理 HTTP 错误
  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    
    const statusCode = nativeEvent.statusCode;
    let errorMessage = `सर्वर त्रुटि (${statusCode})`;
    
    if (statusCode >= 400 && statusCode < 500) {
      errorMessage = 'पृष्ठ मौजूद नहीं है या हटा दिया गया है';
    } else if (statusCode >= 500) {
      errorMessage = 'सर्वर त्रुटि, कृपया बाद में पुनः प्रयास करें';
    }
    
    setError(errorMessage);
    setErrorCode(statusCode);
  }, []);

  // 自动重试
  const handleAutoRetry = useCallback(() => {
    if (retryCount < maxRetry) {
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      
      setLoading(true);
      setError(null);
      
      const nextRetryCount = retryCount + 1;
      const retryDelay = getRetryDelay(nextRetryCount);
      
      retryTimeout.current = setTimeout(() => {
        setRetryCount(nextRetryCount);
        webViewRef.current?.reload();
        retryTimeout.current = null;
      }, retryDelay);
    } else {
      alert(`पुनः प्रयास ${maxRetry} बार, कृपया नेटवर्क कनेक्शन जांचें`);
    }
  }, [retryCount, getRetryDelay]);

  // Web 平台
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
              नेटवर्क उपलब्ध नहीं है, कृपया नेटवर्क कनेक्शन जांचें
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
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          renderLoading={() => (
            <AdvancedLoading appName={DEFAULT_CONFIG.title} />
          )}
          renderError={(errorDomain, errorCode, errorDesc) => {
            console.log('WebView Error:', errorDomain, errorCode, errorDesc);
            return <View style={{ width: 0, height: 0 }} />;
          }}
        />

        {/* 返回键提示 */}
        {showBackHint && (
          <View style={styles.backHint}>
            <ThemedText variant="caption" color={theme.textMuted}>
              बैक बटन दोबारा दबाएं ऐप से बाहर निकलने के लिए
            </ThemedText>
          </View>
        )}
      </View>
    </Screen>
  );
}
