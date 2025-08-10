import axios from 'axios';
import type { 
  RegisterUserRequest, 
  RegisterUserResponse, 
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  PasswordResetCompleteRequest,
  PasswordResetCompleteResponse,
  EmailVerificationResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  DashboardResponse,
  LocaleFormattingResponse,
  CreateUserRequest,
  CreateUserResponse,
  UsersListResponse,
  UsersListParams,
  RolesListResponse,
  EditUserRequest,
  EditUserResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangeUserStatusRequest,
  ChangeUserStatusResponse,
  BulkChangeStatusRequest,
  BulkChangeStatusResponse,
  UserProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UserSessionsResponse,
  TerminateSessionResponse,
  UserActivityResponse,
  AuditLogsResponse,
  AuditLogsParams,
  AuditExportRequest,
  AuditExportResponse,
  PermissionsListResponse,
  RolePermissionsResponse,
  UpdateRolePermissionsRequest,
  UpdateRolePermissionsResponse,
  PermissionCheckRequest,
  PermissionCheckResponse,
  PermissionAuditParams,
  PermissionAuditResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  CategoriesListResponse,
  CategoriesListParams,
  CategoryItemsCountResponse,
  DeleteCategoryResponse,
  CreateInventoryItemRequest,
  CreateInventoryItemResponse,
  UpdateInventoryItemRequest,
  UpdateInventoryItemResponse,
  UpdateSerializedItemRequest,
  UpdateSerializedItemResponse,
  UpdateNonSerializedItemQuantityRequest,
  UpdateNonSerializedItemQuantityResponse,
  ChangeInventoryItemStatusRequest,
  ChangeInventoryItemStatusResponse,
  InventoryListResponse,
  InventoryListParams,
  GetInventoryItemResponse,
  ValidateSerialNumberRequest,
  ValidateSerialNumberResponse,
  GenerateSerialNumberResponse,
  InventoryExportRequest,
  InventoryExportResponse,
  ApiError 
} from '@/types';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session management
});

// Debug: Log the base URL being used
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api');

// Request interceptor to add language header
apiClient.interceptors.request.use((config) => {
  const language = localStorage.getItem('i18nextLng') || 'fa';
  const acceptLanguage = language === 'fa' ? 'fa' : 'ar';
  config.headers['accept-language'] = acceptLanguage;
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Transform axios error to our ApiError format
    if (error.response?.data) {
      const apiError: ApiError = {
        code: error.response.data.code || 'errors.UNKNOWN_ERROR',
        message: error.response.data.message || 'An unexpected error occurred',
        errors: error.response.data.errors || [],
      };
      return Promise.reject(apiError);
    }
    
    // Network or other errors
    const networkError: ApiError = {
      code: 'errors.NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
    };
    return Promise.reject(networkError);
  }
);

export const authService = {
  /**
   * Register a new user according to ? API contract
   */
  register: async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
    const response = await apiClient.post<RegisterUserResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user according to ? API contract
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Logout user according to ? API contract
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>('/auth/logout');
    return response.data;
  },

  /**
   * Request password reset according to ? API contract
   */
  requestPasswordReset: async (data: PasswordResetRequest): Promise<PasswordResetRequestResponse> => {
    const response = await apiClient.post<PasswordResetRequestResponse>('/auth/password-reset-request', data);
    return response.data;
  },

  /**
   * Complete password reset according to ? API contract
   */
  completePasswordReset: async (data: PasswordResetCompleteRequest): Promise<PasswordResetCompleteResponse> => {
    const response = await apiClient.post<PasswordResetCompleteResponse>('/auth/password-reset-complete', data);
    return response.data;
  },

  /**
   * Verify email with token according to ?-ALT-2 API contract
   */
  verifyEmail: async (token: string, language?: string): Promise<EmailVerificationResponse> => {
    const params = new URLSearchParams({ token });
    if (language) {
      params.append('lang', language);
    }
    const response = await apiClient.get<EmailVerificationResponse>(`/auth/verify-email?${params.toString()}`);
    return response.data;
  },

  /**
   * Resend verification email according to ?-ALT-2 API contract
   */
  resendVerificationEmail: async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
    const response = await apiClient.post<ResendVerificationResponse>('/auth/resend-verification', data);
    return response.data;
  },
};

