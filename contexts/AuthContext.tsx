import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { API_CONFIG } from '@/services/api';

const AUTH_KEY = '@auth_user';
const AUTH_TOKEN = '@auth_token';
const USERS_KEY = '@all_users';

const API_URL = API_CONFIG.API_URL;

// Helper to make API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!API_CONFIG.USE_REAL_API) return null;
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      console.error(`API error ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load local auth data first
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(AUTH_TOKEN),
      ]);

      if (storedUser && storedToken) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setAuthToken(storedToken);
        } catch (parseError) {
          console.error('Failed to parse user JSON, clearing corrupted data:', parseError);
          await AsyncStorage.removeItem(AUTH_KEY);
          await AsyncStorage.removeItem(AUTH_TOKEN);
          setUser(null);
          setAuthToken(null);
        }
      }

      // Load users from API
      if (API_CONFIG.USE_REAL_API) {
        console.log('📡 Loading users from API...');
        const apiUsers = await apiCall<any[]>('/users');
        if (apiUsers && Array.isArray(apiUsers)) {
          const transformedUsers: User[] = apiUsers.map(u => ({
            id: String(u.id),
            email: u.email,
            name: u.name,
            role: u.role || 'user',
            level: u.level || 'beginner',
            reputation: u.reputation || 0,
            status: u.status || 'active',
            avatar: u.avatar,
            bio: u.bio,
            location: u.location,
            company: u.company,
            phone: u.phone,
            website: u.website,
            joinedDate: u.created_at || u.joinedDate,
            lastLogin: u.last_login || u.lastLogin,
          }));
          console.log('✅ Users loaded from API:', transformedUsers.length);
          setUsers(transformedUsers);
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(transformedUsers));
        }
      } else {
        // Fallback to local storage
        const storedUsers = await AsyncStorage.getItem(USERS_KEY);
        if (storedUsers) {
          try {
            const parsed = JSON.parse(storedUsers);
            setUsers(parsed);
          } catch (parseError) {
            console.error('Failed to parse users JSON:', parseError);
            setUsers([]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
      setUser(null);
      setUsers([]);
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
    try {
      console.log('Attempting login to:', `${API_URL}/login`);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.user && data.token) {
        const userData: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.name,
          role: data.user.role || 'user',
          level: data.user.level || 'beginner',
          reputation: data.user.reputation || 0,
          status: 'active',
          avatar: data.user.avatar,
          bio: data.user.bio,
          location: data.user.location,
          company: data.user.company,
          joinedDate: data.user.created_at,
          lastLogin: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(AUTH_TOKEN, data.token);
        setUser(userData);
        setAuthToken(data.token);
        return true;
      }
      
      console.error('Login failed:', data.message || 'Invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        const userData: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.name,
          role: data.user.role || 'user',
          level: 'beginner',
          reputation: 0,
          status: 'active',
          joinedDate: data.user.created_at,
          lastLogin: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(AUTH_TOKEN, data.token);
        setUser(userData);
        setAuthToken(data.token);
        return true;
      }
      
      console.error('Register failed:', data.message);
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN);
    setUser(null);
    setAuthToken(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return false;
    
    console.log('=== UPDATE USER ===');
    console.log('Updates:', Object.keys(updates));
    if (updates.avatar) {
      console.log('Avatar being saved, length:', updates.avatar.length);
    }
    
    const updatedUser = { ...user, ...updates };
    
    // Save to API
    if (API_CONFIG.USE_REAL_API) {
      console.log('📡 Saving user to API...');
      try {
        const response = await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: updatedUser.name,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            location: updatedUser.location,
            company: updatedUser.company,
            phone: updatedUser.phone,
            website: updatedUser.website,
          }),
        });
        
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          console.log('✅ User saved to API');
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
        }
      } catch (apiError) {
        console.error('❌ API Request failed:', apiError);
      }
    }
    
    // Save locally
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Update in users list
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    await saveUsers(updatedUsers);
    
    console.log('User saved successfully');
    return true;
  };

  const updateAnyUser = async (userId: string, updates: Partial<User>) => {
    console.log('=== UPDATE ANY USER ===');
    console.log('User ID:', userId);
    console.log('Updates:', Object.keys(updates));
    
    // Save to API
    if (API_CONFIG.USE_REAL_API) {
      console.log('📡 Saving user to API...');
      try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        
        if (response.ok) {
          console.log('✅ User saved to API');
        } else {
          console.error('❌ API Error:', response.status);
        }
      } catch (apiError) {
        console.error('❌ API Request failed:', apiError);
      }
    }
    
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
    // Delete from API
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/users/${userId}`, { method: 'DELETE' });
    }
    
    const updatedUsers = users.filter(u => u.id !== userId);
    await saveUsers(updatedUsers);
    return true;
  };

  const banUser = async (userId: string) => {
    // Ban via API
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/users/${userId}/ban`, { method: 'POST' });
    }
    return updateAnyUser(userId, { status: 'banned' });
  };

  const unbanUser = async (userId: string) => {
    // Unban via API
    if (API_CONFIG.USE_REAL_API) {
      await apiCall(`/users/${userId}/unban`, { method: 'POST' });
    }
    return updateAnyUser(userId, { status: 'active' });
  };

  const changeUserRole = async (userId: string, role: User['role']) => {
    return updateAnyUser(userId, { role });
  };

  const refreshUsers = async () => {
    if (API_CONFIG.USE_REAL_API) {
      const apiUsers = await apiCall<any[]>('/users');
      if (apiUsers && Array.isArray(apiUsers)) {
        const transformedUsers: User[] = apiUsers.map(u => ({
          id: String(u.id),
          email: u.email,
          name: u.name,
          role: u.role || 'user',
          level: u.level || 'beginner',
          reputation: u.reputation || 0,
          status: u.status || 'active',
          avatar: u.avatar,
          bio: u.bio,
          location: u.location,
          company: u.company,
          phone: u.phone,
          website: u.website,
          joinedDate: u.created_at || u.joinedDate,
          lastLogin: u.last_login || u.lastLogin,
        }));
        setUsers(transformedUsers);
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(transformedUsers));
      }
    }
  };

  return {
    user,
    users,
    authToken,
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
    refreshUsers,
  };
});
