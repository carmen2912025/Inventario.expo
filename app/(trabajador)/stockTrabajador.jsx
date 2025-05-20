import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StockScreen() {
  const [role, setRole] = useState('trabajador');
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchQuery, stocks]);

  const fetchStocks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks`);
      const data = await response.json();
      setStocks(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert('Error', 'Failed to fetch stocks');
    }
  };

  const filterStocks = () => {
    if (searchQuery === '') {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  };

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const handleRoleChange = newRole => {
    setRole(newRole);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.quantity} in stock</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <RoleSwitcher role={role} onRoleChange={handleRoleChange} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search stocks..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredStocks}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />
      <PaperButton mode="contained" onPress={fetchStocks} style={styles.button}>
        Refresh
      </PaperButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  list: {
    flexGrow: 1,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    marginTop: 16,
  },
});
