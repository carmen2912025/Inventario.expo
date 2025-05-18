import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button, Alert, TouchableOpacity, View, Text } from 'react-native';
import { initDB, getDb } from '../../components/db';

export default function ProvidersScreen() {
  const [proveedores, setProveedores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  let realDb = null;

  useEffect(() => {
    (async () => {
      await initDB();
      realDb = await getDb();
      fetchProveedores();
    })();
  }, []);

  async function fetchProveedores() {
    if (realDb && realDb.getAllAsync) {
      const rows = await realDb.getAllAsync('SELECT * FROM proveedores WHERE is_active = 1');
      setProveedores(rows);
    } else if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM proveedores WHERE is_active = 1',
          [],
          (_, result) => setProveedores(result.rows._array),
          (_, error) => { console.log(error); return false; }
        );
      });
    }
  }

  async function addProveedor() {
    if (!nombre.trim()) {
      Alert.alert('Nombre requerido');
      return;
    }
    if (realDb && realDb.runAsync) {
      await realDb.runAsync('INSERT INTO proveedores (nombre, direccion, telefono, correo, is_active) VALUES (?, ?, ?, ?, 1)', [nombre, direccion, telefono, correo]);
      setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
      fetchProveedores();
    } else if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO proveedores (nombre, direccion, telefono, correo, is_active) VALUES (?, ?, ?, ?, 1)',
          [nombre, direccion, telefono, correo],
          () => {
            setNombre(''); setDireccion(''); setTelefono(''); setCorreo('');
            fetchProveedores();
          },
          (_, error) => { console.log(error); return false; }
        );
      });
    }
  }

  async function deleteProveedor(id) {
    if (realDb && realDb.runAsync) {
      await realDb.runAsync('UPDATE proveedores SET is_active = 0 WHERE id = ?', [id]);
      fetchProveedores();
    } else if (realDb && realDb.transaction) {
      realDb.transaction((tx) => {
        tx.executeSql(
          'UPDATE proveedores SET is_active = 0 WHERE id = ?',
          [id],
          fetchProveedores,
          (_, error) => { console.log(error); return false; }
        );
      });
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.nombre}</Text>
        <Text style={styles.itemDetail}>{item.direccion}</Text>
        <Text style={styles.itemDetail}>{item.telefono} {item.correo}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteProveedor(item.id)}>
        <Text style={styles.deleteBtn}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proveedores</Text>
      <Text style={styles.subtitle}>Gestiona tus proveedores y contactos.</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={direccion}
          onChangeText={setDireccion}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={telefono}
          onChangeText={setTelefono}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={correo}
          onChangeText={setCorreo}
        />
        <Button title="Agregar proveedor" onPress={addProveedor} />
      </View>
      <FlatList
        data={proveedores}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        style={{ width: '100%', marginTop: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Sin proveedores</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f0f7fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#00b894',
  },
  itemDetail: {
    color: '#555',
    fontSize: 13,
  },
  deleteBtn: {
    color: '#e17055',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
