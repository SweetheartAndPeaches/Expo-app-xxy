import React, { useRef, useCallback, useState, useMemo } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, BackHandler, Platform } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/Screen';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AdvancedLoading } from '@/components/AdvancedLoading';
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

  // 处理返回键（仅原生平台）
  const handleBackPress = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true; // 阻止默认返回行为
    }
    return false; // 允许默认返回行为（退出应用）
  }, [canGoBack]);

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
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
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  // 处理加载错误（仅原生平台）
  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    setError(nativeEvent.description || '加载失败，请检查网络连接');
  }, []);

  // 重新加载（仅原生平台）
  const handleReload = useCallback(() => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

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
            <ThemedText variant="body" color={theme.error} style={styles.errorText}>
              {error}
            </ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
              <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>
                重试
              </ThemedText>
            </TouchableOpacity>
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

        {/* 返回键提示（仅当可以返回时显示） */}
        {canGoBack && (
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
