import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [clienteId, setClienteId] = useState('');
  const [total, setTotal] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => { fetchSales(); }, []);

  function showSnackbar(msg) {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(''), 2500);
  }

  async function fetchSales() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sales`);
      const data = await res.json();
      setSales(data);
    } catch {
      showSnackbar('Error al cargar ventas');
    }
    setLoading(false);
  }

  async function addOrEditSale() {
    if (!clienteId.trim() || !total.trim()) {
      showSnackbar('Cliente y total son obligatorios');
      return;
    }
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/sales/${editingId}` : `${API_BASE_URL}/sales`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId, total: parseFloat(total) })
      });
      if (!res.ok) throw new Error();
      setClienteId(''); setTotal(''); setEditingId(null);
      fetchSales();
      showSnackbar(editingId ? 'Venta editada' : 'Venta agregada');
    } catch {
      showSnackbar('Error al guardar');
    }
    setLoading(false);
  }

  function editSale(sale) {
    setEditingId(sale.id); setClienteId(sale.cliente_id?.toString() || ''); setTotal(sale.total?.toString() || '');
  }

  function cancelEdit() {
    setEditingId(null); setClienteId(''); setTotal('');
  }

  function handleDeleteSale(id) {
    Alert.alert(
      'Confirmar eliminación',
      '¿Eliminar esta venta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteSale(id) },
      ]
    );
  }

  async function deleteSale(id) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sales/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchSales();
      showSnackbar('Venta eliminada');
    } catch {
      showSnackbar('Error al eliminar');
    }
    setLoading(false);
  }

  const filtered = sales.filter(s =>
    s.cliente_id?.toString().includes(search) ||
    s.id?.toString().includes(search)
  );

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Ventas</Text>
      <TextInput style={styles.input} placeholder="Buscar por cliente o ID..." value={search} onChangeText={setSearch} />
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="ID Cliente*" value={clienteId} onChangeText={setClienteId} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Total*" value={total} onChangeText={setTotal} keyboardType="numeric" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PaperButton mode="contained" onPress={addOrEditSale} style={{ flex: 1, backgroundColor: '#16a34a' }} loading={loading} disabled={loading}>
            {editingId ? 'Editar' : 'Agregar'}
          </PaperButton>
          {editingId && (
            <PaperButton mode="outlined" onPress={cancelEdit} style={{ flex: 1, borderColor: '#16a34a' }} disabled={loading}>
              Cancelar
            </PaperButton>
          )}
        </View>
      </View>
      {loading && <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 16 }} />}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Venta #{item.id}</Text>
              <Text style={styles.itemDetail}>Cliente: {item.cliente_id}</Text>
              <Text style={styles.itemDetail}>Fecha: {item.fecha}</Text>
              <Text style={styles.itemDetail}>Total: ${item.total}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PaperButton mode="text" onPress={() => editSale(item)} labelStyle={styles.editBtn} compact>Editar</PaperButton>
              <PaperButton mode="text" onPress={() => handleDeleteSale(item.id)} labelStyle={styles.deleteBtn} compact>Eliminar</PaperButton>
            </View>
          </View>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin ventas</Text>}
      />
      {snackbar ? (
        <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#16a34a', padding: 16, borderRadius: 8, alignItems: 'center', zIndex: 10 }}>
          <Text style={{ color: '#fff' }}>{snackbar}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 16, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#16a34a' },
  form: { width: '100%', marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  input: { width: '100%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 8, marginBottom: 8 },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontWeight: 'bold', fontSize: 16, color: '#16a34a' },
  itemDetail: { color: '#555', fontSize: 14 },
  editBtn: { color: '#2563eb', marginRight: 12 },
  deleteBtn: { color: '#dc2626' },
});
