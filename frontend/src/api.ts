const API_BASE = 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  specialization?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface Profile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  city?: string;
  country?: string;
  specialization?: string;
  verificationStatus?: string;
}

export interface DashboardData {
  profile: {
    fullName: string;
    email: string;
    role: string;
  };
  sessionHistory?: any[];
  productOrders?: any[];
  specialization?: string;
  verificationStatus?: string;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  }

  async getProfile(): Promise<Profile> {
    const response = await fetch(`${API_BASE}/user/profile`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }

  async getDashboard(): Promise<DashboardData> {
    const response = await fetch(`${API_BASE}/user/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  }
}

export const api = new ApiService();
