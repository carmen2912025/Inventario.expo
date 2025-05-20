import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Alert, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';

export default function ProductsScreen() {
  const [selectedValue, setSelectedValue] = useState("java");
  const [text, setText] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((response) => response.json())
      .then((json) => {
        setData(json);
        setFilteredData(json);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleSearch = (value) => {
    setText(value);
    if (value) {
      const filtered = data.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const handleAddToCart = (item) => {
    // Add to cart functionality
    Alert.alert(`${item.name} added to cart!`);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RoleSwitcher />
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={text}
        onChangeText={handleSearch}
      />
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="javascript" />
        <Picker.Item label="Python" value="python" />
      </Picker>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>${item.price}</Text>
            <PaperButton 
              mode="contained" 
              onPress={() => handleAddToCart(item)}
              style={styles.button}
            >
              Add to Cart
            </PaperButton>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    marginBottom: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: 'green',
  },
  button: {
    marginTop: 10,
  },
});
