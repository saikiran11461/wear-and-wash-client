import React, { createContext, useState, useEffect } from 'react';
import { addData } from '../../Storage/addData';
import { removeItem } from '../../Storage/removeItem';
import { getData } from '../../Storage/getData';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getData('token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      await addData('userLocation', userData.location);
      await addData('userId', userData.id);
      await addData('email', userData.email);
      await addData('phone', userData.phone);
      await addData('name', userData.name);
      await addData('token', userData.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.log('Error during login:', error);
    }
  };

  const logout = async (navigation) => {
    try {
      await removeItem('token');
      setIsAuthenticated(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};