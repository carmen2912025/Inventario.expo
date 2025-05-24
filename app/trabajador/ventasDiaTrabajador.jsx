import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '../../constants/api';

export default function VentasDiaTrabajador() {
  const [ventas, setVentas] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/sales-today-list`)
      .then(res => res.json())
      .then(data => setVentas(data || []))
      .catch(() => setError('No se pudo cargar las ventas del día.'));
  }, []);

  const totalDia = ventas.reduce((acc, v) => acc + Number(v.total), 0);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ventas del Día - Cierre de Caja</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {ventas.length === 0 ? (
        <Text style={styles.info}>No hay ventas registradas hoy.</Text>
      ) : (
        <View>
          {ventas.map((venta) => (
            <View key={venta.id} style={styles.ventaBox}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <View>
                  <Text style={styles.ventaId}>Venta #{venta.id}</Text>
                  <Text style={styles.ventaCliente}>{venta.cliente ? venta.cliente : 'Sin cliente'}</Text>
                  <Text style={styles.ventaFecha}>{new Date(venta.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  <Text style={styles.ventaTotal}>Total: ${Number(venta.total).toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleExpand(venta.id)} style={styles.verBtn}>
                  <Text style={styles.verBtnText}>{expanded[venta.id] ? 'Ocultar' : 'Ver'}</Text>
                </TouchableOpacity>
              </View>
              {expanded[venta.id] && (
                <View style={styles.detalleBox}>
                  {venta.detalles.length === 0 ? (
                    <Text style={styles.info}>Sin productos</Text>
                  ) : (
                    venta.detalles.map((d, idx) => (
                      <View key={idx} style={styles.detalleItem}>
                        <Text style={styles.product}>{d.nombre}</Text>
                        <Text style={styles.qty}>Cantidad: {d.cantidad}</Text>
                        <Text style={styles.price}>Precio: ${Number(d.precio_unitario).toFixed(2)}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))}
          <Text style={styles.total}>Total del día: ${Number(totalDia).toFixed(2)}</Text>
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
  ventaBox: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 14 },
  ventaId: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  ventaCliente: { fontSize: 14, color: '#334155' },
  ventaFecha: { fontSize: 13, color: '#64748b' },
  ventaTotal: { fontSize: 15, color: '#0e7490', fontWeight: 'bold' },
  verBtn: { backgroundColor: '#0ea5e9', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 16 },
  verBtnText: { color: '#fff', fontWeight: 'bold' },
  detalleBox: { marginTop: 10, backgroundColor: '#e0f2fe', borderRadius: 6, padding: 8 },
  detalleItem: { marginBottom: 6 },
  product: { fontSize: 15, fontWeight: 'bold', color: '#2563eb' },
  qty: { fontSize: 14, color: '#334155' },
  price: { fontSize: 14, color: '#0e7490' },
  total: { fontSize: 18, fontWeight: 'bold', color: '#16a34a', marginTop: 16, textAlign: 'right' },
});
