import axios from 'axios';

import {
  useAuthStore,
} from '../store/auth.store';

const api = axios.create({
  baseURL:
    'http://localhost:3000/api/v1',

  headers: {
    'Content-Type':
      'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState()
        .token;

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    // NETWORK ERROR
    if (
      !error.response
    ) {
      return Promise.reject(
        error,
      );
    }

    // REAL AUTH FAILURE
    if (
      error.response
        ?.status === 401
    ) {
      // ONLY logout if online
      if (
        navigator.onLine
      ) {
        await useAuthStore
          .getState()
          .logout();

        window.location.href =
          '/login';
      }
    }

    return Promise.reject(
      error,
    );
  },
);
export default api;