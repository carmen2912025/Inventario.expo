import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ShoppingListsScreen() {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('trabajador');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadShoppingLists();
    // Registrar callback global para refrescar listas desde otras pantallas
    globalThis.refreshShoppingLists = () => loadShoppingLists();
    // Callback para navegar desde productos
    globalThis.navigateToShoppingLists = () => {
      setTimeout(() => {
        // Si usas un router, aquí deberías navegar a la pantalla de listas
        // Por ejemplo, si usas Expo Router:
        if (typeof window !== 'undefined' && window.location) {
          window.location.hash = '/trabajador/salesTrabajador';
        }
      }, 100);
    };
    return () => {
      delete globalThis.refreshShoppingLists;
      delete globalThis.navigateToShoppingLists;
    };
  }, []);

  const loadShoppingLists = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('shoppingLists');
      setShoppingLists(stored ? JSON.parse(stored) : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const updated = shoppingLists.map(list => list.id === id ? { ...list, cancelled: true } : list);
    await AsyncStorage.setItem('shoppingLists', JSON.stringify(updated));
    setShoppingLists(updated);
    setFeedback('Compra cancelada');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleConfirm = async (id) => {
    const updated = shoppingLists.map(list => list.id === id ? { ...list, paid: true } : list);
    await AsyncStorage.setItem('shoppingLists', JSON.stringify(updated));
    setShoppingLists(updated);
    setFeedback('Pago confirmado');
    setTimeout(() => setFeedback(''), 3000);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemText}>Lista #{item.id}</Text>
        <Text style={styles.itemText}>Total: ${item.total.toFixed(2)}</Text>
        <Text style={styles.itemText}>Estado: {item.cancelled ? 'Cancelada' : item.paid ? 'Pagada' : 'Pendiente'}</Text>
      </View>
      {!item.paid && !item.cancelled && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PaperButton mode="contained" onPress={() => handleConfirm(item.id)}>
            Confirmar Pago
          </PaperButton>
          <PaperButton mode="outlined" onPress={() => handleCancel(item.id)} color="#e17055">
            Cancelar Compra
          </PaperButton>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher currentRole={role} onRoleChange={setRole} />
      <Text style={styles.title}>Listas de Compras</Text>
      <FlatList
        data={shoppingLists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No hay listas de compras pendientes.</Text>}
      />
      {!!feedback && (
        <Text style={{ color: 'green', marginBottom: 8 }}>{feedback}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2563eb',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
});
