import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StockScreen() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStock(); }, []);

  function showSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 2500);
  }

  async function fetchStock() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      const products = await res.json();
      const stockData = await Promise.all(products.map(async (p) => {
        const res = await fetch(`${API_BASE_URL}/stock/${p.id}`);
        const stockArr = await res.json();
        return { ...p, stock: stockArr };
      }));
      setStock(stockData);
    } catch {
      showSnackbar('Error al cargar stock');
    }
    setLoading(false);
  }

  async function editStock(producto_id, ubicacion_id, cantidad) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto_id, ubicacion_id, cantidad })
      });
      if (!res.ok) throw new Error();
      fetchStock();
      showSnackbar('Stock actualizado');
    } catch {
      showSnackbar('Error al actualizar stock');
    }
    setLoading(false);
  }

  const filtered = stock.filter(item =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Stock por Producto</Text>
      <TextInput style={styles.input} placeholder="Buscar producto..." value={search} onChangeText={setSearch} />
      {loading && <ActivityIndicator size="large" color="#0e7490" style={{ marginTop: 16 }} />}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.info}>SKU: {item.sku}</Text>
            <Text style={styles.info}>Cantidad total: {item.stock?.reduce((acc, s) => acc + s.cantidad, 0) ?? 0}</Text>
            {item.stock?.map((s, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.info}>Ubicación {s.ubicacion_id}: {s.cantidad}</Text>
                <PaperButton mode="text" onPress={() => editStock(item.id, s.ubicacion_id, s.cantidad + 1)} labelStyle={styles.editBtn} compact>+1</PaperButton>
                <PaperButton mode="text" onPress={() => editStock(item.id, s.ubicacion_id, Math.max(0, s.cantidad - 1))} labelStyle={styles.deleteBtn} compact>-1</PaperButton>
              </View>
            ))}
          </View>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin stock</Text>}
      />
      {snackbar ? (
        <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#0e7490', padding: 16, borderRadius: 8, alignItems: 'center', zIndex: 10 }}>
          <Text style={{ color: '#fff' }}>{snackbar}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' },
  input: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 8, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#0e7490' },
  info: { fontSize: 14, color: '#334155' },
  editBtn: { color: '#2563eb', marginLeft: 8 },
  deleteBtn: { color: '#dc2626', marginLeft: 8 },
});
