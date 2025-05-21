import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function SalesScreen() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('trabajador');
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [total, setTotal] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sales`);
        const json = await response.json();
        setSalesData(json);
      } catch (err) {
        setError(err);
        Alert.alert('Error', 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.amount}</Text>
    </View>
  );

  const handleAddSale = () => {
    setModalVisible(true);
  };

  const submitSale = async () => {
    if (!clienteId || !total) {
      setFeedback('Cliente ID y total son obligatorios');
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      const res = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: parseInt(clienteId), total: parseFloat(total) })
      });
      if (!res.ok) throw new Error('No se pudo agregar la venta');
      setFeedback('Venta agregada correctamente');
      setClienteId(''); setTotal('');
      setModalVisible(false);
      // Refrescar lista
      const response = await fetch(`${API_BASE_URL}/sales`);
      const json = await response.json();
      setSalesData(json);
    } catch (error) {
      setFeedback('No se pudo agregar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher currentRole={role} onRoleChange={handleRoleChange} />
      <FlatList
        data={salesData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      {!!feedback && (
        <Text style={{ color: feedback.includes('correctamente') ? 'green' : 'red', marginBottom: 8 }}>{feedback}</Text>
      )}
      <PaperButton mode="contained" onPress={handleAddSale}>
        Agregar Venta
      </PaperButton>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, width: 320, elevation: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#2563eb' }}>Nueva Venta</Text>
            <TextInput
              style={styles.input}
              placeholder="Cliente ID"
              value={clienteId}
              onChangeText={setClienteId}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Total"
              value={total}
              onChangeText={setTotal}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <PaperButton mode="contained" onPress={submitSale} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </PaperButton>
              <PaperButton mode="outlined" onPress={() => setModalVisible(false)} disabled={submitting}>
                Cancelar
              </PaperButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
