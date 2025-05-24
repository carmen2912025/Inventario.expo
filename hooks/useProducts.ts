import { useState, useEffect } from 'react';
import { Producto } from '../types/dbTypes';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../constants/api';

// Hook para manejar productos (fetch, add, update, delete)
export function useProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Producto, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await createProduct(product);
      setProducts((prev) => [...prev, newProduct]);
    } catch (e: any) {
      setError(e.message || 'Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (id: number, updates: Partial<Producto>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (e: any) {
      setError(e.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message || 'Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    reload: loadProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
}
