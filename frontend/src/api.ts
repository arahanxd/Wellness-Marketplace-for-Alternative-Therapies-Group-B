import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_BASE = 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  specialization?: string;
  city?: string;
  country?: string;
}

export interface AuthResponse {
  accessToken: string;
  role: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  city?: string;
  country?: string;
  specialization?: string;
  verificationStatus?: string;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

export const api = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async uploadDegree(file: File, userId: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    const response = await apiClient.post('/user/uploadDegree', formData);
    return response.data;
  },
};
