import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// DEPRECATED: Este componente ya no se usa. Usar directamente LineChart de react-native-chart-kit en las pantallas de estadísticas.

export default function LineChart({ data, x, y, color = '#FF6961', title }) {
  return (
    <View style={styles.container}>
      {title && <View style={styles.title}><Text style={styles.titleText}>{title}</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    padding: 8,
  },
  title: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6961',
  },
});
