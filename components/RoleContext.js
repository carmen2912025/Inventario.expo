import React, { createContext, useContext, useState } from 'react';

// Roles: 'administrador', 'trabajador', 'cliente'
const defaultRole = null; // No hay rol por defecto, fuerza selección

const RoleContext = createContext({
  role: defaultRole,
  setRole: (role) => {},
});

export function RoleProvider({ children }) {
  const [role, setRole] = useState(defaultRole);

  // Permitir persistencia en localStorage para web
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = window.localStorage.getItem('role');
      if (savedRole && !role) setRole(savedRole);
    }
  }, []);

  const setRoleAndPersist = (newRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('role', newRole);
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
