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
  address?: string
  phoneNumber?: string
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
  address?: string
  phoneNumber?: string
  specialization?: string
  verificationStatus?: string
  degreeFile?: string
  verified?: boolean
  emailVerified: boolean
  adminComment?: string
  sessionFee?: number
  profileImage?: string
  savedCardNumber?: string
  savedCardExpiry?: string
  savedCardHolder?: string
}

export interface UserDTO {
  id: number;
  fullName: string;
  specialization: string;
  profileImage: string;
  sessionFee?: number;
}

export interface Booking {
  id: number
  clientId: number
  clientName?: string
  clientEmail?: string
  providerId: number
  providerName?: string
  providerSpecialization?: string
  providerProfileImage?: string
  sessionDate: string
  startTime: string
  endTime: string
  duration: number
  description: string
  status: 'PENDING' | 'ACCEPTED' | 'CONFIRMED' | 'RESCHEDULE_REQUESTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'PENDING_COMPLETION_ACTION' | 'NOT_COMPLETED'
  providerMessage?: string
  sessionFee?: number
  reminderSent?: boolean
  refunded?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BookingRequest {
  providerId: number
  sessionDate: string
  startTime: string
  endTime: string
  duration: number
  description: string
}

export interface Product {
  productId?: number
  name: string
  description: string
  price: number
  imageUrl?: string
  providerId: number
  providerName?: string
  createdAt?: string
  additionalImages?: { imageId: number; imageUrl: string }[]
  discountPercentage?: number
  averageRating?: number
  reviewCount?: number
  questionCount?: number
}

export interface ProductStats {
  averageRating: number
  reviewCount: number
  purchasedCount: number
}

export interface ProductReview {
  reviewId?: number
  productId: number
  userId: number
  userName?: string
  rating: number
  title: string
  description: string
  createdAt?: string
  helpfulVotes?: number
  hasUpvoted?: boolean
}

export interface ProductAnswer {
  answerId?: number
  questionId: number
  userId: number
  userName?: string
  userRole?: string
  content: string
  createdAt?: string
}

export interface ProductQuestion {
  questionId?: number
  productId: number
  userId: number
  userName?: string
  content: string
  createdAt?: string
  answers?: ProductAnswer[]
}

export interface ForumQuestion {
  questionId?: number
  userId: number
  userName?: string
  title: string
  content: string
  upvotes?: number;
  hasUpvoted?: boolean;
  productId?: number
  name?: string
  createdAt?: string
  answerCount?: number
  answers?: ForumAnswer[]
}

export interface ForumAnswer {
  answerId?: number
  questionId: number
  userId: number
  userName?: string
  content: string
  upvotes?: number;
  hasUpvoted?: boolean;
  isAccepted?: boolean;
  createdAt?: string
  comments?: ForumComment[]
}

export interface ForumComment {
  commentId?: number
  answerId: number
  userId: number
  userName?: string
  content: string
  createdAt?: string
}

export interface ReportDTO {
  reportId?: number
  reporterId: number
  reporterName?: string
  reportedEntityId: number
  entityType: string
  reportedContent?: string
  reason: string
  comment?: string
  status?: string
  resolutionAction?: string
  createdAt?: string
}

export interface CartItem {
  id: number
  productId: number
  name: string
  imageUrl: string
  price: number
  quantity: number
  subtotal: number
  discountPercentage?: number;
}

export interface WishlistItem {
  id: number
  productId: number
  name: string
  imageUrl: string
  price: number
  addedAt: string
}

export interface Wishlist {
  wishlistId: number
  name: string
  userId: number
  createdAt: string
  items: WishlistItem[]
}

export interface OrderRequest {
  productId: number;
  quantity: number;
  totalPrice: number;
  shippingName?: string;
  shippingAddress?: string;
  shippingPhone?: string;
}

export interface Order {
  orderId: number
  productId: number
  name: string
  productImage: string
  price: number
  quantity: number
  totalAmount: number
  orderDate: string
  deliveryDate: string
  deliveryStatus: string
  status: string
  commonOrderId?: string
}

export interface PractitionerStats {
  totalOrders: number;
  totalProductsSold: number;
  totalRevenue: number;
  sessionRevenueMonthly?: number;
  monthlyRevenue: Record<string, number>;
}

// SessionBooking interface removed in favor of unified Booking interface

export interface AvailabilitySlot {
  id: number
  providerId: number
  providerName?: string
  availableDate: string
  startTime: string
  endTime: string
  isBlocked: boolean
  dateStatus?: string
}

export interface WeeklyAvailability {
  id: number
  providerId: number
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  enabled: boolean
}

export interface Notification {
  id: number
  type: 'BOOKING_REQUEST' | 'SESSION_CONFIRMED' | 'SESSION_REJECTED' | 'SESSION_RESCHEDULE_SUGGESTED' | 'SESSION_REMINDER' | 'SESSION_CANCELLED' | 'SESSION_COMPLETED' | 'SESSION_NOT_COMPLETED'
  message: string
  read: boolean
  relatedBookingId?: number
  createdAt: string
}

export interface PractitionerAnalytics {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  allTimeRevenue: number;

