// Paleta moderna y tipografías globales
const palette = {
  primary: '#0e7490', // cyan-700
  secondary: '#2563eb', // blue-600
  accent: '#eab308', // yellow-400
  error: '#e11d48', // rose-600
  success: '#22c55e', // green-500
  warning: '#f59e42', // orange-400
  info: '#38bdf8', // sky-400
  backgroundLight: '#f9fafb', // zinc-50
  backgroundDark: '#18181b', // zinc-900
  surface: '#fff',
  surfaceDark: '#23272f',
  border: '#e5e7eb', // zinc-200
  textLight: '#334155', // slate-700
  textDark: '#f1f5f9', // slate-100
};

export const FONT_FAMILY = {
  regular: 'SpaceMono',
  mono: 'SpaceMono',
};

export default {
  light: {
    text: palette.textLight,
    background: palette.backgroundLight,
    tint: palette.primary,
    tabIconDefault: '#cbd5e1',
    tabIconSelected: palette.primary,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    info: palette.info,
    surface: palette.surface,
    border: palette.border,
    fontFamily: FONT_FAMILY.regular,
  },
  dark: {
    text: palette.textDark,
    background: palette.backgroundDark,
    tint: palette.primary,
    tabIconDefault: '#334155',
    tabIconSelected: palette.primary,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    info: palette.info,
    surface: palette.surfaceDark,
    border: '#334155',
    fontFamily: FONT_FAMILY.regular,
  },
};
