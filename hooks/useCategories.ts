import { useState, useEffect } from 'react';
import { Categoria } from '../types/dbTypes';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../constants/api';

// Hook para manejar categorías (fetch, add, update, delete)
export function useCategories() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Categoria, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await createCategory(category);
      setCategories((prev) => [...prev, newCategory]);
    } catch (e: any) {
      setError(e.message || 'Error al agregar categoría');
    } finally {
      setLoading(false);
    }
  };

  const editCategory = async (id: number, updates: Partial<Categoria>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCategory(id, updates);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e: any) {
      setError(e.message || 'Error al actualizar categoría');
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e.message || 'Error al eliminar categoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    reload: loadCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}
