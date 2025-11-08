import React, { createContext, useContext, useState, useEffect } from 'react';
import { authMeMeGet } from '@/hooks/useApis';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user info when authenticated - completely disabled to prevent automatic calls
  const { data: userInfo, refetch: refetchUserInfo } = authMeMeGet({
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  useEffect(() => {
    // Check if user is already logged in - use localStorage for persistence
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('Token found in localStorage, validating token...');
      // Validate token format first
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          console.log('Token format is valid, fetching user info...');
          fetchUserInfo();
        } else {
          console.log('Invalid token format, clearing token');
          localStorage.removeItem('accessToken');
          setIsLoading(false);
        }
      } catch (error) {
        console.log('Error validating token format, clearing token');
        localStorage.removeItem('accessToken');
        setIsLoading(false);
      }
    } else {
      console.log('No token found, user not authenticated');
      setIsLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found, skipping user info fetch');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('Fetching user info with token:', token.substring(0, 10) + '...');
      const result = await refetchUserInfo();
      if (result.data) {
        console.log('User info fetched successfully:', result.data);
        setUser({
          id: result.data.id?.toString() || '1',
          email: result.data.email || '',
          name: result.data.name || ''
        });
      } else {
        console.log('No user data received, clearing token');
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      console.error('Error details:', error.response?.status, error.response);
      
      // Only clear token if it's a 401 (unauthorized) error
      if (error.response?.status === 401) {
        console.log('Token is invalid (401), clearing token');
        localStorage.removeItem('accessToken');
        setUser(null);
      } else {
        console.log('Non-auth error, keeping token but setting user to null');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    localStorage.setItem('accessToken', token);
    // Fetch user info after login
    await fetchUserInfo();
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('accessToken');
    setUser(null);
    console.log('User logged out, token cleared');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
