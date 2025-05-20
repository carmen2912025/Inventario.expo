import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { query } from '../../components/mysqlClient';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StatisticsScreen() {
  const [userData, setUserData] = useState([]);
  const [role, setRole] = useState('student'); // default role

  useEffect(() => {
    fetchData();
  }, [role]);

  const fetchData = async () => {
    try {
      const result = await query(`SELECT * FROM ${role}`);
      setUserData(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
  };

  return (
    <View style={styles.container}>
      <RoleSwitcher onRoleChange={handleRoleChange} />
      <Text style={styles.title}>Statistics</Text>
      <View style={styles.dataContainer}>
        {userData.map((item, index) => (
          <View key={index} style={styles.dataItem}>
            <Text style={styles.dataText}>{JSON.stringify(item)}</Text>
          </View>
        ))}
      </View>
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
    marginBottom: 16,
  },
  dataContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    elevation: 1,
  },
  dataItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 1,
  },
  dataText: {
    fontSize: 16,
  },
});