export const dashboardService = {
  /**
   * Get dashboard data according to ? API contract
   */
  getDashboardData: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/dashboard');
    return response.data;
  },
};

export const localeService = {
  /**
   * Get locale formatting configuration according to ? ? API contract
   */
  getFormattingConfig: async (): Promise<LocaleFormattingResponse> => {
    const response = await apiClient.get<LocaleFormattingResponse>('/locale/formatting');
    return response.data;
  },
};

export const userService = {
  /**
   * Create a new user according to ? API contract
   */
  createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/users', data);
    return response.data;
  },

  /**
   * Get list of users in the tenant according to ? API contract
   */
  getUsers: async (params: UsersListParams = {}): Promise<UsersListResponse> => {
    const searchParams = new URLSearchParams();
    
    // Add pagination parameters
    searchParams.append('page', params.page?.toString() || '1');
    searchParams.append('limit', params.limit?.toString() || '25');
    
    // Add filtering parameters
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.roleId) searchParams.append('roleId', params.roleId);
    if (params.lastLoginFrom) searchParams.append('lastLoginFrom', params.lastLoginFrom);
    if (params.lastLoginTo) searchParams.append('lastLoginTo', params.lastLoginTo);
    
    // Add sorting parameters
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    const response = await apiClient.get<UsersListResponse>(`/users?${searchParams.toString()}`);
    return response.data;
  },

  /**
   * Get available roles for user assignment according to ? API contract
   */
  getRoles: async (): Promise<RolesListResponse> => {
    const response = await apiClient.get<RolesListResponse>('/roles');
    return response.data;
  },

  /**
   * Edit user profile according to ? API contract
   */
  editUser: async (userId: string, data: EditUserRequest): Promise<EditUserResponse> => {
    const response = await apiClient.put<EditUserResponse>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Reset user password according to ? API contract
   */
  resetPassword: async (userId: string, data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(`/users/${userId}/reset-password`, data);
    return response.data;
  },

  /**
   * Change user account status according to ? API contract
   */
  changeStatus: async (userId: string, data: ChangeUserStatusRequest): Promise<ChangeUserStatusResponse> => {
    const response = await apiClient.patch<ChangeUserStatusResponse>(`/users/${userId}/status`, data);
    return response.data;
  },

  /**
   * Bulk change user account status according to ? API contract
   */
  bulkChangeStatus: async (data: BulkChangeStatusRequest): Promise<BulkChangeStatusResponse> => {
    const response = await apiClient.patch<BulkChangeStatusResponse>('/users/bulk-status', data);
    return response.data;
  },
};

