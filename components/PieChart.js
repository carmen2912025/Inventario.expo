import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// DEPRECATED: Este componente ya no se usa. Usar directamente PieChart de react-native-chart-kit si se requiere un gráfico de pastel compatible con Expo.

export default function PieChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.deprecatedText}>Este componente está deprecado. Por favor, usa PieChart de react-native-chart-kit.</Text>
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
    alignItems: 'center',
  },
  deprecatedText: {
    fontSize: 16,
    color: '#FF6961',
    textAlign: 'center',
  },
});
