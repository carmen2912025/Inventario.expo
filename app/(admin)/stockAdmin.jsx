import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function StockScreen() {
  const [role, setRole] = useState('buyer');
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks`);
      const data = await response.json();
      setStocks(data);
      setFilteredStocks(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert('Error', 'Failed to fetch stocks');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = stocks.filter((stock) =>
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  };

  const renderStockItem = ({ item }) => (
    <View style={styles.stockItem}>
      <Text style={styles.stockName}>{item.name}</Text>
      <Text style={styles.stockQuantity}>Quantity: {item.quantity}</Text>
      <Text style={styles.stockPrice}>Price: ${item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <RoleSwitcher role={role} setRole={setRole} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search stocks..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredStocks}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.stockList}
        />
      )}
      <PaperButton mode="contained" onPress={fetchStocks} style={styles.refreshButton}>
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
  stockList: {
    paddingBottom: 16,
  },
  stockItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stockName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockQuantity: {
    fontSize: 16,
    marginTop: 4,
  },
  stockPrice: {
    fontSize: 16,
    marginTop: 4,
    color: '#2ecc71',
  },
  refreshButton: {
    marginTop: 16,
  },
});
