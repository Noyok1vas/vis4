import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
  const [volume, setVolume] = useState(75);
  const [noiseControl, setNoiseControl] = useState('noiseCancel');
  const [isMuted, setIsMuted] = useState(false);

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

        <Text style={styles.title}>Yokis's Earbuds</Text>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/sound_control')}
        >
          <View style={styles.buttonCircle}>
            <Image 
              source={require('../assets/chevron-right.png')} 
              style={styles.chevronIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Home Screen content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Earbuds image */}
        <Image 
          source={require('../assets/BoseOpen02.png')} 
          style={styles.earbudImage}
          resizeMode="contain"
        />

        {/* Battery status */}
        <View style={styles.batterySection}>
          <View style={styles.batteryLabel}>
            <Text style={styles.batteryText}>L 60%</Text>
          </View>
          <View style={styles.batteryLabel}>
            <Text style={styles.batteryText}>C 80%</Text>
          </View>
          <View style={styles.batteryLabel}>
            <Text style={styles.batteryText}>R 100%</Text>
          </View>
        </View>

        {/* Volume control */}
        <View style={styles.volumeSection}>
          <TouchableOpacity 
            onPress={() => setIsMuted(!isMuted)}
          >
            <View style={[styles.muteCircle, isMuted ? styles.muteCircleDark : styles.muteCircleLight]}>
              <Image 
                source={require('../assets/mute.png')} 
                style={[styles.muteIcon, isMuted ? styles.muteIconDark : styles.muteIconLight]}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.volumeSliderContainer}>
            <View style={[styles.volumeSliderFill, { width: `${volume}%` }]} />
          </View>
        </View>

        {/* Noise control */}
        <View style={styles.noiseControlSection}>
          <Text style={styles.sectionTitle}>Noise Control</Text>
          <View style={styles.noiseControlButtons}>
            <TouchableOpacity 
              style={[styles.noiseControlButton, noiseControl === 'noiseCancel' && styles.noiseControlButtonActive]}
              onPress={() => setNoiseControl('noiseCancel')}
            >
              <Image 
                source={require('../assets/NoiseCancel.png')} 
                style={[styles.noiseIcon, noiseControl === 'noiseCancel' && styles.noiseIconActive]}
                resizeMode="contain"
              />
              {noiseControl === 'noiseCancel' && <Text style={styles.noiseControlText}>Noise Cancel</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.noiseControlButton, noiseControl === 'noiseOff' && styles.noiseControlButtonActive]}
              onPress={() => setNoiseControl('noiseOff')}
            >
              <Image 
                source={require('../assets/NoiseOff.png')} 
                style={[styles.noiseIcon, noiseControl === 'noiseOff' && styles.noiseIconActive]}
                resizeMode="contain"
              />
              {noiseControl === 'noiseOff' && <Text style={styles.noiseControlText}>Noise Off</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.noiseControlButton, noiseControl === 'ambientSound' && styles.noiseControlButtonActive]}
              onPress={() => setNoiseControl('ambientSound')}
            >
              <Image 
                source={require('../assets/AmbientSound.png')} 
                style={[styles.noiseIcon, noiseControl === 'ambientSound' && styles.noiseIconActive]}
                resizeMode="contain"
              />
              {noiseControl === 'ambientSound' && <Text style={styles.noiseControlText}>Ambient Sound</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Music player */}
        <View style={styles.playerSection}>
          <View style={styles.playerContent}>
            <View style={styles.albumArtPlaceholder} />
            <View style={styles.playerInfo}>
              <Text style={styles.songName}>Song Name</Text>
              <Text style={styles.artist}>Artist</Text>
              <View style={styles.playerProgressBar}>
                <View style={styles.playerProgressFill} />
              </View>
            </View>
            <View style={styles.playerControls}>
              <Image 
                source={require('../assets/play.png')} 
                style={styles.playerIcon}
                resizeMode="contain"
              />
              <Image 
                source={require('../assets/forward.png')} 
                style={styles.playerIcon}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

//------------------------------------------------- Home Screen styles -------------------------------------------------

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
    paddingBottom: 40,
  },
  earbudImage: {
    width: '100%',
    height: 280,
    marginBottom: 24,
  },
  batterySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  batteryLabel: {
    flex: 1,
    backgroundColor: '#2B2B2B',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  batteryText: {
    color: '#EDEDED',
    fontSize: 16,
    fontFamily: 'Courier',
  },
  volumeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
    borderRadius: 36,
    padding: 24,
    marginBottom: 24,
    gap: 16,
  },
  muteCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteCircleLight: {
    backgroundColor: '#d9d9d9',
  },
  muteCircleDark: {
    backgroundColor: '#121212',
  },
  muteIcon: {
    width: 24,
    height: 24,
  },
  muteIconLight: {
    tintColor: '#121212',
  },
  muteIconDark: {
    tintColor: '#EDEDED',
  },
  volumeSliderContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#121212',
    borderRadius: 3,
    overflow: 'hidden',
  },
  volumeSliderFill: {
    height: '100%',
    backgroundColor: '#EDEDED',
    borderRadius: 2,
  },
  noiseControlSection: {
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
  noiseControlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  noiseControlButton: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  noiseControlButtonActive: {
    backgroundColor: '#EDEDED',
  },
  noiseIcon: {
    width: 28,
    height: 28,
    tintColor: '#EDEDED',
  },
  noiseIconActive: {
    tintColor: '#121212',
  },
  noiseControlText: {
    color: '#121212',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Courier',
    textAlign: 'center',
  },
  playerSection: {
    backgroundColor: '#2B2B2B',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  albumArtPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
  },
  playerInfo: {
    flex: 1,
  },
  songName: {
    color: '#D9D9D9',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  artist: {
    color: '#A3A3A3',
    fontSize: 14,
    marginBottom: 8,
  },
  playerControls: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  playerIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  playerProgressBar: {
    width: '100%',
    height: 2,
    backgroundColor: '#A3A3A3',
    borderRadius: 1,
    overflow: 'hidden',
  },
  playerProgressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
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
});


