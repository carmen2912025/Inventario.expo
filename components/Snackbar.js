import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function Snackbar({ visible, message, type = 'info', onHide }) {
  if (!visible) return null;
  return (
    <Animated.View style={[styles.container, type === 'error' ? styles.error : styles.success]}>
      <Text style={styles.text}>{message}</Text>
      {/* Se puede agregar botón de cerrar o deshacer si se requiere */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  success: {
    backgroundColor: '#16a34a',
  },
  error: {
    backgroundColor: '#dc2626',
  },
});
