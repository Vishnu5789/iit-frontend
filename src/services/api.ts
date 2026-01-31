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
  public API_BASE_URL = API_BASE_URL;

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

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  async resetPassword(resetToken: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${resetToken}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ password }),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }

  async updateProfile(profileData: {
    name: string;
    phone?: string;
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

  // Home Config methods
  async getHomeConfig(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/home-config`);
    return this.handleResponse(response);
  }

  async updateHomeConfig(configData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/home-config`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(configData),
    });
    return this.handleResponse(response);
  }

  async updateHomeImage(imageType: string, imageData: { url: string; fileId: string }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/home-config/image/${imageType}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(imageData),
    });
    return this.handleResponse(response);
  }

  async updateHomeStats(statsData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/home-config/stats`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(statsData),
    });
    return this.handleResponse(response);
  }

  async updateHeroText(heroData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/home-config/hero-text`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(heroData),
    });
    return this.handleResponse(response);
  }

  async updateContentSection(sectionName: string, sectionData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/home-config/content/${sectionName}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(sectionData),
    });
    return this.handleResponse(response);
  }

  // User Management methods (Admin only)
  async getAllUsers(params?: { search?: string; role?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async enrollUser(userId: string, courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/enroll/${courseId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async unenrollUser(userId: string, courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/enroll/${courseId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getUserStats(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Contact methods
  async getContactConfig(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/config`);
    return this.handleResponse(response);
  }

  async updateContactConfig(configData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/config`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(configData),
    });
    return this.handleResponse(response);
  }

  async submitContactForm(formData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    return this.handleResponse(response);
  }

  async getContactMessages(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/contact/messages?${queryParams}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getContactMessage(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/messages/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateMessageStatus(id: string, statusData: { status: string; adminNotes?: string }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/messages/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(statusData),
    });
    return this.handleResponse(response);
  }

  async deleteContactMessage(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/messages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getContactStats(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/stats`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // About page methods
  async getAboutConfig(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about/config`);
    return this.handleResponse(response);
  }

  async updateAboutConfig(configData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about/config`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(configData),
    });
    return this.handleResponse(response);
  }

  // Industry page methods
  async getIndustryConfig(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/industry/config`);
    return this.handleResponse(response);
  }

  async updateIndustryConfig(configData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/industry/config`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(configData),
    });
    return this.handleResponse(response);
  }

  // Contact Widget methods
  async getContactWidget(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact-widget`);
    return this.handleResponse(response);
  }

  async updateContactWidget(configData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/contact-widget`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(configData),
    });
    return this.handleResponse(response);
  }

  // Instructor methods
  async getInstructors(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors`);
    return this.handleResponse(response);
  }

  async getInstructor(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`);
    return this.handleResponse(response);
  }

  async getAllInstructorsAdmin(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors/admin/all`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async createInstructor(instructorData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(instructorData),
    });
    return this.handleResponse(response);
  }

  async updateInstructor(id: string, instructorData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(instructorData),
    });
    return this.handleResponse(response);
  }

  async deleteInstructor(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async reorderInstructors(instructors: Array<{ id: string; order: number }>): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/instructors/admin/reorder`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ instructors }),
    });
    return this.handleResponse(response);
  }

  // Hero Slide methods
  async getHeroSlides(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides`);
    return this.handleResponse(response);
  }

  async getHeroSlide(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides/${id}`);
    return this.handleResponse(response);
  }

  async getAllHeroSlidesAdmin(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides/admin/all`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async createHeroSlide(slideData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(slideData),
    });
    return this.handleResponse(response);
  }

  async updateHeroSlide(id: string, slideData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(slideData),
    });
    return this.handleResponse(response);
  }

  async deleteHeroSlide(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async reorderHeroSlides(slides: Array<{ id: string; order: number }>): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/hero-slides/reorder`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ slides }),
    });
    return this.handleResponse(response);
  }

  // Quiz/Test methods
  async getCourseQuizzes(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/course/${courseId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getFreeQuizzes(courseId: string): Promise<ApiResponse> {
    // No auth required - public endpoint for free quizzes
    const response = await fetch(`${API_BASE_URL}/quizzes/course/${courseId}/free`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse(response);
  }

  async getAdminCourseQuizzes(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/admin/course/${courseId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getQuiz(quizId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async createQuiz(quizData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(quizData),
    });
    return this.handleResponse(response);
  }

  async updateQuiz(quizId: string, quizData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(quizData),
    });
    return this.handleResponse(response);
  }

  async deleteQuiz(quizId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async startQuiz(quizId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async submitQuiz(attemptId: string, answers: any[], timeSpent: number): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/attempt/${attemptId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ answers, timeSpent }),
    });
    return this.handleResponse(response);
  }

  async getUserAttempts(quizId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/attempts`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Admin self-enrollment
  async adminSelfEnroll(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/enrollments/admin-enroll/${courseId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Certificate methods
  async generateCertificate(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/certificates/generate/${courseId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getUserCertificates(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/certificates/my-certificates`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getCertificate(certificateId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async verifyCertificate(certificateNumber: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/certificates/verify/${certificateNumber}`);
    return this.handleResponse(response);
  }

  async downloadCertificate(certificateId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}/download`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // About Section methods
  async getAboutSections(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections`);
    return this.handleResponse(response);
  }

  async getAboutSectionsAdmin(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/admin/all`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getAboutSection(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/${id}`);
    return this.handleResponse(response);
  }

  async createAboutSection(sectionData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/admin`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(sectionData),
    });
    return this.handleResponse(response);
  }

  async updateAboutSection(id: string, sectionData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/admin/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(sectionData),
    });
    return this.handleResponse(response);
  }

  async deleteAboutSection(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/admin/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async reorderAboutSections(sections: Array<{ id: string; order: number }>): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/admin/reorder`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ sections }),
    });
    return this.handleResponse(response);
  }

  async initializeAboutSections(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/about-sections/admin/initialize`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Admission methods
  async submitAdmission(admissionData: {
    name: string;
    fatherName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    education: string;
    experience?: string;
    aadharCardNumber: string;
    courseApplied: string;
    contactNumber: string;
    email: string;
    nationality: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admissions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(admissionData),
    });
    return this.handleResponse(response);
  }

  // Webinar methods
  async submitWebinarRegistration(webinarData: {
    fullName: string;
    email: string;
    contactNumber: string;
    currentEducation: string;
    interestAreas: string[];
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(webinarData),
    });
    return this.handleResponse(response);
  }

  async getWebinarConfig(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar/config`);
    return this.handleResponse(response);
  }

  async updateWebinarConfig(configData: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar/config`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(configData),
    });
    return this.handleResponse(response);
  }

  // Admission admin methods
  async getAdmissions(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `${API_BASE_URL}/admissions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getAdmission(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admissions/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateAdmissionStatus(id: string, data: { status?: string; adminNotes?: string }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admissions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteAdmission(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/admissions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Get courses for dropdown (titles only)
  async getCoursesTitlesOnly(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/courses?titlesOnly=true`);
    return this.handleResponse(response);
  }

  // Webinar registration admin methods
  async getWebinarRegistrations(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `${API_BASE_URL}/webinar/registrations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getWebinarRegistration(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar/registrations/${id}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateWebinarStatus(id: string, data: { status?: string; adminNotes?: string }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar/registrations/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async resendWebinarEmail(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar/registrations/${id}/resend-email`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async deleteWebinarRegistration(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/webinar/registrations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Blog subscriber methods
  async subscribeToBlog(email: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/blog-subscribers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async getBlogSubscribers(params?: { isActive?: string; page?: number; limit?: number }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.isActive) queryParams.append('isActive', params.isActive);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `${API_BASE_URL}/blog-subscribers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getBlogSubscriberStats(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/blog-subscribers/stats`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async unsubscribeFromBlog(email: string, token?: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/blog-subscribers/unsubscribe`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, token }),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // Secure PDF Streaming Methods
  // ============================================

  /**
   * Get PDF metadata (total pages, dimensions, etc.)
   */
  async getPdfMetadata(pdfId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/secure-content/pdf/${pdfId}/metadata`, {
      method: 'GET',
      headers: this.getHeaders(true), // Auth required
    });
    return this.handleResponse(response);
  }

  /**
   * Get single PDF page as image blob
   * Returns raw image data for canvas rendering
   */
  async getPdfPage(pdfId: string, pageNumber: number): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}/secure-content/pdf/${pdfId}/page/${pageNumber}`,
      {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch page ${pageNumber}: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Log PDF access for audit trail (optional)
   */
  async logPdfAccess(pdfId: string, pageNumber: number, action: string = 'view'): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/secure-content/pdf/${pdfId}/log-access`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ pageNumber, action }),
    });
    return this.handleResponse(response);
  }

  // ============================================
  // Statistics & Analytics Methods
  // ============================================

  /**
   * Get statistics for a specific course
   */
  async getCourseStats(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/stats/course/${courseId}`, {
      method: 'GET',
      headers: this.getHeaders(true), // Auth required
    });
    return this.handleResponse(response);
  }

  /**
   * Get statistics for all courses
   */
  async getAllCoursesStats(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/stats/courses`, {
      method: 'GET',
      headers: this.getHeaders(true), // Auth required
    });
    return this.handleResponse(response);
  }

  /**
   * Get dashboard summary (admin)
   */
  async getDashboardSummary(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
      method: 'GET',
      headers: this.getHeaders(true), // Auth required
    });
    return this.handleResponse(response);
  }

  /**
   * Get public course statistics (no auth required)
   */
  async getCoursePublicStats(courseId: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/stats`, {
      method: 'GET',
      headers: this.getHeaders(false), // No auth required - public data
    });
    return this.handleResponse(response);
  }

  /**
   * Upload file to S3
   * @param formData - FormData containing file and folder
   */
  async uploadFile(formData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: headers, // Don't set Content-Type, let browser set it with boundary
      body: formData,
    });
    
    return this.handleResponse(response);
  }

  // ==================== RESOURCES ====================

  /**
   * Get all resources
   */
  async getResources(params?: any): Promise<ApiResponse> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}/resources${queryString}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  /**
   * Get single resource
   */
  async getResource(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'GET',
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  /**
   * Download/Access resource
   */
  async downloadResource(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/resources/${id}/download`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  /**
   * Create resource (Admin)
   */
  async createResource(data: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  /**
   * Update resource (Admin)
   */
  async updateResource(id: string, data: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  /**
   * Delete resource (Admin)
   */
  async deleteResource(id: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  /**
   * Get resource statistics (Admin)
   */
  async getResourceStats(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/resources/admin/stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  /**
   * Course Page Configuration
   */
  async getCoursePageConfig(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/course-page/config`);
    return this.handleResponse(response);
  }

  async updateCoursePageConfig(data: any): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/course-page/config`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();

