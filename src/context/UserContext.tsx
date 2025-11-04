
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Role = 'Officeboy' | 'Supervisor' | null;

interface UserContextType {
  user: { name: string; role: Role };
  login: (name: string, role: Role) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; role: Role }>({ name: '', role: null });

  const login = (name: string, role: Role) => {
    setUser({ name, role });
    // In a real app, you'd also save this to localStorage
  };

  const logout = () => {
    setUser({ name: '', role: null });
    // And clear it from localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
