import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StatisticsScreen() {
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales-summary`);
      if (!res.ok) throw new Error('Error al obtener estadísticas');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Estadísticas de Ventas</Text>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <View style={styles.dataContainer}>
        {stats.map((item, index) => (
          <View key={index} style={styles.dataItem}>
            <Text style={styles.dataText}>{JSON.stringify(item)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dataContainer: {
    marginTop: 16,
  },
  dataItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  dataText: {
    fontSize: 14,
  },
});
