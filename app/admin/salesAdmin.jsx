import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function SalesScreen() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('buyer'); // default role
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [total, setTotal] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales`);
      const data = await response.json();
      setSalesData(data);
    } catch (err) {
      setError(err);
      Alert.alert('Error', 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = () => {
    setModalVisible(true);
  };

  const submitSale = async () => {
    const errors = [];
    if (!clienteId) {
      errors.push('Cliente ID es obligatorio');
    } else if (isNaN(clienteId) || parseInt(clienteId) <= 0) {
      errors.push('Cliente ID debe ser un número válido');
    }
    if (!total) {
      errors.push('Total es obligatorio');
    } else if (isNaN(total) || parseFloat(total) <= 0) {
      errors.push('El total debe ser un número mayor a 0');
    }
    if (errors.length > 0) {
      setFeedback(errors.join('\n'));
      Alert.alert('Error', errors.join('\n'));
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
      fetchSalesData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la venta');
      setFeedback('No se pudo agregar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.price}</Text>
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
      <RoleSwitcher role={role} setRole={setRole} />
      <FlatList
        data={salesData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      {!!feedback && (
        Array.isArray(feedback.split('\n')) && feedback.includes('\n') ? (
          <View style={{ marginBottom: 8 }}>
            {feedback.split('\n').map((err, idx) => (
              <Text key={idx} style={{ color: 'red' }}>{err}</Text>
            ))}
          </View>
        ) : (
          <Text style={{ color: feedback.includes('correctamente') ? 'green' : 'red', marginBottom: 8 }}>{feedback}</Text>
        )
      )}
      <PaperButton mode="contained" onPress={handleAddSale} style={styles.button}>
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
    paddingBottom: 80,
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
  button: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
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
