import toast from 'react-hot-toast';
import axios from 'axios';

interface DRFValidationError {
  [key: string]: string[] | string | undefined;
  non_field_errors?: string[];
}

export const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as DRFValidationError;

    const fieldErrors = Object.entries(data)
      .filter(([key, value]) => 
        Array.isArray(value) && 
        key !== 'non_field_errors' && 
        key !== 'error'
      )
      .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`);

    const generalError = typeof data.error === 'string' ? data.error : 
                         Array.isArray(data.error) ? data.error.join(', ') : 
                         Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : '';

    const message = fieldErrors.length > 0
      ? fieldErrors.join(' | ')
      : generalError || defaultMessage;

    toast.error(message);
    return message;
  }

  toast.error(defaultMessage);
  return defaultMessage;
};