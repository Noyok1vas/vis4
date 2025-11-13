import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from '../contexts/AudioContext';
import GlobalPlayer from '../components/GlobalPlayer';

export default function RootLayout() {
  return (
    <AudioProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Landing' }} />
        <Stack.Screen name="landing" options={{ title: 'Landing' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
        <Stack.Screen name="sound_control" options={{ title: 'Sound Control' }} />
        <Stack.Screen name="player" options={{ title: 'Player' }} />
        <Stack.Screen name="playlist" options={{ title: 'Playlist' }} />
      </Stack>
      <StatusBar style="light" />
      <GlobalPlayer />
    </AudioProvider>
  );
}
