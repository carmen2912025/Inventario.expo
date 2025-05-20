import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function PriceHistoryScreen() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetch(`${API_BASE_URL}/products/${selectedProduct}/price-history`)
        .then(res => res.json())
        .then(setHistory);
    }
  }, [selectedProduct]);

  return (
    <View style={styles.container}>
      <RoleSwitcher />
      <Text style={styles.title}>Historial de Precios</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <Text style={styles.product} onPress={() => setSelectedProduct(item.id)}>
            {item.nombre}
          </Text>
        )}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin productos</Text>}
      />
      {selectedProduct && (
        <FlatList
          data={history}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.text}>Precio: {item.precio}</Text>
              <Text style={styles.date}>Fecha: {item.fecha_ultima_actualizacion_precio}</Text>
            </View>
          )}
          style={{ width: '100%', marginTop: 20 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin historial</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#0e7490' },
  product: { fontSize: 16, color: '#2563eb', marginBottom: 8, cursor: 'pointer' },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  text: { fontSize: 16, color: '#334155' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
});
