import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from './ProfileContext';
import { Operation, Expense, Task, Client } from './AppContext';
import { useAuth } from './AuthContext';

interface AppContextType {
  operations: Operation[];
  addOperation: (operation: Omit<Operation, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateOperation: (id: string, updates: Partial<Operation>) => Promise<void>;
  deleteOperation: (id: string) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  fetchData: () => Promise<void>; // Expose fetchData for manual refresh if needed
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend';

export function AppProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useProfile();
  const { currentUser } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const fetchData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available');
      return;
    }

    const [operationsRes, expensesRes, tasksRes, clientsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/operations`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/api/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/api/clients`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (operationsRes.ok) {
      const data = await operationsRes.json();
      console.log('Operations fetched:', data); // Debug log
      setOperations(data);
    }
    if (expensesRes.ok) setExpenses(await expensesRes.json());
    if (tasksRes.ok) setTasks(await tasksRes.json());
    if (clientsRes.ok) setClients(await clientsRes.json());
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  useEffect(() => {
    fetchData();
  }, [currentUser]); // Fetch data when currentUser changes (login/logout)

  const addOperation = async (operation: Omit<Operation, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...operation, profile: operation.profile || activeProfile }),
      });
      if (response.ok) {
        const newOperation = await response.json();
        setOperations((prev) => [...prev, newOperation]);
      }
    } catch (error) {
      console.error('Error adding operation:', error);
    }
  };

  const updateOperation = async (id: string, updates: Partial<Operation>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/operations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updatedOperation = await response.json();
        setOperations((prev) => prev.map((op) => (op.id === id ? updatedOperation : op)));
      }
    } catch (error) {
      console.error('Error updating operation:', error);
    }
  };

  const deleteOperation = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/operations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setOperations((prev) => prev.filter((op) => op.id !== id));
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => {
    let finalDate: Date;
    if (typeof expense.date === 'string') {
      const [year, month, day] = expense.date.split('-').map(Number);
      finalDate = new Date(year, month - 1, day);
    } else {
      finalDate = expense.date;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...expense, date: finalDate, profile: expense.profile || activeProfile }),
      });
      if (response.ok) {
        const newExpense = await response.json();
        setExpenses((prev) => [...prev, newExpense]);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    let finalDate: Date | undefined;
    if (updates.date && typeof updates.date === 'string') {
      const [year, month, day] = updates.date.split('-').map(Number);
      finalDate = new Date(year, month - 1, day);
    } else if (updates.date) {
      finalDate = updates.date;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...updates, date: finalDate }),
      });
      if (response.ok) {
        const updatedExpense = await response.json();
        setExpenses((prev) => prev.map((exp) => (exp.id === id ? updatedExpense : exp)));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    let finalDate: Date;
    if (typeof task.date === 'string') {
      const [year, month, day] = task.date.split('-').map(Number);
      finalDate = new Date(year, month - 1, day);
    } else {
      finalDate = task.date;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...task, date: finalDate, profile: task.profile || activeProfile }),
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks((prev) => [...prev, newTask]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    let finalDate: Date | undefined;
    if (updates.date && typeof updates.date === 'string') {
      const [year, month, day] = updates.date.split('-').map(Number);
      finalDate = new Date(year, month - 1, day);
    } else if (updates.date) {
      finalDate = updates.date;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...updates, date: finalDate }),
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...client, profile: client.profile || activeProfile }),
      });
      if (response.ok) {
        const newClient = await response.json();
        setClients((prev) => [...prev, newClient]);
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const updatedClient = await response.json();
        setClients((prev) => prev.map((client) => (client.id === id ? updatedClient : client)));
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');
      const response = await fetch(`${API_BASE_URL}/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setClients((prev) => prev.filter((client) => client.id !== id));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const filteredOperations = operations.filter((op) => op.profile === activeProfile);
  const filteredExpenses = expenses.filter((exp) => exp.profile === activeProfile);
  const filteredTasks = tasks.filter((task) => task.profile === activeProfile);
  const filteredClients = clients.filter((client) => client.profile === activeProfile);

  return (
    <AppContext.Provider
      value={{
        operations: filteredOperations,
        addOperation,
        updateOperation,
        deleteOperation,
        expenses: filteredExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        tasks: filteredTasks,
        addTask,
        updateTask,
        deleteTask,
        clients: filteredClients,
        addClient,
        updateClient,
        deleteClient,
        fetchData, // Expose fetchData for manual use if needed
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}