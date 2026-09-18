import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canteenLoginApi } from '../api/canteen.auth.api';
import { setCanteenSession } from '../utils/ssoSession';
import { getApiErrorMessage } from '../utils/errors';
import type { CanteenLoginCredentials } from '../types/canteen.types';

export function useCanteenLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: CanteenLoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await canteenLoginApi(credentials);
      setCanteenSession(response.canteen_token, response.user);

      navigate(response.redirect || '/canteen/orders');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}
