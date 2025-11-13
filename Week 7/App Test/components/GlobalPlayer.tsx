import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { usePathname, router } from 'expo-router';
import { useAudio } from '../contexts/AudioContext';

export default function GlobalPlayer() {
  const { isPlaying, togglePlayPause, currentTrack } = useAudio();
  const pathname = usePathname();

  // Hide GlobalPlayer on landing and player pages
  if (pathname === '/landing' || pathname === '/player') {
    return null;
  }

  // 处理跳转到 player 页面
  const handleNavigateToPlayer = () => {
    router.push('/player');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 专辑图片 - 可点击跳转 */}
        <TouchableOpacity onPress={handleNavigateToPlayer} activeOpacity={0.7}>
          {currentTrack?.albumArt ? (
            <Image 
              source={currentTrack.albumArt} 
              style={styles.albumArtPlaceholder}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.albumArtPlaceholder} />
          )}
        </TouchableOpacity>
        {/* 歌曲信息 - 可点击跳转 */}
        <TouchableOpacity 
          style={styles.playerInfo} 
          onPress={handleNavigateToPlayer}
          activeOpacity={0.7}
        >
          <Text style={styles.songName} numberOfLines={1}>
            {currentTrack?.title || 'Song Name'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack?.artist || 'Artist'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Image 
            source={isPlaying ? require('../assets/icon/pause.png') : require('../assets/icon/playsolid.png')} 
            style={styles.playIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

//------------------------------------------------- Global Player Styles -------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(43, 43, 43, 0.9)',
    paddingBottom: 36, 
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  albumArtPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  songName: {
    color: '#EDEDED',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  artist: {
    color: '#A3A3A3',
    fontSize: 12,
  },
  playButton: {
    padding: 8,
  },
  playIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
    opacity: 1,
  },
});

