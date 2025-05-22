import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function StatisticsScreen() {
  const [salesSummary, setSalesSummary] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('admin');

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [summaryRes, topRes, todayRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sales-summary`),
        fetch(`${API_BASE_URL}/top-products?limit=5`),
        fetch(`${API_BASE_URL}/sales-today`)
      ]);
      if (!summaryRes.ok || !topRes.ok || !todayRes.ok) throw new Error('Error al obtener estadísticas');
      setSalesSummary(await summaryRes.json());
      setTopProducts(await topRes.json());
      setTodaySummary(await todayRes.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  return (
    <ScrollView style={styles.container}>
      <RoleSwitcher currentRole={role} onRoleChange={handleRoleChange} />
      <Text style={styles.title}>Estadísticas de Ventas</Text>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <View style={styles.dataContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Ventas del Día</Text>
          {todaySummary ? (
            <View style={styles.card}>
              <Text style={styles.dataText}>Ventas: <Text style={styles.bold}>{todaySummary.total_ventas}</Text></Text>
              <Text style={styles.dataText}>Monto Total: <Text style={styles.bold}>${Number(todaySummary.monto_total).toFixed(2)}</Text></Text>
            </View>
          ) : <Text style={styles.dataText}>No hay datos de hoy.</Text>}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
          {topProducts.length > 0 ? topProducts.map((prod, idx) => (
            <View key={prod.id} style={styles.card}>
              <Text style={styles.dataText}>{idx + 1}. <Text style={styles.bold}>{prod.nombre}</Text></Text>
              <Text style={styles.dataText}>Vendidos: <Text style={styles.bold}>{prod.total_vendidos}</Text></Text>
              <Text style={styles.dataText}>Ingresos: <Text style={styles.bold}>${Number(prod.total_ingresos).toFixed(2)}</Text></Text>
            </View>
          )) : <Text style={styles.dataText}>No hay ventas registradas.</Text>}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Últimos 30 Días</Text>
          {salesSummary.length > 0 ? (
            <>
              <LineChart
                data={{
                  labels: salesSummary.map(item => item.dia.slice(5)),
                  datasets: [
                    {
                      data: salesSummary.map(item => Number(item.monto_total) || 0)
                    }
                  ]
                }}
                width={Dimensions.get('window').width - 32}
                height={220}
                yAxisLabel="$"
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#f9fafb',
                  backgroundGradientTo: '#e0e7ef',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                  style: { borderRadius: 8 },
                  propsForDots: { r: '4', strokeWidth: '2', stroke: '#2563eb' }
                }}
                bezier
                style={{ marginVertical: 8, borderRadius: 8 }}
              />
              {salesSummary.map((item, idx) => (
                <View key={item.dia || idx} style={styles.dataItem}>
                  <Text style={styles.dataText}>Día: <Text style={styles.bold}>{item.dia}</Text></Text>
                  <Text style={styles.dataText}>Ventas: <Text style={styles.bold}>{item.total_ventas}</Text></Text>
                  <Text style={styles.dataText}>Monto: <Text style={styles.bold}>${Number(item.monto_total).toFixed(2)}</Text></Text>
                </View>
              ))}
            </>
          ) : <Text style={styles.dataText}>No hay datos históricos.</Text>}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top 10 Productos Más Vendidos</Text>
          {topProducts.length > 0 ? (
            <BarChart
              data={{
                labels: topProducts.slice(0, 10).map(p => p.nombre.length > 8 ? p.nombre.slice(0, 8) + '…' : p.nombre),
                datasets: [
                  { data: topProducts.slice(0, 10).map(p => Number(p.total_vendidos) || 0) }
                ]
              }}
              width={Dimensions.get('window').width - 32}
              height={220}
              yAxisLabel=""
              fromZero
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#f9fafb',
                backgroundGradientTo: '#e0e7ef',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(14, 116, 144, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                style: { borderRadius: 8 },
                propsForBackgroundLines: { stroke: '#e5e7eb' }
              }}
              style={{ marginVertical: 8, borderRadius: 8 }}
              showValuesOnTopOfBars
            />
          ) : <Text style={styles.dataText}>No hay ventas registradas.</Text>}
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0e7490',
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
