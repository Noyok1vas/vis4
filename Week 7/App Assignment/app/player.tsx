import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';

export default function PlayerScreen() {
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const lastPosition = useRef(0);
  const sliderPositionRef = useRef(0);
  
  // Selection frame coordinates: left and right edges (offset from center of screen)
  const screenWidth = Dimensions.get('window').width;
  const [selectionLeft, setSelectionLeft] = useState(-screenWidth * 0.15); // initial left edge position
  const [selectionRight, setSelectionRight] = useState(screenWidth * 0.15); // initial right edge position
  const selectionLeftRef = useRef(selectionLeft);
  const selectionRightRef = useRef(selectionRight);
  const lastSelectionLeft = useRef(selectionLeft);
  const lastSelectionRight = useRef(selectionRight);
  
  // synchronize ref and state
  sliderPositionRef.current = sliderPosition;
  selectionLeftRef.current = selectionLeft;
  selectionRightRef.current = selectionRight;
  
  // Track slider PanResponder - lower priority to avoid conflict with edge dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // do not respond at start, let edge handle first
      onMoveShouldSetPanResponder: (evt, gestureState) => {
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
        const trackWidth = screenWidth * 3.0; // track image width is 200% of screen, expand drag range
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
      onStartShouldSetPanResponder: () => true, 
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
      onStartShouldSetPanResponder: () => true, 
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
              source={require('../assets/chevron-left.png')} 
              style={styles.chevronIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Player</Text>

        {/* right side empty, no forward button */}
        <View style={styles.navButton} />
      </View>

      {/* Content area */}
      <View style={[styles.content, styles.contentContainer]}>
        {/* Song information */}
        <View style={styles.songInfo}>
          <Text style={styles.songName}>Song Name</Text>
          <Text style={styles.artist}>Artist</Text>
        </View>

        {/* Album art with playback controls */}
        <View style={styles.albumArtContainer}>
          <Image 
            source={require('../assets/AlbumPic.png')} 
            style={styles.albumArt}
            resizeMode="cover"
          />
          <View style={styles.playbackControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Image 
                source={require('../assets/backwardsolid.png')} 
                style={styles.controlIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Image 
                source={require('../assets/playsolid.png')} 
                style={styles.playIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Image 
                source={require('../assets/forwardsolid.png')} 
                style={styles.controlIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Track visualization */}
        <View style={styles.trackContainer}>
          <Image 
            source={require('../assets/track.png')} 
            style={[styles.trackImage, { transform: [{ translateX: sliderPosition }] }]}
            resizeMode="contain"
            {...panResponder.panHandlers}
          />
          
          {/* Selection frame overlay */}
          <View 
            style={[
              styles.selectionFrame,
              {
                left: screenWidth / 2 + selectionLeft + sliderPosition,
                width: selectionRight - selectionLeft,
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
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    marginHorizontal: -24,
    overflow: 'visible',
    minHeight: 80,
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
    backgroundColor: '#D9D9D9',
  },
  creationModeButtonActive: {
    backgroundColor: '#2b2b2b',
  },
  creationModeText: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: 'Courier',
  },
  creationModeTextInactive: {
    color: '#121212',
  },
  creationModeTextActive: {
    color: '#EDEDED',
  },
});

