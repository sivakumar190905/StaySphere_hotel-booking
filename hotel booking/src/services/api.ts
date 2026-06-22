const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

let jwtToken: string | null = localStorage.getItem('staysphere_jwt_token');

export const setToken = (token: string | null) => {
  jwtToken = token;
  if (token) {
    localStorage.setItem('staysphere_jwt_token', token);
  } else {
    localStorage.removeItem('staysphere_jwt_token');
  }
};

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Fallback if response is not JSON
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      }).then(handleResponse);

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('staysphere_refresh_token', data.refreshToken);
      }
      return data;
    },
    
    register: async (userData: any) => {
      return fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse);
    },
    
    refresh: async () => {
      const refreshToken = localStorage.getItem('staysphere_refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const data = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).then(handleResponse);

      if (data.accessToken) {
        setToken(data.accessToken);
      }
      return data;
    },
    
    logout: async () => {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: getHeaders(),
        });
      } catch (e) {
        // Ignore logout errors
      }
      setToken(null);
      localStorage.removeItem('staysphere_refresh_token');
    },

    me: async () => {
      return fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    forgotPassword: async (email: string) => {
      return fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(handleResponse);
    },

    resetPassword: async (token: string, newPassword?: string) => {
      return fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      }).then(handleResponse);
    },

    verifyEmail: async (email: string, token: string) => {
      return fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      }).then(handleResponse);
    },

    sendVerification: async (email: string) => {
      return fetch(`${API_BASE_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(handleResponse);
    },
    
    registerPartner: async (partnerData: any) => {
      return fetch(`${API_BASE_URL}/api/auth/partner/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(partnerData),
      }).then(handleResponse);
    }
  },

  hotels: {
    getAll: async (filters: { city?: string; stars?: number; minPrice?: number; maxPrice?: number; search?: string } = {}) => {
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.stars) queryParams.append('stars', String(filters.stars));
      if (filters.minPrice) queryParams.append('minPrice', String(filters.minPrice));
      if (filters.maxPrice) queryParams.append('maxPrice', String(filters.maxPrice));
      if (filters.search) queryParams.append('search', filters.search);

      return fetch(`${API_BASE_URL}/api/hotels?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getFeatured: async () => {
      return fetch(`${API_BASE_URL}/api/hotels/featured`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getPartner: async () => {
      return fetch(`${API_BASE_URL}/api/hotels/partner`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getFavorites: async () => {
      return fetch(`${API_BASE_URL}/api/hotels/favorites`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    toggleFavorite: async (hotelId: string) => {
      return fetch(`${API_BASE_URL}/api/hotels/${hotelId}/favorite`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getById: async (id: string) => {
      return fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    create: async (hotelData: any) => {
      return fetch(`${API_BASE_URL}/api/hotels`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(hotelData),
      }).then(handleResponse);
    },

    update: async (id: string, hotelData: any) => {
      return fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(hotelData),
      }).then(handleResponse);
    },

    delete: async (id: string) => {
      return fetch(`${API_BASE_URL}/api/hotels/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    approve: async (id: string) => {
      return fetch(`${API_BASE_URL}/api/hotels/${id}/approve`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    }
  },

  bookings: {
    create: async (bookingData: any) => {
      return fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingData),
      }).then(handleResponse);
    },

    getMy: async () => {
      return fetch(`${API_BASE_URL}/api/bookings/my`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getPartner: async () => {
      return fetch(`${API_BASE_URL}/api/bookings/partner`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getAll: async () => {
      return fetch(`${API_BASE_URL}/api/bookings/all`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    cancel: async (id: string) => {
      return fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    updateStatus: async (id: string, status: string, roomNumber?: string) => {
      const queryParams = new URLSearchParams();
      queryParams.append('status', status);
      if (roomNumber) queryParams.append('roomNumber', roomNumber);

      return fetch(`${API_BASE_URL}/api/bookings/${id}/status?${queryParams.toString()}`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    update: async (id: string, bookingData: any) => {
      return fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(bookingData),
      }).then(handleResponse);
    },

    getById: async (id: string) => {
      return fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    }
  },

  notifications: {
    getAll: async () => {
      return fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },

    markRead: async () => {
      return fetch(`${API_BASE_URL}/api/notifications/read`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse);
    }
  },

  stats: {
    get: async () => {
      return fetch(`${API_BASE_URL}/api/public/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then(handleResponse);
    }
  },
  business: {
    createGuestRequest: async (bookingId: string, requestType: string, details: string) => {
      return fetch(`${API_BASE_URL}/api/business/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookingId, requestType, details }),
      }).then(handleResponse);
    },
    getGuestRequests: async () => {
      return fetch(`${API_BASE_URL}/api/business/requests`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    updateRequestStatus: async (id: number, status: string) => {
      const params = new URLSearchParams();
      params.append('status', status);
      return fetch(`${API_BASE_URL}/api/business/requests/${id}/status?${params.toString()}`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    createSupportTicket: async (subject: string, description: string, priority?: string) => {
      return fetch(`${API_BASE_URL}/api/business/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ subject, description, priority: priority || 'MEDIUM' }),
      }).then(handleResponse);
    },
    getSupportTickets: async () => {
      return fetch(`${API_BASE_URL}/api/business/tickets`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    updateTicketStatus: async (id: number, status: string) => {
      const params = new URLSearchParams();
      params.append('status', status);
      return fetch(`${API_BASE_URL}/api/business/tickets/${id}/status?${params.toString()}`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    }
  },
  operations: {
    getRooms: async () => {
      return fetch(`${API_BASE_URL}/api/operations/rooms`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    getHousekeeping: async () => {
      return fetch(`${API_BASE_URL}/api/operations/housekeeping`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    resolveHousekeeping: async (roomNumberId: number) => {
      const params = new URLSearchParams();
      params.append('roomNumberId', String(roomNumberId));
      return fetch(`${API_BASE_URL}/api/operations/housekeeping/resolve?${params.toString()}`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    createMaintenanceTicket: async (roomNumberId: number, description: string) => {
      return fetch(`${API_BASE_URL}/api/operations/maintenance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ roomNumberId, description }),
      }).then(handleResponse);
    },
    resolveMaintenance: async (ticketId: number) => {
      return fetch(`${API_BASE_URL}/api/operations/maintenance/resolve/${ticketId}`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    getMaintenanceTickets: async () => {
      return fetch(`${API_BASE_URL}/api/operations/maintenance`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    }
  },
  admin: {
    getUsers: async () => {
      return fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    createStaff: async (staffData: any) => {
      return fetch(`${API_BASE_URL}/api/admin/users/staff`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(staffData),
      }).then(handleResponse);
    },
    deleteUser: async (id: number) => {
      return fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    getPartnerRequests: async () => {
      return fetch(`${API_BASE_URL}/api/admin/partner-requests`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    approvePartnerRequest: async (id: number) => {
      return fetch(`${API_BASE_URL}/api/admin/partner-requests/${id}/approve`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    },
    rejectPartnerRequest: async (id: number) => {
      return fetch(`${API_BASE_URL}/api/admin/partner-requests/${id}/reject`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse);
    }
  }
};
