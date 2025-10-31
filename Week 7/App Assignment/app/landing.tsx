import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>©BrandName</Text>
      <Text style={styles.tagline}>THIS IS A TAGLINE</Text>

      <Image source={require('../assets/BoseOpen01.png')} 
      style={styles.product} 
      resizeMode="contain" 
      />

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/home')}>
        <Text style={styles.exploreText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );
}

//------------------------------------------------- Landing Screen Styles -------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: '#8A8A8A',
    fontSize: 18,
    marginBottom: 24,
  },
  tagline: {
    color: '#EDEDED',
    fontSize: 28,
    letterSpacing: 2,
    marginBottom: 24,
    fontFamily: 'Courier',
  },
  product: {
    width: '90%',
    height: 350,
    marginVertical: 24,
  },
  progressBar: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2B2B2B',
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 40,
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: '#CFCFCF',
  },
  exploreButton: {
    width: '75%',
    backgroundColor: '#E0E0E0',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  exploreText: {
    color: '#1A1A1A',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: 'Courier',
  },
});


