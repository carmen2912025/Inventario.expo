import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { query } from '../../components/mysqlClient';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StatisticsScreen() {
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState('trabajador');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await query('SELECT * FROM users WHERE id = ?', [1]);
        setUserData(result[0]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  if (!userData) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher currentRole={role} onRoleChange={handleRoleChange} />
      <Text style={styles.title}>Estadísticas</Text>
      <Text style={styles.subtitle}>Bienvenido, {userData.name}</Text>
      {role === 'trabajador' ? (
        <Text style={styles.text}>Tus estadísticas como trabajador</Text>
      ) : (
        <Text style={styles.text}>Tus estadísticas como empleador</Text>
      )}
      {/* Aquí van más componentes o lógica para mostrar las estadísticas */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
});
