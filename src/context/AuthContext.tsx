import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'gestor' | 'colaborador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: {
    canViewFinance: boolean;
    canEditOperations: boolean;
    canManageUsers: boolean;
    canAccessAllProjects: boolean;
    assignedOperations: string[];
  };
  createdAt: Date;
  lastLogin?: Date;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUserPermissions: (id: string, permissions: User['permissions']) => Promise<void>;
  isLoading: boolean;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const { token, user } = await response.json();
      localStorage.setItem('token', token); // Ensure this line executes
      setCurrentUser(user);
      await fetchUsers();
      return true;
    } else {
      const errorData = await response.json();
      console.error('Login failed:', errorData);
      throw new Error(
        errorData.errors
          ? errorData.errors.map((err: any) => err.msg).join(', ')
          : errorData.message || 'Login failed'
      );
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem('token', token);
        setCurrentUser(user);
        await fetchUsers();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Register failed:', errorData);
        throw new Error(
          errorData.errors
            ? errorData.errors.map((err: any) => err.msg).join(', ')
            : errorData.message || 'Registration failed'
        );
      }
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUsers([]);
    navigate('/login');
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
        if (currentUser?.id === id) {
          setCurrentUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (currentUser?.id === id) {
          logout();
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const updateUserPermissions = async (id: string, permissions: User['permissions']) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ permissions }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
        if (currentUser?.id === id) {
          setCurrentUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        addUser,
        updateUser,
        deleteUser,
        updateUserPermissions,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}