  dailyGrowthPercent: number;
  weeklyGrowthPercent: number;
  monthlyGrowthPercent: number;
  yearlyGrowthPercent: number;

  sessionRevenueDaily: number;
  productRevenueDaily: number;
  sessionRevenueMonthly: number;
  productRevenueMonthly: number;
  sessionRevenueAllTime: number;
  productRevenueAllTime: number;

  totalSessionRevenue: number;
  totalProductRevenue: number;
  accumulatedRevenue: number;
}

export interface PatientAnalytics {
  sessionsAttended: number;
  totalSessionSpent: number;
  totalProductSpent: number;
  totalSpent: number;

  monthlySpent: number;
  yearlySpent: number;

  recentSessions: Booking[];
  recentOrders: Order[];
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
  async rejectPractitioner(id: number, comment?: string) {
    await apiClient.put(`/admin/reject/${id}`, { comment: comment || '' })
  },
  async requestReupload(id: number, comment?: string) {
    await apiClient.put(`/admin/request-reupload/${id}`, { comment: comment || '' })
  },
  async getApprovedPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/user/practitioners')
    return response.data
  },
  async getAllPractitioners(): Promise<Profile[]> {
    const response = await apiClient.get('/user/all-practitioners')
    return response.data
  },

  // Bookings
  async bookSession(data: BookingRequest): Promise<Booking> {
    const response = await apiClient.post('/bookings/book', data)
    return response.data
  },

