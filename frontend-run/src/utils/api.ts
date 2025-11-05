const API_BASE = import.meta.env.VITE_API_BASE || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('idToken');
  if (!token) {
    throw new ApiError(401, 'No hay token de autenticación');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const apiGet = async (path: string) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('idToken');
      window.location.href = '/login';
      throw new ApiError(401, 'Sesión expirada');
    }

    if (!response.ok) {
      throw new ApiError(response.status, `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error de red');
  }
};

export const apiPostForm = async (path: string, formData: FormData) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('idToken');
      window.location.href = '/login';
      throw new ApiError(401, 'Sesión expirada');
    }

    if (!response.ok) {
      throw new ApiError(response.status, `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error de red');
  }
};

export const apiPost = async (path: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      localStorage.removeItem('idToken');
      window.location.href = '/login';
      throw new ApiError(401, 'Sesión expirada');
    }

    if (!response.ok) {
      throw new ApiError(response.status, `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error de red');
  }
};

export const apiPatch = async (path: string, data: any) => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      localStorage.removeItem('idToken');
      window.location.href = '/login';
      throw new ApiError(401, 'Sesión expirada');
    }

    if (!response.ok) {
      throw new ApiError(response.status, `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error de red');
  }
};