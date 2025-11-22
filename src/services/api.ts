import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
    bio?: string;
    profileImage?: string;
    createdAt: string;
  };
  token: string;
}

class ApiService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        ...data
      };
    }

    return data;
  }

  async signup(signupData: SignupData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(signupData),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async login(loginData: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(loginData),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }

  async updateProfile(profileData: {
    fullName?: string;
    bio?: string;
    profileImage?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(profileData),
    });

    return this.handleResponse(response);
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(passwordData),
    });

    return this.handleResponse(response);
  }

  // Auth helpers
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Course methods
  async getCourses(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/courses`);
    return this.handleResponse(response);
  }

  async getCourse(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    return this.handleResponse(response);
  }

  // Cart methods
  async getCart(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async addToCart(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ courseId }),
    });
    return this.handleResponse(response);
  }

  async removeFromCart(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${courseId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async clearCart(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Order methods
  async createRazorpayOrder(amount: number): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/create-razorpay-order`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ amount }),
    });
    return this.handleResponse(response);
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(paymentData),
    });
    return this.handleResponse(response);
  }

  async createOrder(orderData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(orderData),
    });
    return this.handleResponse(response);
  }

  async getOrders(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getOrder(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Enrollment methods
  async getEnrolledCourses(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/enrollments/my-courses`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async checkEnrollment(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/enrollments/check/${courseId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getCourseContent(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/enrollments/course/${courseId}/content`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();

