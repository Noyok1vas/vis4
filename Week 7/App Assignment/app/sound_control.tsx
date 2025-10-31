import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

const screenWidth = Dimensions.get('window').width;

export default function SoundControlScreen() {
  const [soundMode, setSoundMode] = useState('STUDIO');
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

        <Text style={styles.title}>Sound Control</Text>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => router.push('/player')}
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

      {/* Content area */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Equalizer section */}
        <Text style={styles.equalizerTitle}>Equalizer</Text>
        <View style={styles.equalizerContainer}>
          <Image 
            source={require('../assets/EQbalance.png')} 
            style={styles.equalizerImage}
            resizeMode="contain"
          />
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
    paddingTop: 20,
    paddingBottom: 40,
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
  equalizerImage: {
    width: '100%',
    height: 200,
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
});

