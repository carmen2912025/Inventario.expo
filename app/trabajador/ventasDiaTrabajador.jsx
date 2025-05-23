import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { API_BASE_URL } from '../../constants/api';

export default function VentasDiaTrabajador() {
  const [detalle, setDetalle] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/sales-today-details`)
      .then(res => res.json())
      .then(data => {
        setDetalle(data.detalle || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError('No se pudo cargar el desglose de ventas del día.'));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ventas del Día - Cierre de Caja</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {detalle.length === 0 ? (
        <Text style={styles.info}>No hay ventas registradas hoy.</Text>
      ) : (
        <View>
          {detalle.map((item, idx) => (
            <View key={idx} style={styles.item}>
              <Text style={styles.product}>{item.nombre}</Text>
              <Text style={styles.qty}>Cantidad: {item.cantidad}</Text>
              <Text style={styles.price}>Total: ${Number(item.total).toFixed(2)}</Text>
            </View>
          ))}
          <Text style={styles.total}>Total del día: ${Number(total).toFixed(2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' },
  error: { color: 'red', marginBottom: 8 },
  info: { color: '#888', marginBottom: 8 },
  item: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 10 },
  product: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  qty: { fontSize: 14, color: '#334155' },
  price: { fontSize: 14, color: '#0e7490' },
  total: { fontSize: 18, fontWeight: 'bold', color: '#16a34a', marginTop: 16, textAlign: 'right' },
});
