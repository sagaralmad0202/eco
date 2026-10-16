import { API_BASE_URL, authStorage } from './auth-api';

export interface ApiErrorResponse {
  message: string;
  status?: number;
  fieldErrors?: Array<{ path?: string[]; message: string }>;
  raw?: any;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = authStorage.getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = options.method || 'GET';
  console.log(`📡 [NETWORK REQ] ${method} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  console.log(`✅ [NETWORK RES] ${response.status} ${method} ${url}`);

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred. Please try again.';
    let fieldErrors: any = null;

    if (data && typeof data === 'object') {
      if (data.message) {
        message = data.message;
      }
      const validationDetails = Array.isArray(data.details)
        ? data.details
        : data.errors;
      if (Array.isArray(validationDetails)) {
        fieldErrors = validationDetails;
      }
    } else if (typeof data === 'string' && data) {
      message = data;
    }

    const error: any = new Error(message);
    error.status = response.status;
    error.data = data;
    error.fieldErrors = fieldErrors;
    throw error;
  }

  return data as T;
}

export default apiRequest;
