import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const API_BASE = 'http://localhost:8080/api'

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN'
  specialization?: string
  city?: string
  country?: string
}
export interface AuthResponse {
  accessToken: string;
  role: string;
  name: string;
  emailVerified: boolean;
}
export interface Profile {
  id: number
  name: string
  email: string
  password?: string
  role: string
  city?: string
  country?: string
  specialization?: string
  verificationStatus?: string
  degreeFile?: string
  verified?: boolean
  emailVerified: boolean
  adminComment?: string
}

export interface Booking {
  id?: number
  userId: number
  practitionerId: number
  bookingDate?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  notes?: string
}

export interface Product {
  productId?: number
  name: string
  description: string
  price: number
  imageUrl?: string
  providerId: number
  createdAt?: string
}

export interface Order {
  orderId?: number
  userId: number
  productId: number
  quantity: number
  totalPrice: number
  status?: string
  deliveryStatus?: string
  orderDate?: string
  product?: Product
}

const apiClient = axios.create({ baseURL: API_BASE, withCredentials: true })

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const publicPaths = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/resend-otp', '/auth/forgot-password']
    const isPublic = publicPaths.some(path => config.url?.endsWith(path))

    if (!isPublic) {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const publicPaths = ['/auth/', '/degree/']
    const isPublic = publicPaths.some(path => error.config?.url?.includes(path))

    if (!isPublic && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('emailVerified', String(response.data.emailVerified))
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('emailVerified', String(response.data.emailVerified))
    return response.data
  },

  async getProfile(): Promise<Profile> {
    const response = await apiClient.get('/user/profile')
    return response.data
  },

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const response = await apiClient.put('/user/profile', data)
    return response.data
  },

  async uploadDegree(file: File, userId: number) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId.toString())
    const response = await apiClient.post('/degree/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  async getAllUsers(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/all-users')
    return response.data
  },

  async approvePractitioner(id: number) { await apiClient.put(`/admin/approve/${id}`) },
  async rejectPractitioner(id: number) { await apiClient.put(`/admin/reject/${id}`) },

  // Bookings
  async createBooking(data: Booking): Promise<Booking> {
    const response = await apiClient.post('/bookings', data)
    return response.data
  },

  async getUserBookings(userId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/user/${userId}`)
    return response.data
  },

  async getPractitionerBookings(practitionerId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/practitioner/${practitionerId}`)
    return response.data
  },

  async getAllPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  async getApprovedPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/admin/users?status=APPROVED')
    return response.data
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products')
    return response.data
  },

  async getProviderProducts(providerId: number): Promise<Product[]> {
    const response = await apiClient.get(`/products/provider/${providerId}`)
    return response.data
  },

  async createProduct(data: FormData): Promise<Product> {
    const response = await apiClient.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async updateProduct(id: number, data: FormData): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteProduct(id: number, providerId: number) {
    await apiClient.delete(`/products/${id}?providerId=${providerId}`)
  },

  // Orders
  async createOrder(data: Order): Promise<Order> {
    const response = await apiClient.post('/orders', data)
    return response.data
  },

  async getUserOrders(userId: number): Promise<Order[]> {
    const response = await apiClient.get(`/orders/user/${userId}`)
    return response.data
  },

  async getProviderOrders(providerId: number): Promise<Order[]> {
    const response = await apiClient.get(`/orders/provider/${providerId}`)
    return response.data
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.get(`/auth/verify?token=${token}`)
    return response.data
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/verify-otp', { email, otp })
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('userRole', response.data.role)
    localStorage.setItem('emailVerified', String(response.data.emailVerified))
    return response.data
  },

  async resendOtp(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/resend-otp', { email })
    return response.data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  }
}
