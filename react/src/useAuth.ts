import { useState, useCallback } from 'react';
import { useAIChat } from './context';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@aichat/sdk';

export function useAuth() {
  const { client, user, isAuthenticated, isLoading: contextLoading } = useAIChat();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await client.auth.login(credentials);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const register = useCallback(async (data: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await client.auth.register(data);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await client.auth.logout();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  return {
    user,
    isAuthenticated,
    isLoading: contextLoading || isLoading,
    error,
    login,
    register,
    logout,
  };
}
