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
        horizontal
        keyExtractor={item => item.id?.toString()}
        style={{ marginBottom: 16 }}
        renderItem={({ item }) => (
          <Text
            style={[styles.productBtn, selectedProduct === item.id && styles.selectedBtn]}
            onPress={() => setSelectedProduct(item.id)}
          >
            {item.nombre}
          </Text>
        )}
      />
      {selectedProduct && (
        <FlatList
          data={history}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.info}>Precio: ${item.precio}</Text>
              <Text style={styles.info}>Fecha: {item.fecha_ultima_actualizacion_precio}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#7c3aed' },
  productBtn: { marginRight: 12, padding: 8, borderRadius: 8, backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' },
  selectedBtn: { backgroundColor: '#7c3aed', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  info: { fontSize: 14, color: '#334155' },
});
