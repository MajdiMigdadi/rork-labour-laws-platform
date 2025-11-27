import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { mockUsers } from '@/mocks/data';

const AUTH_KEY = '@auth_user';
const USERS_KEY = '@all_users';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedUser, storedUsers] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(USERS_KEY),
      ]);

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (parseError) {
          console.error('Failed to parse user JSON, clearing corrupted data:', parseError);
          await AsyncStorage.removeItem(AUTH_KEY);
          setUser(null);
        }
      }

      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          setUsers(parsed);
        } catch (parseError) {
          console.error('Failed to parse users JSON, using defaults:', parseError);
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
          setUsers(mockUsers);
        }
      } else {
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
      setUser(null);
      setUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsers = async (newUsers: User[]) => {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
      setUsers(newUsers);
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      if (foundUser.status === 'banned') {
        return false;
      }
      
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      };
      
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      await saveUsers(updatedUsers);
      
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      level: 'beginner',
      reputation: 0,
      status: 'active',
      joinedDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return false;
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    await saveUsers(updatedUsers);
    
    return true;
  };

  const updateAnyUser = async (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    await saveUsers(updatedUsers);
    
    if (user && user.id === userId) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
      if (updatedCurrentUser) {
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedCurrentUser));
        setUser(updatedCurrentUser);
      }
    }
    
    return true;
  };

  const deleteUser = async (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveUsers(updatedUsers);
    return true;
  };

  const banUser = async (userId: string) => {
    return updateAnyUser(userId, { status: 'banned' });
  };

  const unbanUser = async (userId: string) => {
    return updateAnyUser(userId, { status: 'active' });
  };

  const changeUserRole = async (userId: string, role: User['role']) => {
    return updateAnyUser(userId, { role });
  };

  return {
    user,
    users,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    updateAnyUser,
    deleteUser,
    banUser,
    unbanUser,
    changeUserRole,
  };
});
