/* eslint-disable react-hooks/refs */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

interface AdvancedErrorProps {
  errorCode?: number;
  errorDescription?: string;
  onRetry: () => void;
  onCheckNetwork?: () => void;
  onContactSupport?: () => void;
}

export function AdvancedError({
  errorCode = -6,
  errorDescription = '无法连接到服务器',
  onRetry,
  onCheckNetwork,
  onContactSupport,
}: AdvancedErrorProps) {
  const { theme } = useTheme();

  // 地球旋转动画
  const globeRotate = useRef(new Animated.Value(0)).current;
  
  // 信号波动动画
  const signalWave1 = useRef(new Animated.Value(0)).current;
  const signalWave2 = useRef(new Animated.Value(0)).current;
  const signalWave3 = useRef(new Animated.Value(0)).current;
  
  // 锁图标动画
  const lockScale = useRef(new Animated.Value(1)).current;
  const lockShake = useRef(new Animated.Value(0)).current;
  
  // 粒子动画
  const particle1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const particle2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const particle3 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // 确定错误类型
  const getErrorType = () => {
    if (errorCode === -6 || errorDescription?.includes('ERR_CONNECTION_REFUSED')) {
      return 'blocked';
    }
    if (errorCode === -2 || errorDescription?.includes('not found')) {
      return 'notfound';
    }
    if (errorCode === -1 || errorDescription?.includes('network')) {
      return 'network';
    }
    return 'unknown';
  };

  const errorType = getErrorType();

  const animateParticle = (particle: Animated.ValueXY, duration: number) => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: Math.random() * 200 - 100,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: Math.random() * 200 - 100,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return animation;
  };

  useEffect(() => {
    // 地球持续旋转
    const globeAnimation = Animated.loop(
      Animated.timing(globeRotate, {
        toValue: 1,
        duration: 20000,
        easing: (value) => value,
        useNativeDriver: true,
      })
    );
    globeAnimation.start();

    // 信号波纹动画
    const waveAnimations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(signalWave1, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(signalWave1, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(666),
          Animated.timing(signalWave2, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(signalWave2, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.delay(1332),
          Animated.timing(signalWave3, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(signalWave3, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ])
      ),
    ];

    waveAnimations.forEach(anim => anim.start());

    // 锁图标动画（仅在被阻止时）
    if (errorType === 'blocked') {
      const lockAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(lockScale, {
            toValue: 1.1,
            duration: 800,
            easing: (value) => value,
            useNativeDriver: true,
          }),
          Animated.timing(lockScale, {
            toValue: 1,
            duration: 800,
            easing: (value) => value,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(lockShake, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(lockShake, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(lockShake, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(lockShake, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      lockAnimation.start();
    }

    // 粒子动画
    const particleAnimations = [
      animateParticle(particle1, 3000),
      animateParticle(particle2, 4000),
      animateParticle(particle3, 5000),
    ];

    return () => {
      globeAnimation.stop();
      waveAnimations.forEach(anim => anim.stop());
      particleAnimations.forEach(anim => anim.stop());
    };
  }, [errorType]);

  const globeRotateValue = globeRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const lockShakeValue = lockShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      {/* 渐变背景 */}
      <View style={[styles.background, { backgroundColor: theme.backgroundRoot }]} />

      {/* 粒子效果 */}
      <Animated.View
        style={[
          styles.particle,
          {
            transform: [{ translateX: particle1.x }, { translateY: particle1.y }],
          },
        ]}
      >
        <View style={[styles.particleDot, { backgroundColor: `${theme.primary}33` }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            transform: [{ translateX: particle2.x }, { translateY: particle2.y }],
          },
        ]}
      >
        <View style={[styles.particleDot, styles.particleDotLarge, { backgroundColor: `${theme.accent}33` }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.particle,
          styles.particle3,
          {
            transform: [{ translateX: particle3.x }, { translateY: particle3.y }],
          },
        ]}
      >
        <View style={[styles.particleDot, { backgroundColor: `${theme.primary}33` }]} />
      </Animated.View>

      {/* 错误卡片 */}
      <View style={[styles.errorCard, { backgroundColor: theme.backgroundRoot }]}>
        {/* 错误图标 */}
        <View style={styles.iconContainer}>
          {errorType === 'blocked' ? (
            <>
              {/* 地球 + 锁 */}
              <View style={styles.iconWrapper}>
                <Animated.View style={{ transform: [{ rotate: globeRotateValue }] }}>
                  <FontAwesome6 name="earth-americas" size={80} color={theme.primary} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.lockIcon,
                    {
                      transform: [
                        { scale: lockScale },
                        { rotate: lockShakeValue },
                      ],
                    },
                  ]}
                >
                  <FontAwesome6 name="lock" size={40} color={theme.error} />
                </Animated.View>
              </View>
            </>
          ) : (
            <>
              {/* 信号图标 */}
              <View style={styles.iconWrapper}>
                <Animated.View
                  style={[
                    styles.signalWave,
                    {
                      opacity: signalWave1,
                      transform: [{ scale: signalWave1 }],
                      borderColor: theme.primary,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.signalWave,
                    styles.signalWave2,
                    {
                      opacity: signalWave2,
                      transform: [{ scale: signalWave2 }],
                      borderColor: theme.primary,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.signalWave,
                    styles.signalWave3,
                    {
                      opacity: signalWave3,
                      transform: [{ scale: signalWave3 }],
                      borderColor: theme.primary,
                    },
                  ]}
                />
                <FontAwesome6 name="wifi" size={80} color={theme.error} />
              </View>
            </>
          )}
        </View>

        {/* 错误标题 */}
        <ThemedText variant="h2" color={theme.textPrimary} style={styles.errorTitle}>
          {errorType === 'blocked' ? '无法访问' : '连接失败'}
        </ThemedText>

        {/* 错误描述 */}
        <View style={styles.errorContent}>
          <ThemedText variant="body" color={theme.textSecondary} style={styles.errorDescription}>
            {errorType === 'blocked'
              ? '检测到当前网络环境可能受到限制，无法正常访问目标服务器。这可能是因为：'
              : errorDescription}
          </ThemedText>

          {errorType === 'blocked' && (
            <View style={styles.reasons}>
              <View style={styles.reasonItem}>
                <FontAwesome6 name="shield-halved" size={16} color={theme.primary} />
                <ThemedText variant="small" color={theme.textSecondary}>
                  当地网络政策限制
                </ThemedText>
              </View>
              <View style={styles.reasonItem}>
                <FontAwesome6 name="globe" size={16} color={theme.primary} />
                <ThemedText variant="small" color={theme.textSecondary}>
                  地区访问限制
                </ThemedText>
              </View>
              <View style={styles.reasonItem}>
                <FontAwesome6 name="network-wired" size={16} color={theme.primary} />
                <ThemedText variant="small" color={theme.textSecondary}>
                  防火墙或安全软件拦截
                </ThemedText>
              </View>
            </View>
          )}

          {/* 错误代码 */}
          <View style={[styles.errorCode, { backgroundColor: `${theme.error}15` }]}>
            <ThemedText variant="caption" color={theme.error}>
              错误代码: {errorCode}
            </ThemedText>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={onRetry}
          >
            <FontAwesome6 name="rotate-right" size={16} color={theme.buttonPrimaryText} />
            <ThemedText variant="smallMedium" color={theme.buttonPrimaryText}>
              重新尝试
            </ThemedText>
          </TouchableOpacity>

          {onCheckNetwork && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton, { backgroundColor: `${theme.primary}15` }]}
              onPress={onCheckNetwork}
            >
              <FontAwesome6 name="network-wired" size={16} color={theme.primary} />
              <ThemedText variant="smallMedium" color={theme.primary}>
                检查网络
              </ThemedText>
            </TouchableOpacity>
          )}

          {onContactSupport && (
            <TouchableOpacity
              style={[styles.actionButton, styles.tertiaryButton, { backgroundColor: `${theme.primary}15` }]}
              onPress={onContactSupport}
            >
              <FontAwesome6 name="headset" size={16} color={theme.primary} />
              <ThemedText variant="smallMedium" color={theme.primary}>
                联系支持
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* 提示信息 */}
        <View style={[styles.hint, { backgroundColor: `${theme.textMuted}10` }]}>
          <FontAwesome6 name="lightbulb" size={14} color={theme.textMuted} />
          <ThemedText variant="caption" color={theme.textMuted}>
            提示：您可以尝试切换网络或使用 VPN 来访问
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle2: {
    top: '20%',
    right: '10%',
  },
  particle3: {
    bottom: '30%',
    left: '15%',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particleDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  errorCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  signalWave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  signalWave2: {
    width: 80,
    height: 80,
  },
  signalWave3: {
    width: 60,
    height: 60,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContent: {
    width: '100%',
    marginBottom: 30,
  },
  errorDescription: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  reasons: {
    marginBottom: 15,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
  },
  errorCode: {
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 50,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  tertiaryButton: {
    borderWidth: 1,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
});
