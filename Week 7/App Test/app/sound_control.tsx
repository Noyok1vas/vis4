import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, PanResponder } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef } from 'react';

const screenWidth = Dimensions.get('window').width;

export default function SoundControlScreen() {
  const [soundMode, setSoundMode] = useState('STUDIO');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // EQ sliders state - 7 bands: 200, 400, 800, 1k, 3k, 6k, 8k
  const [eqValues, setEqValues] = useState([0, 0, 0, 0, 0, 0, 0]); // Values from -12 to +12 dB
  const eqLabels = ['200', '400', '800', '1k', '3k', '6k', '8k'];
  const activeSliderRef = useRef<number | null>(null);
  const lastYRef = useRef<number>(0);

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

        <Text style={styles.title}>Sound Control</Text>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/player')}
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
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={false}
      >
        {/* Equalizer section */}
        <Text style={styles.equalizerTitle}>Equalizer</Text>
        <View style={styles.equalizerContainer}>
          <View style={styles.eqSlidersContainer}>
            {eqLabels.map((label, index) => {
              const value = eqValues[index];
              const normalizedValue = (value + 12) / 24; // Convert -12 to +12 to 0 to 1
              const sliderHeight = 200;
              const thumbTop = sliderHeight * (1 - normalizedValue) - 10; // Position from top, center the thumb (thumb height is 20)
              const fillHeight = normalizedValue * sliderHeight; // Fill from bottom
              
              const createPanResponder = (sliderIndex: number) => {
                return PanResponder.create({
                  onStartShouldSetPanResponder: () => {
                    setScrollEnabled(false); // Disable scroll when starting to interact with slider
                    return true;
                  },
                  onMoveShouldSetPanResponder: () => true,
                  onPanResponderTerminationRequest: () => false, // Prevent termination by ScrollView
                  onPanResponderGrant: (evt) => {
                    activeSliderRef.current = sliderIndex;
                    // Calculate initial position based on touch location within the container
                    const touchY = evt.nativeEvent.locationY;
                    const clampedY = Math.max(0, Math.min(sliderHeight, touchY));
                    const initialNormalized = 1 - (clampedY / sliderHeight);
                    const initialValue = Math.round((initialNormalized * 24) - 12);
                    
                    // Update the slider value immediately based on initial touch position
                    const newEqValues = [...eqValues];
                    newEqValues[sliderIndex] = initialValue;
                    setEqValues(newEqValues);
                    
                    lastYRef.current = touchY;
                  },
                  onPanResponderMove: (evt, gestureState) => {
                    if (activeSliderRef.current === sliderIndex) {
                      const deltaY = gestureState.dy;
                      const currentValue = eqValues[sliderIndex];
                      const currentNormalized = (currentValue + 12) / 24;
                      const currentPosition = sliderHeight * (1 - currentNormalized);
                      // Upward drag (negative deltaY) should increase dB (decrease position from top)
                      const newPosition = currentPosition + deltaY;
                      const clampedPosition = Math.max(0, Math.min(sliderHeight, newPosition));
                      const newNormalized = 1 - (clampedPosition / sliderHeight);
                      const newValue = Math.round((newNormalized * 24) - 12); // Convert back to -12 to +12
                      
                      const newEqValues = [...eqValues];
                      newEqValues[sliderIndex] = newValue;
                      setEqValues(newEqValues);
                    }
                  },
                  onPanResponderRelease: () => {
                    activeSliderRef.current = null;
                    setScrollEnabled(true); // Re-enable scroll when releasing slider
                  },
                  onPanResponderTerminate: () => {
                    activeSliderRef.current = null;
                    setScrollEnabled(true); // Re-enable scroll if terminated
                  },
                });
              };
              
              const panResponder = createPanResponder(index);
              
              return (
                <View key={index} style={styles.eqSliderWrapper}>
                  <View style={styles.eqSliderTrackContainer} {...panResponder.panHandlers}>
                    <View style={styles.eqSliderTrack}>
                      <View style={[styles.eqSliderFill, { height: fillHeight }]} />
                      <View 
                        style={[
                          styles.eqSliderThumb,
                          { top: thumbTop } // Position from top, centered on thumb height
                        ]} 
                      />
                    </View>
                  </View>
                  <View style={styles.eqSliderLabelContainer}>
                    <Text style={styles.eqSliderLabel}>{label}</Text>
                    <Text style={styles.eqSliderValue}>{value > 0 ? `+${value}` : value}dB</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Sound Mode section */}
        <View style={styles.soundModeSection}>
          <Text style={styles.sectionTitle}>Sound Mode</Text>
          <View style={styles.soundModeButtons}>
            <TouchableOpacity 
              style={[styles.soundModeButton, soundMode === 'STUDIO' && styles.soundModeButtonActive]}
              onPress={() => setSoundMode('STUDIO')}
            >
              <Text style={[styles.soundModeText, soundMode === 'STUDIO' ? styles.soundModeTextActive : styles.soundModeTextInactive]}>STUDIO</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.soundModeButton, soundMode === 'STAGE' && styles.soundModeButtonActive]}
              onPress={() => setSoundMode('STAGE')}
            >
              <Text style={[styles.soundModeText, soundMode === 'STAGE' ? styles.soundModeTextActive : styles.soundModeTextInactive]}>STAGE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.soundModeButton, soundMode === 'STREET' && styles.soundModeButtonActive]}
              onPress={() => setSoundMode('STREET')}
            >
              <Text style={[styles.soundModeText, soundMode === 'STREET' ? styles.soundModeTextActive : styles.soundModeTextInactive]}>STREET</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.soundModeButton, soundMode === 'HOME' && styles.soundModeButtonActive]}
              onPress={() => setSoundMode('HOME')}
            >
              <Text style={[styles.soundModeText, soundMode === 'HOME' ? styles.soundModeTextActive : styles.soundModeTextInactive]}>HOME</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.soundModeButton, soundMode === 'MODE 1' && styles.soundModeButtonActive]}
              onPress={() => setSoundMode('MODE 1')}
            >
              <Text style={[styles.soundModeText, soundMode === 'MODE 1' ? styles.soundModeTextActive : styles.soundModeTextInactive]}>MODE 1</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.soundModeButton, soundMode === 'MODE 2' && styles.soundModeButtonActive]}
              onPress={() => setSoundMode('MODE 2')}
            >
              <Text style={[styles.soundModeText, soundMode === 'MODE 2' ? styles.soundModeTextActive : styles.soundModeTextInactive]}>MODE 2</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

