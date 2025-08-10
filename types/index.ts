// Language types
export type Language = 'fa' | 'ar';
export type TenantLanguage = 'persian' | 'arabic';
export type TenantLocale = 'iran' | 'uae';

// ? - Locale Formatting types
export interface LocaleFormattingResponse {
  code: string;
  message: string;
  data: {
    locale: TenantLocale;
    language: TenantLanguage;
    dateFormat: {
      calendar: 'persian' | 'gregorian';
      format: string;
      example: string;
    };
    numberFormat: {
      digits: 'persian' | 'arabic' | 'latin';
      decimal: string;
      thousands: string;
      example: string;
    };
    currencyFormat: {
      code: 'IRR' | 'AED';
      symbol: string;
      position: 'before' | 'after';
      example: string;
    };
  };
}

// Form data types following ? API contract
export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  language: TenantLanguage;
  locale: TenantLocale;
}

// API Response types
export interface RegisterUserResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    tenantId: string;
    email: string;
    redirectUrl: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

// Form field error type
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

// Language and locale options
export interface LanguageOption {
  value: TenantLanguage;
  label: string;
}

export interface LocaleOption {
  value: TenantLocale;
  label: string;
}

// Form state types
export interface FormState {
  isSubmitting: boolean;
  errors: FieldError[];
  generalError?: string;
}

// Password strength indicators
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

// ? Authentication interfaces (extended for ? - Role-Based Access)
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    tenantId: string;
    email: string;
    fullName: string;
    roleName: 'tenant_owner' | 'admin' | 'manager' | 'employee' | 'staff';
    permissions: string[];
    redirectUrl: string;
    sessionExpiresAt: string;
    sessionToken: string;
    rememberMeEnabled: boolean;
  };
}

export interface LogoutResponse {
  code: string;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetRequestResponse {
  code: string;
  message: string;
}

export interface PasswordResetCompleteRequest {
  token: string;
  password: string;
  confirmPassword: string;
  language?: string;
}

export interface PasswordResetCompleteResponse {
  code: string;
  message: string;
  data?: {
    redirectUrl?: string;
    language?: string;
  };
}

// ?-ALT-2 Email Verification interfaces
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    email: string;
    verifiedAt: string;
    redirectUrl: string;
    language?: string;
  };
}

export interface EmailVerificationErrorResponse {
  code: string;
  message: string;
  data: {
    canResend: boolean;
    waitTime: number;
    redirectUrl: string;
  };
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  code: string;
  message: string;
  data: {
    email: string;
    expiresAt: string;
  };
}

export interface ResendVerificationErrorResponse {
  code: string;
  message: string;
  data: {
    canResend: boolean;
    waitTime: number;
  };
}

// ? Dashboard interfaces
export interface DashboardResponse {
  code: string;
  message: string;
  data: {
    tenant: {
      id: string;
      companyName: string;
      registrationDate: string;
      userCount: number;
      status: 'active' | 'inactive';
    };
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
      lastLogin: string;
    };
    systemInfo: {
      version: string;
      lastUpdate: string;
      serviceStatus: 'operational' | 'maintenance';
    };
  };
}

// ? User Management interfaces
export type UserStatus = 'active' | 'inactive' | 'pending_verification' | 'suspended';
export type RoleName = 'tenant_owner' | 'admin' | 'manager' | 'employee' | 'staff';

export interface Role {
  id: string;
  name: RoleName;
  displayName: string;
  canAssign: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  roleId: string;
  status?: UserStatus;
  generatePassword?: boolean;
}

export interface CreateUserResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    fullName: string;
    email: string;
    status: UserStatus;
    roleId: string;
    roleName: string;
    welcomeEmailSent: boolean;
    generatedPassword?: string;
    createdAt: string;
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: UserStatus;
  roleId: string;
  roleName: string;
  createdAt: string;
  lastLoginAt?: string;
}

// ? - Users list filtering and sorting parameters
export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  roleId?: string;
  sortBy?: 'fullName' | 'email' | 'lastLoginAt' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  lastLoginFrom?: string;
  lastLoginTo?: string;
}

