import type { ApiError } from '../types/api';

export function handleApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: { data: ApiError } }).response?.data;
    if (response) {
      return response;
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred',
  };
}
