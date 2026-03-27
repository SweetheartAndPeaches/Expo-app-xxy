/* eslint-disable react-hooks/refs */
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { FontAwesome6 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LoadingStep {
  id: string;
  text: string;
  delay: number;
}

const LOADING_STEPS: LoadingStep[] = [
  { id: 'step-1', text: '正在连接服务器...', delay: 300 },
  { id: 'step-2', text: '正在加载页面内容...', delay: 900 },
  { id: 'step-3', text: '正在初始化资源...', delay: 1500 },
  { id: 'step-4', text: '准备就绪', delay: 2100 },
];

type StepStatus = 'pending' | 'spinning' | 'done';

interface AdvancedLoadingProps {
  appName?: string;
}

export function AdvancedLoading({ appName }: AdvancedLoadingProps) {
  const { theme } = useTheme();

  // 轨道旋转动画
  const ring1Rotate = useRef(new Animated.Value(0)).current;
  const ring2Rotate = useRef(new Animated.Value(0)).current;
  const ring3Rotate = useRef(new Animated.Value(0)).current;
  
  // 中心点脉冲动画
  const centerDotScale = useRef(new Animated.Value(1)).current;
  const centerDotOpacity = useRef(new Animated.Value(1)).current;

  // Shimmer 动画
  const shimmerTranslate = useRef(new Animated.Value(-width)).current;

  // 步骤状态
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 轨道圆环1：顺时针旋转，速度较快
    const ring1Animation = Animated.loop(
      Animated.timing(ring1Rotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 轨道圆环2：逆时针旋转，速度中等
    const ring2Animation = Animated.loop(
      Animated.timing(ring2Rotate, {
        toValue: -1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 轨道圆环3：顺时针旋转，速度较慢
    const ring3Animation = Animated.loop(
      Animated.timing(ring3Rotate, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 中心点脉冲动画
    const centerDotAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(centerDotScale, {
            toValue: 1.4,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(centerDotOpacity, {
            toValue: 0.6,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(centerDotScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(centerDotOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Shimmer 动画
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerTranslate, {
        toValue: width * 2,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    ring1Animation.start();
    ring2Animation.start();
    ring3Animation.start();
    centerDotAnimation.start();
    shimmerAnimation.start();

    // 逐步显示加载步骤
    const timers: NodeJS.Timeout[] = [];
    
    LOADING_STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        // 当前步骤变为 spinning
        setStepStatuses(prev => ({
          ...prev,
          [step.id]: 'spinning',
        }));
        
        // 更新进度条
        setProgress((index + 1) * 25);
        
        // 前一个步骤变为 done
        if (index > 0) {
          const prevStep = LOADING_STEPS[index - 1];
          setStepStatuses(prev => ({
            ...prev,
            [prevStep.id]: 'done',
          }));
        }
      }, step.delay);
      
      timers.push(timer);
    });

    return () => {
      ring1Animation.stop();
      ring2Animation.stop();
      ring3Animation.stop();
      centerDotAnimation.stop();
      shimmerAnimation.stop();
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const ring1RotateValue = ring1Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ring2RotateValue = ring2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const ring3RotateValue = ring3Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* 半透明深色背景 */}
      <View style={styles.overlay} />
      
      {/* 加载卡片 */}
      <View style={[styles.loadingCard, { backgroundColor: theme.backgroundRoot }]}>
        {/* 顶部渐变闪烁效果 */}
        <View style={styles.topBar}>
          <Animated.View
            style={[
              styles.shimmerBar,
              {
                backgroundColor: theme.primary,
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
        </View>

        {/* 轨道旋转动画 */}
        <View style={styles.orbitSpinner}>
          {/* 圆环1 */}
          <Animated.View
            style={[
              styles.ring,
              { borderColor: theme.primary },
              {
                transform: [{ rotate: ring1RotateValue }],
              },
            ]}
          />
          
          {/* 圆环2 */}
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              { borderColor: theme.accent || theme.primary },
              {
                transform: [{ rotate: ring2RotateValue }],
              },
            ]}
          />
          
          {/* 圆环3 */}
          <Animated.View
            style={[
              styles.ring,
              styles.ring3,
              { borderColor: theme.primary },
              {
                transform: [{ rotate: ring3RotateValue }],
              },
            ]}
          />
          
          {/* 中心点 */}
          <View style={styles.centerDot}>
            <Animated.View
              style={[
                styles.centerDotInner,
                {
                  backgroundColor: theme.primary,
                  transform: [{ scale: centerDotScale }],
                  opacity: centerDotOpacity,
                },
              ]}
            />
          </View>
        </View>

        {/* 加载标题 */}
        <ThemedText variant="h3" color={theme.primary} style={styles.loadingTitle}>
          正在加载...
        </ThemedText>

        {/* 加载步骤列表 */}
        <View style={styles.stepsContainer}>
          {LOADING_STEPS.map((step, index) => (
            <LoadingStepItem
              key={step.id}
              step={step}
              status={stepStatuses[step.id] || 'pending'}
              theme={theme}
              isVisible={stepStatuses[step.id] !== undefined}
            />
          ))}
        </View>

        {/* 进度条 */}
        <View style={[styles.progressBarContainer, { backgroundColor: `${theme.primary}15` }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>

        {/* 应用名称 */}
        {appName && (
          <ThemedText variant="caption" color={theme.textMuted} style={styles.appName}>
            {appName}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

// 加载步骤项组件
function LoadingStepItem({
  step,
  status,
  theme,
  isVisible,
}: {
  step: LoadingStep;
  status: StepStatus;
  theme: any;
  isVisible: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // 入场动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (status === 'spinning') {
      // 持续旋转
      const animation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    } else if (status === 'done') {
      // 重置旋转角度为 0
      rotateAnim.setValue(0);
    }
  }, [status]);

  const rotateValue = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.stepItem,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
          borderBottomColor: `${theme.primary}1A`,
        },
      ]}
    >
      {/* 步骤图标 */}
      <View style={[styles.stepIcon, { borderColor: status === 'done' ? `${theme.success}66` : `${theme.primary}66` }]}>
        {status === 'pending' && (
          <FontAwesome6 name="circle" size={10} color={theme.primary} />
        )}
        {status === 'spinning' && (
          <Animated.View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: theme.primary,
              borderTopColor: 'transparent',
              transform: [{ rotate: rotateValue }],
            }}
          />
        )}
        {status === 'done' && (
          <FontAwesome6 name="check" size={10} color={theme.success} />
        )}
      </View>

      {/* 步骤文本 */}
      <ThemedText variant="body" color={theme.textSecondary} style={styles.stepText}>
        {step.text}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  loadingCard: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    overflow: 'hidden',
  },
  shimmerBar: {
    width: 100,
    height: '100%',
  },
  orbitSpinner: {
    width: 72,
    height: 72,
    marginBottom: 28,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: 'transparent',
  },
  ring2: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ring3: {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerDot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  stepsContainer: {
    width: '100%',
    marginTop: 18,
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  stepIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  appName: {
    marginTop: 15,
  },
});