export interface UsersListResponse {
  code: string;
  message: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface RolesListResponse {
  code: string;
  message: string;
  data: Role[];
}

// ? - Edit User Profile types
export interface EditUserRequest {
  fullName?: string;
  phoneNumber?: string;
  roleId?: string;
  status?: UserStatus;
}

export interface EditUserResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    status: UserStatus;
    roleId: string;
    roleName: string;
    updatedAt: string;
    modifiedFields: string[];
    notificationSent: boolean;
  };
}

// ? - Reset User Password types
export type ResetMethod = 'admin_reset_link' | 'admin_temporary_password';

export interface ResetPasswordRequest {
  resetMethod: ResetMethod;
}

export interface ResetPasswordResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    resetMethod: ResetMethod;
    temporaryPassword?: string; // only if admin_temporary_password
    expiresAt: string;
    emailSent: boolean;
    sessionsInvalidated: number;
  };
}

// ? - Self-Service Profile Management types
export interface UserProfileResponse {
  code: string;
  message: string;
  data: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    status: UserStatus;
    roleName: RoleName;
    lastLoginAt?: string;
    lastLoginIp?: string;
    createdAt: string;
  };
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string | null;
}

export interface UpdateProfileResponse {
  code: string;
  message: string;
  data: {
    updatedFields: string[];
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  code: string;
  message: string;
  data: {
    sessionsInvalidated: number;
  };
}

export interface UserSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface UserSessionsResponse {
  code: string;
  message: string;
  data: {
    currentSessionId: string;
    sessions: UserSession[];
  };
}

export interface TerminateSessionResponse {
  code: string;
  message: string;
}

export interface UserActivity {
  type: string; // Translated activity type
  action: string; // Original action type for frontend processing
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
}

export interface UserActivityResponse {
  code: string;
  message: string;
  data: {
    activities: UserActivity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ? - Audit Trail Management types

export enum AuditAction {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_DEACTIVATED = 'user_deactivated',
  USER_ACTIVATED = 'user_activated',
  USER_LOCKED = 'user_locked',
  USER_UNLOCKED = 'user_unlocked',
  USER_ROLE_CHANGED = 'user_role_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  PASSWORD_CHANGED = 'password_changed',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  SESSION_TERMINATED = 'session_terminated',
  PROFILE_UPDATED = 'profile_updated',
  EMAIL_VERIFIED = 'email_verified',
  SYSTEM_CONFIGURATION_CHANGED = 'system_configuration_changed'
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

export enum ExportStatus {
  INITIATED = 'initiated',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ExportFormat {
  CSV = 'csv',
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json'
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorUserId: string;
  targetUserId?: string;
  actionType: string; // Translated text from backend
  rawActionType?: string; // Raw enum value for filtering (optional for backward compatibility)
  description: string;
  ipAddress: string;
  userAgent: string;
  status: AuditStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  actor: {
    id: string;
    fullName: string;
    email: string;
  };
  target?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  status?: AuditStatus;
  sortBy?: 'createdAt' | 'actionType' | 'status' | 'actorUserId';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogsResponse {
  code: string;
  message: string;
  data: {
    auditLogs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      dateRange: {
        from?: string;
        to?: string;
      };
      actionsCount: Record<string, number>;
      usersCount: number;
    };
  };
}

export interface AuditExportRequest {
  exportFormat: ExportFormat;
  userId?: string;
  action?: AuditAction;
  status?: AuditStatus;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
}

export interface AuditExport {
  id: string;
  tenantId: string;
  exportedBy: string;
  exportFormat: ExportFormat;
  status: ExportStatus;
  filtersApplied: Record<string, any>;
  recordCount?: number;
  fileSize?: number;
  fileHash?: string;
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface AuditExportResponse {
  code: string;
  message: string;
  data: {
    exportId: string;
    exportFormat: ExportFormat;
    status: ExportStatus;
    estimatedRecordCount?: number;
    estimatedRecords?: number; // Alternative field name
    filtersApplied?: Record<string, any>;
    expiresAt?: string;
    downloadUrl?: string;
  };
}

// ? - Role-Based Permission Enforcement types
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import'
}

export enum CheckResult {
  GRANTED = 'granted',
  DENIED = 'denied'
}

export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  description: string;
  createdAt: string;
}

export interface PermissionsListResponse {
  code: string;
  message: string;
  data: {
    permissions: Permission[];
  };
}

export interface RolePermission {
  permissionId: string;
  resource: string;
  action: PermissionAction;
  isGranted: boolean;
  grantedAt?: string;
  grantedBy?: string;
}

export interface RolePermissionsResponse {
  code: string;
  message: string;
  data: {
    roleId: string;
    roleName: string;
    permissions: RolePermission[];
  };
}

export interface UpdateRolePermissionsRequest {
  permissions: Array<{
    permissionId: string;
    isGranted: boolean;
  }>;
}

export interface UpdateRolePermissionsResponse {
  code: string;
  message: string;
  data: {
    roleId: string;
    updatedPermissions: RolePermission[];
    modifiedCount: number;
    modifiedBy: string;
    modifiedAt: string;
  };
}

export interface PermissionCheckRequest {
  resource: string;
  action: PermissionAction;
  resourceContext?: string;
}

export interface PermissionCheckResponse {
  code: string;
  message: string;
  data: {
    isGranted: boolean;
    resource: string;
    action: PermissionAction;
    reason?: string;
    checkedAt: string;
  };
}

export interface PermissionCheck {
  id: string;
  userId: string;
  permissionId: string;
  resource: string;
  action: PermissionAction;
  checkResult: CheckResult;
  resourceContext?: string;
  reason?: string;
  ipAddress: string;
  userAgent: string;
  checkedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PermissionAuditParams {
  page?: number;
  limit?: number;
  userId?: string;
  permissionId?: string;
  checkResult?: CheckResult;
  dateFrom?: string;
  dateTo?: string;
  resource?: string;
  action?: PermissionAction;
}

export interface PermissionAuditResponse {
  code: string;
  message: string;
  data: {
    permissionChecks: PermissionCheck[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ? - User Account Deactivation and Reactivation types
export interface ChangeUserStatusRequest {
  status: 'active' | 'inactive';
  reason?: string;
}

export interface ChangeUserStatusResponse {
  code: string;
  message: string;
  data: {
    userId: string;
    previousStatus: UserStatus;
    newStatus: UserStatus;
    statusChangeReason?: string;
    sessionIds: string[];
    activeSessionCount: number;
    emailSent: boolean;
    timestamp: string;
  };
}

export interface BulkChangeStatusRequest {
  userIds: string[];
  status: 'active' | 'inactive';
  reason?: string;
}

export interface BulkChangeStatusResponse {
  code: string;
  message: string;
  data: {
    affectedUserCount: number;
    processedUsers: Array<{
      userId: string;
      status: 'success' | 'failed';
      previousStatus?: UserStatus;
      newStatus?: UserStatus;
      errorMessage?: string;
    }>;
    totalSessionsInvalidated: number;
    bulkStatusChangeReason?: string;
    emailSent: boolean;
    timestamp: string;
  };
}

// ? & ? - Category Management types
export interface Category {
  id: string;
  name: string;
  description?: string;
  itemsCount?: number; // ?: Number of associated inventory items
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface CreateCategoryResponse {
  code: string;
  message: string;
  data: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ?: Enhanced categories list response with pagination
export interface CategoriesListResponse {
  code: string;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ?: Query parameters for categories list
export interface CategoriesListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ?: Category items count response for deletion validation
export interface CategoryItemsCountResponse {
  code: string;
  message: string;
  data: {
    categoryId: string;
    itemsCount: number;
    canDelete: boolean;
  };
}

// ?: Update category request
export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

// ?: Update category response
export interface UpdateCategoryResponse {
  code: string;
  message: string;
  data: {
    id: string;
    name: string;
    description?: string;
    itemsCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

// ?: Delete category response
export interface DeleteCategoryResponse {
  code: string;
  message: string;
}

// ?: Inventory Item Management Types

// Inventory item enums
export enum ItemType {
  SERIALIZED = 'serialized',
  NON_SERIALIZED = 'non_serialized',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export enum InventoryItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

// ? & ?: Create inventory item request
export interface CreateInventoryItemRequest {
  name: string;
  description?: string;
  categoryId: string;
  itemType: ItemType;
  serialNumber?: string;
  autoGenerateSerial?: boolean;
  quantity?: number;
  quantityUnit?: string;
}

// ? & ?: Inventory item DTO
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  itemType: ItemType;
  serialNumber?: string;
  quantity?: number;
  quantityUnit?: string;
  availabilityStatus: AvailabilityStatus;
  status: InventoryItemStatus;
  version: number;
  hasRentalHistory?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ? & ?: Create inventory item response
export interface CreateInventoryItemResponse {
  code: string;
  message: string;
  data: InventoryItem;
}

// ?: Pagination metadata for inventory list
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ?: List inventory items query parameters
export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  itemType?: ItemType;
  availabilityStatus?: AvailabilityStatus;
  status?: InventoryItemStatus;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ?: List inventory items response
export interface InventoryListResponse {
  code: string;
  message: string;
  data: InventoryItem[];
  meta: PaginationMeta;
}

// ?: Get inventory item response
export interface GetInventoryItemResponse {
  code: string;
  message: string;
  data: InventoryItem;
}

// ?: Validate serial number request
export interface ValidateSerialNumberRequest {
  serialNumber: string;
}

// ?: Validate serial number response
export interface ValidateSerialNumberResponse {
  code: string;
  message: string;
  data: {
    isUnique: boolean;
    serialNumber: string;
  };
}

// ?: Generate serial number response
export interface GenerateSerialNumberResponse {
  code: string;
  message: string;
  data: {
    serialNumber: string;
  };
}

// ?: Inventory Export Types

export enum ExportType {
  SINGLE_ITEM = 'single_item',
  MULTIPLE_ITEMS = 'multiple_items',
  FULL_INVENTORY = 'full_inventory',
}

export interface InventoryExportRequest {
  exportFormat: ExportFormat;
  exportType: ExportType;
  itemIds?: string[];
  exportOptions?: {
    includeDescription?: boolean;
    includeAuditHistory?: boolean;
    includeStatusInfo?: boolean;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  };
}

export interface InventoryExportResponse {
  code: string;
  message: string;
  data: {
    exportId: string;
    status: 'initiated' | 'processing' | 'completed' | 'failed';
    recordCount: number;
    downloadUrl?: string;
    expiresAt: string;
    estimatedCompletionTime?: string;
  };
}

// ?: Update inventory item basic information request
export interface UpdateInventoryItemRequest {
  name: string;
  description?: string;
  categoryId: string;
  status: InventoryItemStatus;
  version: number;
}

// ?: Update inventory item response
export interface UpdateInventoryItemResponse {
  code: string;
  message: string;
  data: InventoryItem;
}

// ?: Change inventory item status request
export interface ChangeInventoryItemStatusRequest {
  newStatus: AvailabilityStatus;
  changeReason?: string;
  expectedResolutionDate?: string;
}

// ?: Change inventory item status response
export interface ChangeInventoryItemStatusResponse {
  code: string;
  message: string;
  data: {
    itemId: string;
    previousStatus: AvailabilityStatus;
    newStatus: AvailabilityStatus;
    changeReason?: string;
    expectedResolutionDate?: string;
    changeId: string;
    changedAt: string;
  };
}

// ?: Update serialized item information request
export interface UpdateSerializedItemRequest {
  serialNumber?: string;
  confirmSerialNumberChange?: boolean;
}

// ?: Update serialized item information response
export interface UpdateSerializedItemResponse {
  code: string;
  message: string;
  data: InventoryItem;
}

// ?: Update non-serialized item quantity request
export interface UpdateNonSerializedItemQuantityRequest {
  quantity: number;
  quantityUnit?: string;
  changeReason?: string;
}

// ?: Update non-serialized item quantity response
export interface UpdateNonSerializedItemQuantityResponse {
  code: string;
  message: string;
  data: InventoryItem;
}
