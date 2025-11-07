import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import Waveform from '../components/Waveform';

export default function PlayerScreen() {
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const lastPosition = useRef(0);
  const sliderPositionRef = useRef(0);
  const isCreationModeRef = useRef(isCreationMode);
  // 使用 Animated.Value 来实现平滑的位置更新（只在非 Creation Mode 时使用）
  const animatedPosition = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  // Use global audio context
  const { 
    isPlaying, 
    togglePlayPause, 
    currentTrack, 
    nextSong, 
    previousSong, 
    positionMillis, 
    durationMillis,
    currentWaveformData, // 获取当前波形数据
  } = useAudio();
  
  // 计算播放进度 (0-1)
  const progress = durationMillis > 0 ? positionMillis / durationMillis : 0;

  // Selection frame coordinates: left and right edges (offset from center of screen)
  const screenWidth = Dimensions.get('window').width;
  const waveformWidth = screenWidth * 3.0; // 波形总宽度
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
    const maxOffset = (waveformWidth - screenWidth) / 2;
    const minOffset = -(waveformWidth - screenWidth) / 2;
    
    // 限制在合理范围内
    autoPosition = Math.max(Math.min(autoPosition, maxOffset), minOffset);
    
    return autoPosition;
  };
  
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
  
  // 在非 Creation Mode 时，根据播放进度自动调整波形位置，使播放位置始终在屏幕中心
  useEffect(() => {
    if (!isCreationMode) {
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
  
  // Track slider PanResponder - 只在 Creation Mode 时启用拖动
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
        const trackWidth = screenWidth * 3.0; // track image width is 3 times screen width
        const maxOffset = (trackWidth - screenWidth) / 2; // maximum drag distance
        
        // calculate new position (based on last position + current drag distance)
        let newPosition = lastPosition.current + dx;
        
        // limit drag range to prevent exceeding boundaries
        if (newPosition > maxOffset) {
          newPosition = maxOffset;
        }
        if (newPosition < -maxOffset) {
          newPosition = -maxOffset;
        }
        
        setSliderPosition(newPosition);
        sliderPositionRef.current = newPosition;
      },
      onPanResponderRelease: () => {
        // after dragging, save current position for next drag
        lastPosition.current = sliderPositionRef.current;
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
        
        // limit left edge to not exceed right edge and not exceed screen range
        const maxLeft = selectionRightRef.current - 40; // minimum width 40
        const minLeft = -screenWidth * 1.5; // consider track image drag range
        
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
        
        // limit right edge to not exceed left edge and not exceed screen range
        const minRight = selectionLeftRef.current + 40; // minimum width 40
        const maxRight = screenWidth * 1.5; // consider track image drag range
        
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
        </View>

        {/* Track visualization */}
        <View style={styles.trackContainer}>
          {!isCreationMode ? (
            // 非 Creation Mode：使用动画平滑追踪
            <View style={styles.waveformWrapper}>
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
          )}
        </View>

        {/* Time indicators */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>S 01:36</Text>
          <Text style={styles.timeText}>E 01:59</Text>
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
    marginBottom: 32,
    position: 'relative',
  },
  albumArt: {
    width: '100%',
    height: '100%',
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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

