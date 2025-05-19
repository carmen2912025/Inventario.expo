import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | null {
  const scheme = _useColorScheme();
  if (scheme === 'light' || scheme === 'dark') return scheme;
  return null;
}
