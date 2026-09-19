import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { admissionLoginApi } from '../api/admission.auth.api';
import { setAdmissionSession } from '../utils/ssoSession';
import { getApiErrorMessage } from '../utils/errors';
import type { AdmissionLoginCredentials } from '../types/admission.types';

export function useAdmissionLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: AdmissionLoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await admissionLoginApi(credentials);
      setAdmissionSession(response.admission_token, response.user);

      navigate(response.redirect || '/admission/permissions');
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
