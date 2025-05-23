import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Roles: 'administrador', 'trabajador', 'cliente'
const defaultRole = null; // No hay rol por defecto, fuerza selección

const RoleContext = createContext({
  role: defaultRole,
  setRole: (role) => {},
});

export function RoleProvider({ children }) {
  const [role, setRole] = useState(defaultRole);

  // Persistencia multiplataforma: AsyncStorage en móvil, localStorage en web
  React.useEffect(() => {
    async function loadRole() {
      if (typeof window !== 'undefined') {
        const savedRole = window.localStorage.getItem('role');
        if (savedRole && !role) setRole(savedRole);
      } else {
        try {
          const savedRole = await AsyncStorage.getItem('role');
          if (savedRole && !role) setRole(savedRole);
        } catch {}
      }
    }
    loadRole();
  }, []);

  const setRoleAndPersist = async (newRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('role', newRole);
    } else {
      try {
        await AsyncStorage.setItem('role', newRole);
      } catch {}
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleAndPersist }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
