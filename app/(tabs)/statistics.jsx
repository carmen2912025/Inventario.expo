import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { query } from '../../components/mysqlClient';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const prodRows = await query('SELECT COUNT(*) as total, SUM(cantidad) as stock, SUM(precio * cantidad) as valor FROM productos');
      const provRows = await query('SELECT COUNT(*) as total FROM proveedores');
      setStats({
        productos: prodRows[0]?.total || 0,
        stock: prodRows[0]?.stock || 0,
        valor: prodRows[0]?.valor || 0,
        proveedores: provRows[0]?.total || 0,
      });
    } catch (e) {
      setDbAvailable(false);
    }
  }

  if (!dbAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Estadísticas</Text>
        <Text style={{ color: 'red', marginTop: 20 }}>No se pudo conectar a la base de datos MySQL.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Estadísticas</Text>
      <Text style={styles.subtitle}>Visualiza métricas y reportes de tu inventario.</Text>
      {stats ? (
        <View style={styles.statsBox}>
          <Text style={styles.statItem}>Productos activos: <Text style={styles.statValue}>{stats.productos}</Text></Text>
          <Text style={styles.statItem}>Proveedores activos: <Text style={styles.statValue}>{stats.proveedores}</Text></Text>
          <Text style={styles.statItem}>Stock total: <Text style={styles.statValue}>{stats.stock}</Text></Text>
          <Text style={styles.statItem}>Valor total inventario: <Text style={styles.statValue}>${stats.valor?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text></Text>
        </View>
      ) : (
        <Text style={{ color: '#888', marginTop: 20 }}>Cargando estadísticas...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f6f2',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e17055',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  statsBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 10,
  },
  statItem: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#e17055',
  },
});