//------------------------------------------------- Sound Control Screen styles -------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 100, // Increased for GlobalPlayer
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 16,
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
  equalizerTitle: {
    color: '#EDEDED',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Courier',
  },
  equalizerContainer: {
    backgroundColor: '#2B2B2B',
    borderRadius: 36,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eqSlidersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    gap: 8,
  },
  eqSliderWrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
  },
  eqSliderTrackContainer: {
    height: 200,
    width: '100%',
    minWidth: 44, // Minimum touch target size for better usability
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 18, // Expanded touch area (18px on each side)
  },
  eqSliderLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 32,
  },
  eqSliderLabel: {
    color: '#EDEDED',
    fontSize: 12,
    fontFamily: 'Courier',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  eqSliderValue: {
    color: '#A3A3A3',
    fontSize: 10,
    fontFamily: 'Courier',
    textAlign: 'center',
    width: '100%',
  },
  eqSliderTrack: {
    width: 8,
    height: 200,
    backgroundColor: '#121212',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  eqSliderFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EDEDED',
    borderRadius: 4,
  },
  eqSliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,

    left: -6,
  },
  soundModeSection: {
    backgroundColor: '#2B2B2B',
    borderRadius: 36,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#EDEDED',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Courier',
  },
  soundModeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  soundModeButton: {
    flexBasis: '48%',
    backgroundColor: '#121212',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  soundModeButtonActive: {
    backgroundColor: '#EDEDED',
  },
  soundModeText: {
    fontSize: 14,
    fontFamily: 'Courier',
  },
  soundModeTextActive: {
    color: '#121212',
  },
  soundModeTextInactive: {
    color: '#A3A3A3',
  },
});