  async getUserBookings(clientId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/client/${clientId}`)
    return response.data
  },

  async getPractitionerBookings(providerId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/provider/${providerId}`)
    return response.data
  },

  async acceptBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/accept`)
    return response.data
  },

  async rejectBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/reject`)
    return response.data
  },

  async rescheduleBooking(id: number, data: { newSessionDate?: string, newStartTime?: string, newEndTime?: string, providerMessage: string }): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/reschedule`, data)
    return response.data
  },

  async confirmReschedule(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/confirm-reschedule`)
    return response.data
  },

  async completeBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/complete`)
    return response.data
  },

  async notCompleteBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/not-complete`)
    return response.data
  },

  async cancelBooking(id: number): Promise<Booking> {
    const response = await apiClient.put(`/bookings/${id}/cancel`)
    return response.data
  },



  // Products
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products')
    return response.data
  },

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`)
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

  async deleteProductImage(imageId: number, providerId: number) {
    await apiClient.delete(`/products/images/${imageId}?providerId=${providerId}`)
  },

  async uploadAdditionalImages(productId: number, files: File[]): Promise<Product> {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const response = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // batch create orders then clear cart – used by payment simulation checkout
  async createOrderBatch(items: OrderRequest[]): Promise<Order[]> {
    const results = await Promise.all(items.map(item => apiClient.post('/orders', item)))
    return results.map(r => r.data)
  },

  // Product stats for practitioner dashboard
  async getProductStats(productId: number): Promise<ProductStats> {
    const response = await apiClient.get(`/products/stats/${productId}`)
    return response.data
  },

  // Orders
  async createOrder(data: OrderRequest): Promise<Order> {
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

  async getPractitionerStats(providerId: number): Promise<PractitionerStats> {
    const response = await apiClient.get(`/orders/practitioner/${providerId}/stats`)
    return response.data
  },

  // Sessions methods moved to unified bookings

  // Availability Management
  async getProviderAvailability(providerId: number): Promise<AvailabilitySlot[]> {
    const response = await apiClient.get(`/availability/${providerId}`)
    return response.data
  },

  async addAvailabilitySlot(data: { availableDate: string; startTime: string; endTime: string }): Promise<AvailabilitySlot> {
    const response = await apiClient.post('/availability', data)
    return response.data
  },

  async deleteAvailabilitySlot(slotId: number): Promise<void> {
    await apiClient.delete(`/availability/${slotId}`)
  },

  // Weekly Availability
  async getWeeklyAvailability(providerId: number): Promise<WeeklyAvailability[]> {
    const response = await apiClient.get(`/availability/weekly/${providerId}`)
    return response.data
  },

  async addWeeklyAvailabilitySlot(data: { dayOfWeek: string; startTime: string; endTime: string }): Promise<WeeklyAvailability> {
    const response = await apiClient.post('/availability/weekly', data)
    return response.data
  },

  async deleteWeeklyAvailabilitySlot(slotId: number): Promise<void> {
    await apiClient.delete(`/availability/weekly/${slotId}`)
  },

  // Calendar sessions (all statuses — used exclusively by the calendar view)
  async getProviderCalendarSessions(providerId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/provider/${providerId}`)
    return response.data
  },

  async getClientCalendarSessions(clientId: number): Promise<Booking[]> {
    const response = await apiClient.get(`/bookings/client/${clientId}`)
    return response.data
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications')
    return response.data
  },

  async markNotificationRead(id: number): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`)
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
  },

  // Analytics
  async getPractitionerAnalytics(id: number): Promise<PractitionerAnalytics> {
    const response = await apiClient.get(`/analytics/practitioner/${id}`)
    return response.data
  },

  async getPatientAnalytics(id: number): Promise<PatientAnalytics> {
    const response = await apiClient.get(`/analytics/patient/${id}`)
    return response.data
  },

  // Reviews
  async getReviews(productId: number): Promise<ProductReview[]> {
    const response = await apiClient.get(`/reviews/product/${productId}`)
    return response.data
  },
  async addReview(data: ProductReview): Promise<ProductReview> {
    const response = await apiClient.post('/reviews', data)
    return response.data
  },
  async upvoteReview(reviewId: number, userId: number): Promise<void> {
    await apiClient.put(`/reviews/${reviewId}/upvote?userId=${userId}`)
  },

  // QnA
  async getQuestions(productId: number): Promise<ProductQuestion[]> {
    const response = await apiClient.get(`/qna/product/${productId}`)
    return response.data
  },
  async askQuestion(data: { productId: number; userId: number; content: string }): Promise<ProductQuestion> {
    const response = await apiClient.post('/qna/questions', data)
    return response.data
  },
  async postAnswer(data: { questionId: number; userId: number; content: string }): Promise<ProductAnswer> {
    const response = await apiClient.post('/qna/answers', data)
    return response.data
  },
  async reportContent(data: { reportedEntityId: number; reporterId?: number; reason: string; comment?: string; entityType: string }): Promise<void> {
    await apiClient.post('/reports', data)
  },

  // Cart (Flat API - User context)
  async getCart(): Promise<CartItem[]> {
    const response = await apiClient.get('/cart')
    return response.data
  },
  async addToCart(productId: number, quantity: number): Promise<CartItem> {
    const response = await apiClient.post(`/cart/add?productId=${productId}&quantity=${quantity}`)
    return response.data
  },
  async updateCartQuantity(productId: number, quantity: number): Promise<CartItem> {
    const response = await apiClient.put(`/cart/update?productId=${productId}&quantity=${quantity}`)
    return response.data
  },
  async removeFromCart(productId: number): Promise<void> {
    await apiClient.delete(`/cart/remove/${productId}`)
  },
  async clearCart(): Promise<void> {
    await apiClient.delete('/cart/clear')
  },

  // Legacy Cart (Kept for compatibility)
  async getCartLegacy(userId: number): Promise<CartItem[]> {
    const response = await apiClient.get(`/cart/user/${userId}`)
    return response.data
  },
  async addToCartLegacy(userId: number, productId: number, quantity: number): Promise<CartItem> {
    const response = await apiClient.post(`/cart/user/${userId}/add?productId=${productId}&quantity=${quantity}`)
    return response.data
  },
  async updateCartQuantityLegacy(userId: number, cartItemId: number, quantity: number): Promise<CartItem> {
    const response = await apiClient.put(`/cart/user/${userId}/update/${cartItemId}?quantity=${quantity}`)
    return response.data
  },
  async removeFromCartLegacy(userId: number, cartItemId: number): Promise<void> {
    await apiClient.delete(`/cart/user/${userId}/remove/${cartItemId}`)
  },
  async clearCartLegacy(userId: number): Promise<void> {
    await apiClient.delete(`/cart/user/${userId}/clear`)
  },

  // Wishlists (Flat API - User context)
  async getWishlists(): Promise<Wishlist[]> {
    const response = await apiClient.get('/wishlists')
    return response.data
  },
  async createWishlist(name: string): Promise<Wishlist> {
    const res = await apiClient.post(`/wishlists?name=${encodeURIComponent(name)}`)
    return res.data
  },
  async deleteWishlist(wishlistId: number): Promise<void> {
    await apiClient.delete(`/wishlists/${wishlistId}`)
  },
  async renameWishlist(wishlistId: number, name: string): Promise<Wishlist> {
    const response = await apiClient.put(`/wishlists/${wishlistId}?name=${encodeURIComponent(name)}`)
    return response.data
  },
  async addItemToWishlist(wishlistId: number, productId: number): Promise<WishlistItem> {
    const response = await apiClient.post(`/wishlists/${wishlistId}/add?productId=${productId}`)
    return response.data
  },
  async removeItemFromWishlist(itemId: number): Promise<void> {
    await apiClient.delete(`/wishlists/item/${itemId}`)
  },

  // Legacy Wishlists (Kept for compatibility)
  async getWishlistsLegacy(userId: number): Promise<Wishlist[]> {
    const response = await apiClient.get(`/wishlists/user/${userId}`)
    return response.data
  },
  async createWishlistLegacy(userId: number, name: string): Promise<Wishlist> {
    const response = await apiClient.post(`/wishlists/user/${userId}?name=${encodeURIComponent(name)}`)
    return response.data
  },
  async deleteWishlistLegacy(userId: number, wishlistId: number): Promise<void> {
    await apiClient.delete(`/wishlists/user/${userId}/${wishlistId}`)
  },
  async addItemToWishlistLegacy(userId: number, wishlistId: number, productId: number): Promise<WishlistItem> {
    const response = await apiClient.post(`/wishlists/user/${userId}/${wishlistId}/add?productId=${productId}`)
    return response.data
  },
  async removeItemFromWishlistLegacy(userId: number, itemId: number): Promise<void> {
    await apiClient.delete(`/wishlists/user/${userId}/item/${itemId}`)
  },

  // Admin Reports
  async getAllReports(): Promise<ReportDTO[]> {
    const response = await apiClient.get('/admin/reports')
    return response.data
  },
  async resolveReport(reportId: number, action: string): Promise<void> {
    const response = await apiClient.post(`/admin/reports/${reportId}/resolve?action=${action}`)
    return response.data
  },

  // Community Forum
  async getForumQuestions(): Promise<ForumQuestion[]> {
    const response = await apiClient.get('/forum/questions')
    return response.data
  },
  async getForumQuestionById(id: number): Promise<ForumQuestion> {
    const response = await apiClient.get(`/forum/questions/${id}`)
    return response.data
  },
  async createForumQuestion(data: { userId: number; title: string; content: string; productId?: number }): Promise<ForumQuestion> {
    const response = await apiClient.post('/forum/questions', data)
    return response.data
  },
  async upvoteForumQuestion(id: number): Promise<ForumQuestion> {
    const response = await apiClient.put(`/forum/questions/${id}/upvote`)
    return response.data
  },
  async createForumAnswer(data: { questionId: number; userId: number; content: string }): Promise<ForumAnswer> {
    const response = await apiClient.post('/forum/answers', data)
    return response.data
  },
  async upvoteForumAnswer(id: number): Promise<ForumAnswer> {
    const response = await apiClient.put(`/forum/answers/${id}/upvote`)
    return response.data
  },
  async acceptForumAnswer(id: number): Promise<ForumAnswer> {
    const response = await apiClient.put(`/forum/answers/${id}/accept`)
    return response.data
  },
  async createForumComment(data: { answerId: number; userId: number; content: string }): Promise<ForumComment> {
    const response = await apiClient.post('/forum/comments', data)
    return response.data
  },

  async getUpcomingSessions(userId: number, role: 'CLIENT' | 'PROVIDER'): Promise<Booking[]> {
    const bookings = role === 'CLIENT' ? await this.getUserBookings(userId) : await this.getPractitionerBookings(userId);
    const now = new Date();
    return bookings.filter(b => {
      if (b.status !== 'CONFIRMED' && b.status !== 'ACCEPTED') return false;
      const sessionDate = new Date(`${b.sessionDate}T${b.startTime}`);
      const diff = sessionDate.getTime() - now.getTime();
      return diff > 0 && diff < 24 * 60 * 60 * 1000; // Within next 24 hours
    }).sort((a, b) => new Date(`${a.sessionDate}T${a.startTime}`).getTime() - new Date(`${b.sessionDate}T${b.startTime}`).getTime());
  }
}
