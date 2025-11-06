
import { createContext, useState, useContext, type ReactNode } from 'react';

type Role = 'Officeboy' | 'Supervisor' | null;

interface UserContextType {
  user: { name: string; role: Role };
  login: (name: string, role: Role) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; role: Role }>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { name: '', role: null };
  });

  const login = (name: string, role: Role) => {
    const newUser = { name, role };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser({ name: '', role: null });
    localStorage.removeItem('user');
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
