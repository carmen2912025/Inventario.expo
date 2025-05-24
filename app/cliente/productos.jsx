import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button as PaperButton } from 'react-native-paper';
import { API_BASE_URL } from '../../constants/api';
import RoleSwitcher from '../../components/RoleSwitcher';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import ListContainer from '../../components/ListContainer';
import ModalForm from '../../components/ModalForm';

export default function ProductsScreen() {
  // Usa hooks para productos y categorías
  const {
    products,
    loading,
    error,
    reload,
  } = useProducts();
  const {
    categories,
    loading: loadingCategories,
    error: errorCategories,
    reload: reloadCategories,
  } = useCategories();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('client');
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const PAGE_SIZE = 20;

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  useEffect(() => {
    setPage(1);
    setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE));
  }, [filteredProducts]);

  useEffect(() => {
    if (page === 1) return;
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedProducts(filteredProducts.slice(0, PAGE_SIZE * page));
      setLoadingMore(false);
    }, 400);
  }, [page, filteredProducts]);

  const filterProducts = () => {
    let filtered = products;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.categoria_id === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (priceMin) {
      filtered = filtered.filter((product) => Number(product.precio) >= Number(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter((product) => Number(product.precio) <= Number(priceMax));
    }
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
  };

  const handleAddProduct = async () => {
    // Lógica para agregar producto
    const body = {
      nombre: newProduct.name,
      precio: Number(newProduct.price),
      categoria_id: newProduct.category,
      descripcion: newProduct.description,
      cantidad: Number(quantity),
    };
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error('Error al agregar producto');
      }
      const data = await response.json();
      console.log('Producto agregado:', data);
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setQuantity('');
      setModalVisible(false);
      reload();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (displayedProducts.length < filteredProducts.length && !loadingMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen.startsWith('data:') ? item.imagen : `data:image/jpeg;base64,${item.imagen}` }} style={{ width: 60, height: 45, borderRadius: 6, marginBottom: 8 }} />
      ) : null}
      <Text style={styles.productName}>{item.nombre}</Text>
      <Text style={styles.productPrice}>
        {item.precio !== undefined && item.precio !== null && !isNaN(Number(item.precio))
          ? `$${Number(item.precio).toFixed(2)}`
          : 'Precio no disponible'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <RoleSwitcher userRole={userRole} onRoleChange={handleRoleChange} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => setShowFilters(f => !f)} style={{ marginLeft: 8, padding: 8, backgroundColor: '#e0e7ef', borderRadius: 8 }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>{showFilters ? 'Ocultar filtros' : 'Filtros'}</Text>
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#0e7490' }}>Filtros avanzados</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={handleCategoryChange}
              style={[styles.input, { flex: 1 }]}
            >
              <Picker.Item label="Todas las categorías" value="all" />
              {categories.map(cat => (
                <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
              ))}
            </Picker>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Precio mínimo"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Precio máximo"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="numeric"
            />
          </View>
        </View>
      )}
      <ListContainer
        data={displayedProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        loading={loading}
        error={error}
        emptyText="Sin productos"
        style={styles.productList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      {loadingMore && (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} />
      )}
      <PaperButton mode="contained" onPress={reload} style={styles.refreshButton}>
        Refrescar productos
      </PaperButton>
      <PaperButton mode="contained" onPress={() => setModalVisible(true)} style={styles.addButton}>
        Agregar Producto
      </PaperButton>
      <ModalForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={'Nuevo Producto'}
        actions={[
          <PaperButton mode="contained" onPress={handleAddProduct} disabled={submitting} key="add">
            {submitting ? 'Guardando...' : 'Guardar'}
          </PaperButton>
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={newProduct.name}
          onChangeText={text => setNewProduct({ ...newProduct, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Precio"
          value={newProduct.price}
          onChangeText={text => setNewProduct({ ...newProduct, price: text })}
          keyboardType="numeric"
          editable={true}
        />
        <Picker
          selectedValue={newProduct.category}
          onValueChange={value => setNewProduct({ ...newProduct, category: value })}
          style={styles.input}
          testID="picker-categoria"
          enabled={true}
        >
          <Picker.Item label="Selecciona categoría" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={newProduct.description}
          onChangeText={text => setNewProduct({ ...newProduct, description: text })}
          editable={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
      </ModalForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  searchInput: {
    height: 40,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontFamily: 'SpaceMono',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  productList: {
    paddingBottom: 16,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    fontFamily: 'SpaceMono',
  },
  productPrice: {
    fontSize: 14,
    color: '#0e7490',
    fontFamily: 'SpaceMono',
  },
  refreshButton: {
    marginTop: 16,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  input: {
    height: 40,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontFamily: 'SpaceMono',
  },
  feedback: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
});
