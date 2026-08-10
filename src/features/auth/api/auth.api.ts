import type { LoginCredentials, AuthResponse } from '../types/auth.types';

// This is a dummy implementation for now
// Later, this will call the real API: POST /auth/login
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Dummy authentication - accept any valid email/password
  // This will be replaced with real API call
  if (credentials.email && credentials.password) {
    return {
      user: {
        id: '1',
        email: credentials.email,
        name: 'Admin User',
        role: 'admin',
      },
      accessToken: 'dummy-access-token',
      refreshToken: 'dummy-refresh-token',
    };
  }

  throw new Error('Invalid credentials');
};

export const logoutApi = async (): Promise<void> => {
  // This will call the real API: POST /auth/logout
  await new Promise((resolve) => setTimeout(resolve, 500));
};
