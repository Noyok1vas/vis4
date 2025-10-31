import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Landing' }} />
        <Stack.Screen name="landing" options={{ title: 'Landing' }} />
        <Stack.Screen name="home" options={{ title: 'Home' }} />
        <Stack.Screen name="sound_control" options={{ title: 'Sound Control' }} />
        <Stack.Screen name="player" options={{ title: 'Player' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
