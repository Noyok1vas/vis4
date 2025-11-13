import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAudio } from '../contexts/AudioContext';
import Waveform from '../components/Waveform';

export default function PlayerScreen() {
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const lastPosition = useRef(0);
  const sliderPositionRef = useRef(0);
  const isCreationModeRef = useRef(isCreationMode);
  const isDraggingRef = useRef(false); // 用于标记是否正在拖拽
  const [dragProgress, setDragProgress] = useState<number | null>(null); // 拖拽时的临时progress
  const dragDurationRef = useRef<number>(0); // 拖拽时缓存的 duration，确保使用正确的时长
  const [sBoxWidth, setSBoxWidth] = useState(80); // S框默认宽度，会在onLayout中更新
  const [eBoxWidth, setEBoxWidth] = useState(80); // E框默认宽度，会在onLayout中更新
  // 使用 Animated.Value 来实现平滑的位置更新（只在非 Creation Mode 时使用）
  const animatedPosition = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastPositionSetTime = useRef<number>(0); // 记录上次设置位置的时间，用于防抖
  // Use global audio context
  const { 
    isPlaying, 
    togglePlayPause, 
    pause, // 添加 pause 方法
    play, // 添加 play 方法
    sound, // 添加 sound 对象，用于直接控制播放
    currentTrack, 
    nextSong, 
    previousSong, 
    positionMillis, 
    durationMillis,
    currentWaveformData, // 获取当前波形数据
    setPositionAsync, // 设置播放位置
  } = useAudio();
  
  // 缓存 sound 对象，确保拖拽时使用最新的
  const soundRef = useRef(sound);
  
  // 计算播放进度 (0-1)
  // 如果正在拖拽，使用拖拽时的临时progress；否则使用实际的播放进度
  const progress = dragProgress !== null 
    ? dragProgress 
    : (durationMillis > 0 ? positionMillis / durationMillis : 0);

  // Selection frame coordinates: left and right edges (offset from center of screen)
  const screenWidth = Dimensions.get('window').width;
  const waveformWidth = screenWidth * 3.0; // 波形总宽度
  
  // 格式化时间为 MM:SS
  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || isNaN(milliseconds) || milliseconds < 0) {
      return '00:00';
    }
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const [selectionLeft, setSelectionLeft] = useState(-screenWidth * 0.15); // initial left edge position
  const [selectionRight, setSelectionRight] = useState(screenWidth * 0.15); // initial right edge position
  const selectionLeftRef = useRef(selectionLeft);
  const selectionRightRef = useRef(selectionRight);
  const lastSelectionLeft = useRef(selectionLeft);
  const lastSelectionRight = useRef(selectionRight);
  
  // 计算自动位置：让播放位置在屏幕中心
  // 播放位置在波形中的绝对位置：progress * waveformWidth
  // 屏幕中心位置：screenWidth / 2
  // 波形偏移量：autoPosition = screenWidth / 2 - progress * waveformWidth
  const calculateAutoPosition = (progress: number): number => {
    const playheadPosition = progress * waveformWidth;
    const screenCenter = screenWidth / 2;
    let autoPosition = screenCenter - playheadPosition;
    
    // 限制边界：确保波形不会超出可视范围
    // maxOffset: waveform左边缘最多到屏幕中心
    // 当sliderPosition = screenWidth / 2时，waveform左边缘在屏幕中心
    // minOffset: waveform右边缘最多到屏幕中心
    // 当sliderPosition = screenWidth / 2 - waveformWidth时，waveform右边缘在屏幕中心
    // 因为：waveformWidth + sliderPosition = 3 * screenWidth + (screenWidth / 2 - 3 * screenWidth) = screenWidth / 2
    const maxOffset = screenWidth / 2; // waveform左边缘最多到屏幕中心
    const minOffset = screenWidth / 2 - waveformWidth; // waveform右边缘最多到屏幕中心
    
    // 限制在合理范围内
    autoPosition = Math.max(Math.min(autoPosition, maxOffset), minOffset);
    
    return autoPosition;
  };
  
  // 计算selection frame的起止时间
  // 简化计算：只考虑selection frame在waveform上的相对位置
  // 关键理解：selection frame和waveform都应用了相同的transform: translateX(sliderPosition)
  // 所以它们的相对位置保持不变，selection frame在waveform上的位置不依赖于sliderPosition
  // 
  // 计算原理：
  // - waveform的原点在屏幕上的位置是：sliderPosition（因为waveform向右移动了sliderPosition）
  // - selection frame左边框在屏幕上的位置是：screenWidth / 2 + selectionLeft + sliderPosition
  // - 所以selection frame左边框在waveform坐标系中的位置是：
  //   (screenWidth / 2 + selectionLeft + sliderPosition) - sliderPosition = screenWidth / 2 + selectionLeft
  const { startTime, endTime } = useMemo(() => {
    if (!durationMillis || durationMillis <= 0 || isNaN(durationMillis)) {
      return { startTime: 0, endTime: 0 };
    }
    
    // 计算左边框在waveform中的绝对位置
    // 由于selection frame和waveform都应用了相同的transform，相对位置保持不变
    const leftEdgeInWaveform = screenWidth / 2 + selectionLeft;
    
    // 计算右边框在waveform中的绝对位置
    const rightEdgeInWaveform = screenWidth / 2 + selectionRight;
    
    // 确保位置在有效范围内 [0, waveformWidth]
    const clampedLeft = Math.max(0, Math.min(leftEdgeInWaveform, waveformWidth));
    const clampedRight = Math.max(0, Math.min(rightEdgeInWaveform, waveformWidth));
    
    // 计算时间比例并映射到歌曲时长
    // 这些值基于waveform上的绝对位置，所以无论waveform如何拖动，只要frame在waveform上的位置不变，时间就不变
    const startTime = (clampedLeft / waveformWidth) * durationMillis;
    const endTime = (clampedRight / waveformWidth) * durationMillis;
    
    return { startTime, endTime };
  }, [selectionLeft, selectionRight, durationMillis, screenWidth, waveformWidth]);
  
  // 格式化起止时间
  const startTimeFormatted = formatTime(startTime);
  const endTimeFormatted = formatTime(endTime);
  
  // Creation Mode 下的播放控制：只播放选中的时间区间，循环播放
  const handleCreationModePlayPause = async () => {
    if (!isCreationMode) {
      // 非 Creation Mode，使用默认行为
      await togglePlayPause();
      return;
    }
    
    // Creation Mode 下的特殊处理
    if (isPlaying) {
      // 如果正在播放，暂停（暂停功能不变）
      await pause();
    } else {
      // 如果暂停，定位到选择的乐段开头并开始播放
      // 直接使用 sound 对象来设置位置和播放，避免 setPositionAsync 的逻辑干扰
      if (sound) {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            // 先暂停（如果正在播放）
            if (status.isPlaying) {
              await sound.pauseAsync();
            }
            // 设置位置到 startTime
            await sound.setPositionAsync(startTime);
            // 开始播放
            await sound.playAsync();
          }
        } catch (error) {
          console.error('Error in Creation Mode play:', error);
          // 如果直接操作失败，回退到使用 setPositionAsync 和 play
          await setPositionAsync(startTime);
          await new Promise(resolve => setTimeout(resolve, 100));
          await play();
        }
      } else {
        // 如果没有 sound 对象，使用默认方法
        await setPositionAsync(startTime);
        await new Promise(resolve => setTimeout(resolve, 100));
        await play();
      }
    }
  };
  
  // Refresh 按钮：从头开始播放选中的片段
  const handleRefresh = async () => {
    if (!isCreationMode || !durationMillis || startTime >= endTime) {
      return;
    }
    
    // 直接使用 sound 对象来设置位置和播放
    const currentSound = soundRef.current || sound;
    if (currentSound) {
      try {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded) {
          // 先暂停（如果正在播放）
          if (status.isPlaying) {
            await currentSound.pauseAsync();
          }
          // 设置位置到 startTime
          await currentSound.setPositionAsync(startTime);
          // 开始播放
          await currentSound.playAsync();
        }
      } catch (error) {
        console.error('Error in refresh:', error);
        // 如果直接操作失败，回退到使用 setPositionAsync 和 play
        await setPositionAsync(startTime);
        await new Promise(resolve => setTimeout(resolve, 100));
        await play();
      }
    } else {
      // 如果没有 sound 对象，使用默认方法
      await setPositionAsync(startTime);
      await new Promise(resolve => setTimeout(resolve, 100));
      await play();
    }
  };
  
  // 监听播放位置，在 Creation Mode 下实现循环播放
  useEffect(() => {
    if (isCreationMode && isPlaying && durationMillis > 0 && endTime > startTime) {
      // 当播放位置达到或超过 endTime 时，跳回到 startTime
      // 使用小的容差值（50ms），避免在边界处频繁触发
      const threshold = endTime - 50;
      if (positionMillis >= threshold) {
        // 添加防抖，避免频繁调用（至少间隔100ms）
        const now = Date.now();
        if (now - lastPositionSetTime.current > 100) {
          lastPositionSetTime.current = now;
          setPositionAsync(startTime);
        }
      }
    }
  }, [positionMillis, isCreationMode, isPlaying, endTime, startTime, setPositionAsync, durationMillis]);
  
  // 同步 isCreationMode 到 ref
  useEffect(() => {
    isCreationModeRef.current = isCreationMode;
  }, [isCreationMode]);
  
  // 当切换 Creation Mode 时，重置 selection frame 和位置
  useEffect(() => {
    if (isCreationMode) {
      // 进入 Creation Mode 时，重置 selection frame 到屏幕中间
      const newSelectionLeft = -screenWidth * 0.15; // 重置到初始位置
      const newSelectionRight = screenWidth * 0.15;
      setSelectionLeft(newSelectionLeft);
      setSelectionRight(newSelectionRight);
      selectionLeftRef.current = newSelectionLeft;
      selectionRightRef.current = newSelectionRight;
      lastSelectionLeft.current = newSelectionLeft;
      lastSelectionRight.current = newSelectionRight;
      
      // 取消动画，使用当前位置
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      animatedPosition.setValue(sliderPosition);
    } else {
      // 退出 Creation Mode 时，恢复到自动追踪位置
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      const autoPos = calculateAutoPosition(progress);
      setSliderPosition(autoPos);
      sliderPositionRef.current = autoPos;
      animatedPosition.setValue(autoPos);
    }
  }, [isCreationMode]); // 当 Creation Mode 状态变化时
  
  // 当歌曲切换或 sound/durationMillis 更新时，更新相关 refs
  useEffect(() => {
    // 更新 sound ref，确保拖拽时使用最新的 sound 对象
    soundRef.current = sound;
    // 更新 duration ref
    if (durationMillis > 0) {
      dragDurationRef.current = durationMillis;
    }
  }, [currentTrack?.id, sound, durationMillis]);

  // 在非 Creation Mode 时，根据播放进度自动调整波形位置，使播放位置始终在屏幕中心
  useEffect(() => {
    if (!isCreationMode && !isDraggingRef.current) {
      const autoPos = calculateAutoPosition(progress);
      const currentPos = sliderPositionRef.current;
      const diff = Math.abs(currentPos - autoPos);
      
      // 如果位置差异很小，直接设置
      if (diff < 0.5) {
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
        setSliderPosition(autoPos);
        sliderPositionRef.current = autoPos;
        animatedPosition.setValue(autoPos);
      } else {
        // 使用动画实现平滑过渡
        if (animationRef.current) {
          animationRef.current.stop();
        }
        
        // 使用较短的动画时间（80-120ms），实现平滑但快速的追踪
        const duration = Math.min(Math.max(diff * 0.2, 80), 120);
        
        animationRef.current = Animated.timing(animatedPosition, {
          toValue: autoPos,
          duration: duration,
          useNativeDriver: false,
        });
        
        animationRef.current.start(() => {
          setSliderPosition(autoPos);
          sliderPositionRef.current = autoPos;
          animationRef.current = null;
        });
      }
    } else {
      // Creation Mode 时，取消动画，使用直接位置
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      animatedPosition.setValue(sliderPosition);
    }
  }, [progress, isCreationMode]); // 当播放进度变化或 Creation Mode 状态变化时更新
  
  // synchronize ref and state
  sliderPositionRef.current = sliderPosition;
  selectionLeftRef.current = selectionLeft;
  selectionRightRef.current = selectionRight;
  
  // Track slider PanResponder - 在 Creation Mode 时启用拖动
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // do not respond at start, let edge handle first
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 只在 Creation Mode 时响应
        if (!isCreationModeRef.current) return false;
        // only respond when movement distance is large to avoid conflict with edge dragging
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // during dragging, record current slider position
        lastPosition.current = sliderPositionRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const screenWidth = Dimensions.get('window').width;
        const waveformWidth = screenWidth * 3.0;
        // maxOffset: waveform左边缘最多到屏幕中心
        // minOffset: waveform右边缘最多到屏幕中心
        const maxOffset = screenWidth / 2; // maximum drag distance (waveform左边缘最多到屏幕中心)
        const minOffset = screenWidth / 2 - waveformWidth; // minimum drag distance (waveform右边缘最多到屏幕中心)
        
        // calculate new position (based on last position + current drag distance)
        let newPosition = lastPosition.current + dx;
        
        // limit drag range to prevent exceeding boundaries (same logic as calculateAutoPosition)
        newPosition = Math.max(Math.min(newPosition, maxOffset), minOffset);
        
        setSliderPosition(newPosition);
        sliderPositionRef.current = newPosition;
      },
      onPanResponderRelease: () => {
        // after dragging, save current position for next drag
        lastPosition.current = sliderPositionRef.current;
      },
    })
  ).current;

  // Non-Creation Mode PanResponder - 用于拖拽调整播放位置
  const nonCreationModePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 只在非 Creation Mode 时响应
        if (isCreationModeRef.current) return false;
        // only respond when movement distance is large
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: async () => {
        // 标记正在拖拽，暂停自动追踪
        isDraggingRef.current = true;
        // 取消自动追踪动画
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
        // 记录当前 slider position
        lastPosition.current = sliderPositionRef.current;
        
        // 始终从 sound 对象获取最新的 duration，确保使用正确的时长
        // 使用 soundRef.current 而不是 sound state，确保使用最新的 sound 对象
        let currentDuration = 0;
        const currentSound = soundRef.current || sound;
        if (currentSound) {
          try {
            const status = await currentSound.getStatusAsync();
            if (status.isLoaded && status.durationMillis && status.durationMillis > 0) {
              currentDuration = status.durationMillis;
            }
          } catch (error) {
            // 如果获取失败，尝试使用 durationMillis state
            currentDuration = durationMillis > 0 ? durationMillis : 0;
          }
        } else {
          // 如果没有 sound 对象，使用 durationMillis state
          currentDuration = durationMillis > 0 ? durationMillis : 0;
        }
        
        // 缓存 duration 供拖拽过程中使用
        dragDurationRef.current = currentDuration;
        
        // 初始化拖拽时的progress
        const screenWidth = Dimensions.get('window').width;
        const waveformWidth = screenWidth * 3.0;
        const screenCenterInWaveform = screenWidth / 2 - sliderPositionRef.current;
        const clampedCenter = Math.max(0, Math.min(screenCenterInWaveform, waveformWidth));
        if (currentDuration > 0) {
          setDragProgress(clampedCenter / waveformWidth);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const screenWidth = Dimensions.get('window').width;
        const waveformWidth = screenWidth * 3.0;
        const maxOffset = screenWidth / 2;
        const minOffset = screenWidth / 2 - waveformWidth;
        
        // 计算新的 slider position
        let newPosition = lastPosition.current + dx;
        newPosition = Math.max(Math.min(newPosition, maxOffset), minOffset);
        
        // 更新 slider position
        setSliderPosition(newPosition);
        sliderPositionRef.current = newPosition;
        animatedPosition.setValue(newPosition);
        
        // 根据屏幕中心位置计算播放位置
        // 屏幕中心在 waveform 中的位置 = screenWidth / 2 - newPosition
        const screenCenterInWaveform = screenWidth / 2 - newPosition;
        const clampedCenter = Math.max(0, Math.min(screenCenterInWaveform, waveformWidth));
        
        // 立即更新拖拽时的progress，让高亮bar实时同步
        // 使用缓存的 duration，如果缓存无效则尝试从 state 获取
        let effectiveDuration = dragDurationRef.current;
        if (effectiveDuration <= 0) {
          // 如果缓存的 duration 无效，尝试使用 state 中的 duration
          effectiveDuration = durationMillis > 0 ? durationMillis : 0;
        }
        
        if (effectiveDuration > 0) {
          const newProgress = clampedCenter / waveformWidth;
          setDragProgress(newProgress);
          
          // 计算对应的播放时间并设置，确保时间在有效范围内
          const targetTime = Math.max(0, Math.min(newProgress * effectiveDuration, effectiveDuration));
          // 直接使用 sound 对象设置位置，避免延迟
          // 使用 soundRef.current 确保使用最新的 sound 对象
          const currentSound = soundRef.current || sound;
          if (currentSound) {
            currentSound.setPositionAsync(targetTime).catch(() => {
              // 忽略错误
            });
          } else {
            setPositionAsync(targetTime);
          }
        }
      },
      onPanResponderRelease: async () => {
        // 拖拽结束时，确保设置最终位置
        const screenWidth = Dimensions.get('window').width;
        const waveformWidth = screenWidth * 3.0;
        const finalPosition = sliderPositionRef.current;
        const screenCenterInWaveform = screenWidth / 2 - finalPosition;
        const clampedCenter = Math.max(0, Math.min(screenCenterInWaveform, waveformWidth));
        
        // 始终从 sound 对象获取最新的 duration，确保使用正确的时长
        // 使用 soundRef.current 确保使用最新的 sound 对象
        let currentDuration = dragDurationRef.current; // 先使用缓存的 duration
        const currentSound = soundRef.current || sound;
        if (currentSound) {
          try {
            const status = await currentSound.getStatusAsync();
            if (status.isLoaded && status.durationMillis && status.durationMillis > 0) {
              currentDuration = status.durationMillis;
              // 更新缓存的 duration
              dragDurationRef.current = currentDuration;
            }
          } catch (error) {
            // 如果获取失败，使用缓存的 duration
          }
        }
        
        if (currentDuration > 0) {
          const finalProgress = clampedCenter / waveformWidth;
          const targetTime = Math.max(0, Math.min(finalProgress * currentDuration, currentDuration));
          
          // 将 dragProgress 设置为最终值，确保高亮位置不会突然跳变
          setDragProgress(finalProgress);
          
          // 设置最终位置，直接使用 sound 对象确保位置正确更新
          // 使用 soundRef.current 确保使用最新的 sound 对象
          try {
            const currentSound = soundRef.current || sound;
            if (currentSound) {
              const status = await currentSound.getStatusAsync();
              if (status.isLoaded) {
                const wasPlaying = status.isPlaying;
                // 如果正在播放，先暂停
                if (wasPlaying) {
                  await currentSound.pauseAsync();
                }
                // 设置位置
                await currentSound.setPositionAsync(targetTime);
                // 如果之前正在播放，继续播放
                if (wasPlaying) {
                  await currentSound.playAsync();
                }
              }
            } else {
              // 如果没有 sound 对象，使用 setPositionAsync
              await setPositionAsync(targetTime);
            }
          } catch (error) {
            // 忽略错误，但尝试使用 setPositionAsync 作为 fallback
            try {
              await setPositionAsync(targetTime);
            } catch (e) {
              // 忽略错误
            }
          }
          
          // 延迟清除 dragProgress，给音频位置一些时间更新
          // 使用 requestAnimationFrame 确保在下一帧清除，避免闪烁
          requestAnimationFrame(() => {
            setTimeout(() => {
              // 拖拽结束，清除临时progress，恢复自动追踪
              // 注意：不清除 dragDurationRef，保留它作为下次拖拽的 fallback
              isDraggingRef.current = false;
              setDragProgress(null);
              lastPosition.current = sliderPositionRef.current;
            }, 100); // 增加延迟到 100ms，确保 positionMillis 已更新
          });
        } else {
          // 如果没有 duration，立即清除
          isDraggingRef.current = false;
          setDragProgress(null);
          // 注意：不清除 dragDurationRef，保留它作为下次拖拽的 fallback
          lastPosition.current = sliderPositionRef.current;
        }
      },
    })
  ).current;

  // left edge dragging PanResponder - higher priority
  const leftEdgePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isCreationModeRef.current, // 只在 Creation Mode 时响应
      onMoveShouldSetPanResponder: () => true, 
      onPanResponderGrant: () => {
        lastSelectionLeft.current = selectionLeftRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const screenWidth = Dimensions.get('window').width;
        const waveformWidth = screenWidth * 3.0;
        
        // limit left edge to not exceed right edge and not exceed waveform range
        // selection frame可以覆盖整个waveform的可视范围
        // 当waveform在最右边时，左边缘在 -waveformWidth 位置（相对于屏幕中心）
        // 当waveform在最左边时，左边缘在 0 位置（屏幕中心）
        // 所以selectionLeft的范围：从 -waveformWidth 到 selectionRight - 40
        const maxLeft = selectionRightRef.current - 40; // minimum width 40
        const minLeft = -waveformWidth; // waveform左边缘的最远位置
        
        let constrainedLeft = lastSelectionLeft.current + dx;
        if (constrainedLeft > maxLeft) constrainedLeft = maxLeft;
        if (constrainedLeft < minLeft) constrainedLeft = minLeft;
        
        setSelectionLeft(constrainedLeft);
        selectionLeftRef.current = constrainedLeft;
      },
      onPanResponderRelease: () => {
        lastSelectionLeft.current = selectionLeftRef.current;
      },
    })
  ).current;

  // right edge dragging PanResponder - higher priority
  const rightEdgePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isCreationModeRef.current, // 只在 Creation Mode 时响应
      onMoveShouldSetPanResponder: () => true, 
      onPanResponderGrant: () => {
        lastSelectionRight.current = selectionRightRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const screenWidth = Dimensions.get('window').width;
        const waveformWidth = screenWidth * 3.0;
        
        // limit right edge to not exceed left edge and not exceed waveform range
        // selection frame可以覆盖整个waveform的可视范围
        // 当waveform在最左边时，右边缘在 waveformWidth 位置（相对于屏幕中心）
        // 当waveform在最右边时，右边缘在 0 位置（屏幕中心）
        // 所以selectionRight的范围：从 selectionLeft + 40 到 waveformWidth
        const minRight = selectionLeftRef.current + 40; // minimum width 40
        const maxRight = waveformWidth; // waveform右边缘的最远位置
        
        let constrainedRight = lastSelectionRight.current + dx;
        if (constrainedRight < minRight) constrainedRight = minRight;
        if (constrainedRight > maxRight) constrainedRight = maxRight;
        
        setSelectionRight(constrainedRight);
        selectionRightRef.current = constrainedRight;
      },
      onPanResponderRelease: () => {
        lastSelectionRight.current = selectionRightRef.current;
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Top navigation bar */}
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.back()}
        >
          <View style={styles.buttonCircle}>
            <Image 
              source={require('../assets/icon/chevron-left.png')} 
              style={styles.chevronIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Player</Text>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/playlist')}
        >
          <View style={styles.buttonCircle}>
            <Image 
              source={require('../assets/icon/chevron-right.png')} 
              style={styles.chevronIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <View style={[styles.content, styles.contentContainer]}>
        {/* Song information */}
        <View style={styles.songInfo}>
          <Text style={styles.songName}>{currentTrack?.title || 'Song Name'}</Text>
          <Text style={styles.artist}>{currentTrack?.artist || 'Artist'}</Text>
        </View>

        {/* Album art with playback controls */}
        <View style={styles.albumArtContainer}>
          <Image 
            source={currentTrack?.albumArt || require('../assets/albumPic/A_SweetDream.png')} 
            style={styles.albumArt}
            resizeMode="cover"
          />
          {isCreationMode ? (
            // Creation Mode: 显示 refresh 图标（可点击）
            <View style={styles.playbackControls}>
              <TouchableOpacity style={styles.playButton} onPress={handleRefresh}>
                <Image 
                  source={require('../assets/icon/refresh.png')} 
                  style={styles.refreshIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ) : (
            // 非 Creation Mode: 显示播放控制按钮
            <View style={styles.playbackControls}>
              <TouchableOpacity style={styles.controlButton} onPress={previousSong}>
                <Image 
                  source={require('../assets/icon/backwardsolid.png')} 
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                <Image 
                  source={isPlaying ? require('../assets/icon/pause.png') : require('../assets/icon/playsolid.png')} 
                  style={styles.playIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={nextSong}>
                <Image 
                  source={require('../assets/icon/forwardsolid.png')} 
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Current playback time - 始终保留位置以保持布局一致 */}
        <View style={styles.timeDisplay}>
          {!isCreationMode && (
            <Text style={styles.timeDisplayText}>{formatTime(positionMillis)}</Text>
          )}
        </View>

        {/* Track visualization */}
        <View style={styles.trackContainer}>
          {!isCreationMode ? (
            // 非 Creation Mode：使用动画平滑追踪，支持拖拽调整播放位置
            <View {...nonCreationModePanResponder.panHandlers} style={styles.waveformWrapper}>
              <Animated.View
                style={[
                  styles.waveformAnimatedWrapper,
                  {
                    transform: [{ translateX: animatedPosition }],
                  },
                ]}
              >
                <Waveform 
                  waveformData={currentWaveformData}
                  progress={progress}
                  position={0}
                  isPlaying={isPlaying}
                />
              </Animated.View>
            </View>
          ) : (
            // Creation Mode：使用直接位置，允许拖动
            <View {...panResponder.panHandlers} style={styles.waveformWrapper}>
              <View
                style={[
                  styles.waveformAnimatedWrapper,
                  {
                    transform: [{ translateX: sliderPosition }],
                  },
                ]}
              >
                <Waveform 
                  waveformData={currentWaveformData}
                  progress={progress}
                  position={0}
                  isPlaying={isPlaying}
                />
              </View>
            </View>
          )}
          
          {/* Selection frame overlay - 只在 Creation Mode 时显示 */}
          {isCreationMode && (
            <>
              <View 
                style={[
                  styles.selectionFrame,
                  {
                    left: screenWidth / 2 + selectionLeft,
                    width: selectionRight - selectionLeft,
                    transform: [{ translateX: sliderPosition }],
                  },
                ]}
              >
                {/* Left edge handle */}
                <View 
                  style={styles.selectionEdgeHandle}
                  {...leftEdgePanResponder.panHandlers}
                />
                
                {/* Right edge handle */}
                <View 
                  style={[styles.selectionEdgeHandle, styles.selectionEdgeHandleRight]}
                  {...rightEdgePanResponder.panHandlers}
                />
              </View>
              
              {/* Time indicators - S 和 E 框，跟随左右边框移动 */}
              {/* S 框 - 跟随左边框，在边框外侧 */}
              <View 
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setSBoxWidth(width);
                }}
                style={[
                  styles.timeIndicatorBox,
                  styles.timeIndicatorBoxAbsolute,
                  {
                    left: screenWidth / 2 + selectionLeft,
                    transform: [{ translateX: sliderPosition - sBoxWidth }], // 减去S框宽度让S框在左边框外侧
                  },
                ]}
              >
                <View style={styles.timeIndicatorIcon}>
                  <Text style={styles.timeIndicatorIconText}>S</Text>
                </View>
                <Text style={styles.timeIndicatorText}>{startTimeFormatted}</Text>
              </View>
              
              {/* E 框 - 跟随右边框，在边框外侧 */}
              <View 
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  setEBoxWidth(width);
                }}
                style={[
                  styles.timeIndicatorBox,
                  styles.timeIndicatorBoxAbsolute,
                  {
                    left: screenWidth / 2 + selectionRight,
                    transform: [{ translateX: sliderPosition }], // E框在右边框外侧，不需要减去宽度
                  },
                ]}
              >
                <View style={styles.timeIndicatorIcon}>
                  <Text style={styles.timeIndicatorIconText}>E</Text>
                </View>
                <Text style={styles.timeIndicatorText}>{endTimeFormatted}</Text>
              </View>
            </>
          )}
        </View>

        {/* Creation Mode button */}
        <TouchableOpacity 
          style={[styles.creationModeButton, isCreationMode ? styles.creationModeButtonActive : styles.creationModeButtonInactive]}
          onPress={() => setIsCreationMode(!isCreationMode)}
        >
          <Text style={[styles.creationModeText, isCreationMode ? styles.creationModeTextActive : styles.creationModeTextInactive]}>Creation Mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//------------------------------------------------- Player Screen styles -------------------------------------------------


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 0,
    backgroundColor: '#121212',
  },
  navButton: {
    padding: 8,
    width: 44,
    alignItems: 'center',
  },
  title: {
    color: '#EDEDED',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: 'Courier',
  },
  buttonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronIcon: {
    width: 24,
    height: 24,
    tintColor: '#EDEDED',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
  },
  songName: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    color: '#A3A3A3',
    fontSize: 16,
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  albumArtContainer: {
    width: '90%',
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 16, // 最小高度，确保两种状态下一致
    justifyContent: 'center',
  },
  timeDisplayText: {
    color: '#EDEDED',
    fontSize: 18, // 缩小字体大小
    fontFamily: 'Courier',
    letterSpacing: 1,
    lineHeight: 16, // 固定行高，与高度一致
  },
  timeDisplayTextHidden: {
    opacity: 0, // 在 Creation Mode 时隐藏但保留空间
  },
  trackContainer: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    marginLeft: -24,
    marginRight: -24,
    overflow: 'visible',
    minHeight: 80,
    justifyContent: 'center',
    height: 80,
  },
  waveformWrapper: {
    width: Dimensions.get('window').width,
    height: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  waveformAnimatedWrapper: {
    width: '100%',
    height: 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  trackImage: {
    height: 80,
    minWidth: '300%',
  },
  selectionFrame: {
    position: 'absolute',
    top: -10,
    height: 100,
    backgroundColor: 'rgba(43, 43, 43, 0.3)',
    borderWidth: 2,
    borderColor: '#5A5A5A',
    borderRadius: 8,
    overflow: 'visible',
  },
  selectionEdgeHandle: {
    position: 'absolute',
    left: 0,
    top: -2,
    width: 20,
    height: 100, 
    backgroundColor: 'rgba(90, 90, 90, 0.8)',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  selectionEdgeHandleRight: {
    left: 'auto',
    right: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  playbackControls: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    padding: 8,
  },
  controlIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  playIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
    opacity: 1,
  },
  refreshIcon: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444444',
    borderRadius: 16,
    paddingHorizontal: 5,
    paddingVertical: 4,
    gap: 4,
  },
  timeIndicatorBoxAbsolute: {
    position: 'absolute',
    top: -40,
    zIndex: 10,
  },
  timeIndicatorIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeIndicatorIconText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  timeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Courier',
  },
  timeText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Courier',
  },
  creationModeButton: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 36,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  creationModeButtonInactive: {
    backgroundColor: '#2b2b2b',
  },
  creationModeButtonActive: {
    backgroundColor: '#D9D9D9',
  },
  creationModeText: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: 'Courier',
  },
  creationModeTextInactive: {
    color: '#EDEDED',
  },
  creationModeTextActive: {
    color: '#121212',
  },
});

