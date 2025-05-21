import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { useColorScheme } from '../components/useColorScheme';
import { Platform } from 'react-native';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text, StyleSheet } from 'react-native';
import { useRole, RoleProvider } from '../components/RoleContext';
import AuthScreen from './auth';
import { useRouter, usePathname } from 'expo-router';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // initialRouteName: '(tabs)', // Eliminado porque (tabs) ya no se usa
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
        // If you have DB init, do it here
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error al iniciar la app</Text>
          <Text style={styles.errorMessage}>{typeof initError === 'object' && initError !== null && 'message' in initError ? initError.message : String(initError)}</Text>
        </View>
      </>
    );
  }

  // Wrap everything in RoleProvider
  return (
    <RoleProvider>
      <RoleBasedLayout />
    </RoleProvider>
  );
}

function RoleBasedLayout() {
  const { role } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  // Redirigir automáticamente cuando cambia el rol
  useEffect(() => {
    if (!role) return;
    let target = '';
    if (role === 'administrador') target = '/admin';
    else if (role === 'trabajador') target = '/trabajador';
    else if (role === 'cliente') target = '/cliente';
    // Solo redirigir si la ruta no coincide exactamente
    if (target && !pathname.startsWith(target)) {
      router.replace(target);
    }
  }, [role, pathname]);

  if (!role) {
    return <AuthScreen />;
  }
  return <Slot />;
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
