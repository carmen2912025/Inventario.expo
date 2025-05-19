import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useColorScheme } from '../components/useColorScheme';
import { Platform } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text, StyleSheet } from 'react-native';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [appIsReady, setAppIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function prepare() {
      try {
        if (loaded && Platform.OS !== 'web') {
          await initDBWithTestData();
        }
        setAppIsReady(true);
      } catch (e) {
        setInitError(e && typeof e === 'object' && e !== null && 'message' in e ? e : { message: String(e) });
        setAppIsReady(true);
      } finally {
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [loaded]);

  if (!loaded || !appIsReady) {
    return null;
  }
  if (initError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error al iniciar la app</Text>
          <Text style={styles.errorMessage}>{typeof initError === 'object' && initError !== null && 'message' in initError ? initError.message : String(initError)}</Text>
        </View>
      </>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#d32f2f',
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
  },
});
