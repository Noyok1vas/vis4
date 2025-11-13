import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function LandingScreen() {
  // 进度条宽度动画值（从 0 到 1，表示百分比）
  const progressWidth = useRef(new Animated.Value(0)).current;
  // 耳机图片透明度动画值（从 0.2 到 1）
  const productOpacity = useRef(new Animated.Value(0.2)).current;
  // 耳机图片弹跳动画值（上下移动）
  const productBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 同时启动进度条和透明度动画
    Animated.parallel([
      // 进度条动画：从 0% 到 100%，持续 2 秒
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false, // width 不支持 native driver
      }),
      // 耳机图片透明度动画：从 0.2 到 1，持续 2 秒
      Animated.timing(productOpacity, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true, // opacity 支持 native driver
      }),
    ]).start();

    // 弹跳动画：持续循环，上下移动
    Animated.loop(
      Animated.sequence([
        Animated.timing(productBounce, {
          toValue: -8, // 向上移动 8px
          duration: 1000,
          useNativeDriver: true, // translateY 支持 native driver
        }),
        Animated.timing(productBounce, {
          toValue: 0, // 回到原位置
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 计算进度条宽度（基于百分比）
  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>©BrandName</Text>
      <Text style={styles.tagline}>THIS IS A TAGLINE</Text>

      <Animated.Image 
        source={require('../assets/BoseOpen01.png')} 
        style={[
          styles.product, 
          { 
            opacity: productOpacity,
            transform: [{ translateY: productBounce }],
          }
        ]} 
        resizeMode="contain" 
      />

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width: progressBarWidth }]} />
      </View>

      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/home')}>
        <Text style={styles.exploreText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );
}

//------------------------------------------------- Landing Screen Styles -------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: '#8A8A8A',
    fontSize: 18,
    marginBottom: 24,
  },
  tagline: {
    color: '#EDEDED',
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 24,
    fontFamily: 'Courier',
  },
  product: {
    width: '90%',
    height: 350,
    marginVertical: 24,
  },
  progressBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2B2B2B',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 40,
    alignSelf: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#CFCFCF',
  },
  exploreButton: {
    width: '80%',
    backgroundColor: '#E0E0E0',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    alignSelf: 'center',
  },
  exploreText: {
    color: '#1A1A1A',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: 'Courier',
  },
});


