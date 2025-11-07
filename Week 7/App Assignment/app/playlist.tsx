import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { defaultPlaylist } from '../data/playlistData';
import { useAudio } from '../contexts/AudioContext';

export default function PlaylistScreen() {
  const { currentTrack, playSong } = useAudio();

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

        <Text style={styles.title}>Playlist</Text>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => {
            // TODO: Add menu functionality (three horizontal lines icon)
          }}
        >
          <View style={styles.buttonCircle}>
            {/* TODO: Replace with menu icon (three horizontal lines) when available */}
            <View style={styles.menuIconPlaceholder}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Playlist info */}
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{defaultPlaylist.name}</Text>
          <Text style={styles.playlistAuthor}>By. {defaultPlaylist.author}</Text>
        </View>

        {/* Songs list */}
        <View style={styles.songsList}>
          {defaultPlaylist.songs.map((song) => {
            const isCurrentTrack = currentTrack?.id === song.id;
            return (
              <TouchableOpacity 
                key={song.id} 
                style={[
                  styles.songItem,
                  isCurrentTrack && styles.songItemActive
                ]}
                onPress={() => {
                  playSong(song);
                  router.push('/player');
                }}
              >
                <View style={styles.songItemContent}>
                  {/* Album cover */}
                  <Image 
                    source={song.albumArt} 
                    style={styles.songAlbumArt}
                    resizeMode="cover"
                  />
                  {/* Song info */}
                  <View style={styles.songTextContainer}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    <Text style={styles.songArtist}>{song.artist}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

//------------------------------------------------- Playlist styles -------------------------------------------------

const styles = StyleSheet.create({
  container: {
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
  menuIconPlaceholder: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: '#EDEDED',
    borderRadius: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100, // Space for GlobalPlayer
  },
  playlistInfo: {
    marginBottom: 24,
  },
  playlistName: {
    color: '#EDEDED',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Courier',
  },
  playlistAuthor: {
    color: '#A3A3A3',
    fontSize: 16,
    fontFamily: 'Courier',
  },
  songsList: {
    gap: 12,
  },
  songItem: {
    backgroundColor: '#2B2B2B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
  },
  songItemActive: {
    backgroundColor: '#3B3B3B',
    borderWidth: 1,
    borderColor: '#5A5A5A',
  },
  songItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  songAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  songTextContainer: {
    flex: 1,
    gap: 4,
  },
  songTitle: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    color: '#A3A3A3',
    fontSize: 14,
  },
});

