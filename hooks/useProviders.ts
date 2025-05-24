import { useState, useEffect } from 'react';
import { Proveedor } from '../types/dbTypes';
import { fetchProviders, createProvider, updateProvider, deleteProvider } from '../constants/api';

// Hook para manejar proveedores (fetch, add, update, delete)
export function useProviders() {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviders();
      setProviders(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const addProvider = async (provider: Omit<Proveedor, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newProvider = await createProvider(provider);
      setProviders((prev) => [...prev, newProvider]);
    } catch (e: any) {
      setError(e.message || 'Error al agregar proveedor');
    } finally {
      setLoading(false);
    }
  };

  const editProvider = async (id: number, updates: Partial<Proveedor>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateProvider(id, updates);
      setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (e: any) {
      setError(e.message || 'Error al actualizar proveedor');
    } finally {
      setLoading(false);
    }
  };

  const removeProvider = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProvider(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e.message || 'Error al eliminar proveedor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    reload: loadProviders,
    addProvider,
    editProvider,
    removeProvider,
  };
}
