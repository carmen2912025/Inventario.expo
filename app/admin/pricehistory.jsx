import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import { useProducts } from '../../hooks/useProducts';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function PriceHistoryScreen() {
  // Usa hook para productos
  const { products, loading, error, reload } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);

  useEffect(() => {
    if (selectedProduct) {
      setLoadingHistory(true);
      setErrorHistory(null);
      fetch(`${API_BASE_URL}/products/${selectedProduct}/price-history`)
        .then(res => {
          if (!res.ok) throw new Error('Error al obtener historial');
          return res.json();
        })
        .then(setHistory)
        .catch(() => setErrorHistory('No se pudo cargar el historial'))
        .finally(() => setLoadingHistory(false));
    }
  }, [selectedProduct]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Historial de Precios</Text>
      {!selectedProduct ? (
        <FlatList
          data={products}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedProduct(item.id)}>
              <View style={styles.productCard}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productPrice}>${item.precio}</Text>
              </View>
            </TouchableOpacity>
          )}
          style={{ width: '100%', marginTop: 20 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin productos</Text>}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver a productos</Text>
          </TouchableOpacity>
          <Text style={styles.selectedTitle}>Historial de: {products.find(p => p.id === selectedProduct)?.nombre}</Text>
          {loadingHistory ? (
            <ActivityIndicator size="large" color="#0e7490" style={{ marginTop: 32 }} />
          ) : errorHistory ? (
            <Text style={{ color: '#dc2626', textAlign: 'center', marginTop: 32 }}>{errorHistory}</Text>
          ) : (
            <ScrollView style={{ width: '100%', marginTop: 12 }}>
              {history.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#888' }}>Sin historial</Text>
              ) : (
                history.map(item => (
                  <View key={item.id} style={styles.item}>
                    <Text style={styles.text}>Precio: <Text style={{ color: '#0e7490', fontWeight: 'bold' }}>${item.precio}</Text></Text>
                    <Text style={styles.date}>Fecha: {formatDate(item.fecha)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' },
  productCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 16, color: '#2563eb', fontWeight: 'bold' },
  productPrice: { fontSize: 16, color: '#334155' },
  item: { backgroundColor: '#e0f2fe', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  text: { fontSize: 16, color: '#334155' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  backBtn: { marginBottom: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4 },
  backBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 15 },
  selectedTitle: { fontSize: 18, fontWeight: 'bold', color: '#0e7490', marginBottom: 12, marginLeft: 2 },
});