// ? - Self-Service Profile Management API
export const profileService = {
  /**
   * Get current user profile according to ? API contract
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/profile');
    return response.data;
  },

  /**
   * Update current user profile according to ? API contract
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    console.log('API: Sending profile update request:', data); // Debug log
    const response = await apiClient.put<UpdateProfileResponse>('/users/profile', data);
    return response.data;
  },

  /**
   * Change current user password according to ? API contract
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>('/users/profile/change-password', data);
    return response.data;
  },

  /**
   * Get active sessions according to ? API contract
   */
  getSessions: async (): Promise<UserSessionsResponse> => {
    const response = await apiClient.get<UserSessionsResponse>('/users/profile/sessions');
    return response.data;
  },

  /**
   * Terminate session according to ? API contract
   */
  terminateSession: async (sessionId: string): Promise<TerminateSessionResponse> => {
    const response = await apiClient.delete<TerminateSessionResponse>(`/users/profile/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Get account activity according to ? API contract
   */
  getActivity: async (params?: { limit?: number; page?: number }): Promise<UserActivityResponse> => {
    const response = await apiClient.get<UserActivityResponse>('/users/profile/activity', { params });
    return response.data;
  },
};

/**
 * Audit service for ? - Audit Trail Management
 */
export const auditService = {
  /**
   * Get audit logs according to ? API contract
   */
  getLogs: async (params?: AuditLogsParams): Promise<AuditLogsResponse> => {
    const response = await apiClient.get<AuditLogsResponse>('/audit/logs', { params });
    return response.data;
  },

  /**
   * Export audit data according to ? API contract
   */
  exportLogs: async (data: AuditExportRequest): Promise<AuditExportResponse> => {
    const response = await apiClient.post<AuditExportResponse>('/audit/export', data);
    return response.data;
  },

  /**
   * Check export status (for async exports)
   * @param exportId The export ID to check status for
   */
  getExportStatus: async (exportId: string): Promise<AuditExportResponse> => {
    const response = await apiClient.get<AuditExportResponse>(`/audit/export/${exportId}/status`);
    return response.data;
  },

  /**
   * Download export file directly (alternative to downloadUrl)
   * @param exportId The export ID to download
   */
  downloadExport: async (exportId: string): Promise<Blob> => {
    const response = await apiClient.get(`/audit/export/${exportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

/**
 * Permission service for ? - Role-Based Permission Enforcement
 */
export const permissionService = {
  /**
   * List available system permissions according to ? API contract
   */
  getPermissions: async (): Promise<PermissionsListResponse> => {
    const response = await apiClient.get<PermissionsListResponse>('/permissions');
    return response.data;
  },

  /**
   * Get permissions assigned to specific role according to ? API contract
   */
  getRolePermissions: async (roleId: string): Promise<RolePermissionsResponse> => {
    const response = await apiClient.get<RolePermissionsResponse>(`/roles/${roleId}/permissions`);
    return response.data;
  },

  /**
   * Update permissions for specific role according to ? API contract
   */
  updateRolePermissions: async (roleId: string, data: UpdateRolePermissionsRequest): Promise<UpdateRolePermissionsResponse> => {
    const response = await apiClient.put<UpdateRolePermissionsResponse>(`/roles/${roleId}/permissions`, data);
    return response.data;
  },

  /**
   * Check if current user has specific permission according to ? API contract
   */
  checkPermission: async (data: PermissionCheckRequest): Promise<PermissionCheckResponse> => {
    const response = await apiClient.post<PermissionCheckResponse>('/permissions/check', data);
    return response.data;
  },

  /**
   * Get permission check audit logs according to ? API contract
   */
  getPermissionAudit: async (params?: PermissionAuditParams): Promise<PermissionAuditResponse> => {
    const response = await apiClient.get<PermissionAuditResponse>('/permissions/audit', { params });
    return response.data;
  },
};

// ?, ? & ? - Category Management API
export const categoriesService = {
  /**
   * Get all categories for current tenant according to ? API contract
   * Supports pagination and search functionality
   */
  getCategories: async (params?: CategoriesListParams): Promise<CategoriesListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      // Ensure limit doesn't exceed server maximum of 50
      const limit = Math.min(params.limit, 50);
      queryParams.append('limit', limit.toString());
    }
    if (params?.search && params.search.length >= 2) {
      queryParams.append('search', params.search);
    }

    const url = queryParams.toString() 
      ? `/categories?${queryParams.toString()}`
      : '/categories';
    
    const response = await apiClient.get<CategoriesListResponse>(url);
    return response.data;
  },

  /**
   * Create a new category according to ? API contract
   */
  createCategory: async (data: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
    const response = await apiClient.post<CreateCategoryResponse>('/categories', data);
    return response.data;
  },

  /**
   * Update an existing category according to ? API contract
   */
  updateCategory: async (categoryId: string, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> => {
    const response = await apiClient.put<UpdateCategoryResponse>(`/categories/${categoryId}`, data);
    return response.data;
  },

  /**
   * Get category items count for deletion validation according to ? API contract
   */
  getCategoryItemsCount: async (categoryId: string): Promise<CategoryItemsCountResponse> => {
    const response = await apiClient.get<CategoryItemsCountResponse>(`/categories/${categoryId}/items-count`);
    return response.data;
  },

  /**
   * Delete a category according to ? API contract
   */
  deleteCategory: async (categoryId: string): Promise<DeleteCategoryResponse> => {
    const response = await apiClient.delete<DeleteCategoryResponse>(`/categories/${categoryId}`);
    return response.data;
  },
};

// ?: Inventory Management Service
export const inventoryService = {
  /**
   * List inventory items according to ? API contract
   */
  getInventoryItems: async (params?: InventoryListParams): Promise<InventoryListResponse> => {
    const response = await apiClient.get<InventoryListResponse>('/inventory', { params });
    return response.data;
  },

  /**
   * Create inventory item according to ? & ? API contract
   */
  createInventoryItem: async (data: CreateInventoryItemRequest): Promise<CreateInventoryItemResponse> => {
    const response = await apiClient.post<CreateInventoryItemResponse>('/inventory', data);
    return response.data;
  },

  /**
   * Get inventory item details according to ? API contract
   */
  getInventoryItem: async (itemId: string): Promise<GetInventoryItemResponse> => {
    const response = await apiClient.get<GetInventoryItemResponse>(`/inventory/${itemId}`);
    return response.data;
  },

  /**
   * Validate serial number uniqueness according to ? API contract
   */
  validateSerialNumber: async (data: ValidateSerialNumberRequest): Promise<ValidateSerialNumberResponse> => {
    const response = await apiClient.post<ValidateSerialNumberResponse>('/inventory/serial-number/validate', data);
    return response.data;
  },

  /**
   * Generate serial number according to ? API contract
   */
  generateSerialNumber: async (): Promise<GenerateSerialNumberResponse> => {
    const response = await apiClient.post<GenerateSerialNumberResponse>('/inventory/serial-number/generate');
    return response.data;
  },

  /**
   * Export inventory items according to ? API contract
   */
  exportInventoryItems: async (data: InventoryExportRequest): Promise<InventoryExportResponse> => {
    const response = await apiClient.post<InventoryExportResponse>('/inventory/export', data);
    return response.data;
  },

  /**
   * Update inventory item according to ? API contract
   */
  updateInventoryItem: async (itemId: string, data: UpdateInventoryItemRequest): Promise<UpdateInventoryItemResponse> => {
    const response = await apiClient.put<UpdateInventoryItemResponse>(`/inventory/${itemId}`, data);
    return response.data;
  },

  /**
   * Update serialized item information according to ? API contract
   */
  updateSerializedItem: async (itemId: string, data: UpdateSerializedItemRequest): Promise<UpdateSerializedItemResponse> => {
    const response = await apiClient.put<UpdateSerializedItemResponse>(`/inventory/${itemId}/serialized`, data);
    return response.data;
  },

  /**
   * Update non-serialized item quantity according to ? API contract
   */
  updateNonSerializedItemQuantity: async (itemId: string, data: UpdateNonSerializedItemQuantityRequest): Promise<UpdateNonSerializedItemQuantityResponse> => {
    const response = await apiClient.put<UpdateNonSerializedItemQuantityResponse>(`/inventory/${itemId}/quantity`, data);
    return response.data;
  },

  /**
   * Change inventory item status according to ? API contract
   */
  changeInventoryItemStatus: async (itemId: string, data: ChangeInventoryItemStatusRequest): Promise<ChangeInventoryItemStatusResponse> => {
    const response = await apiClient.patch<ChangeInventoryItemStatusResponse>(`/inventory/${itemId}/status`, data);
    return response.data;
  },
};

export default apiClient;
