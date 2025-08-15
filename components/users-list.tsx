'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  UserPlus, 
  Users, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Key,
  UserCheck,
  UserX,
  UserMinus,
  CheckSquare,
  Square
} from 'lucide-react';

import { userService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useGlobalLocaleFormatting } from '@/providers/locale-formatting-provider';
import { useClientPermissions } from '@/hooks/use-permissions';
import { getRoleDisplayName } from '@/lib/role-utils';
import { formatDate as formatDateUtil } from '@/lib/locale-formatting';
import { PermissionAction, TenantLocale, TenantLanguage } from '@/types';
import type { User, ApiError, UsersListParams, UserStatus } from '@/types';

// Lazy load heavy dialog components for better performance
const ResetPasswordDialog = lazy(() => import('@/components/reset-password-dialog'));
const UserStatusChangeDialog = lazy(() => import('@/components/user-status-change-dialog'));

interface UsersListProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

export default function UsersList({ onCreateUser, onEditUser }: UsersListProps) {
  const { t, i18n } = useTranslation();
  const { config } = useGlobalLocaleFormatting();
  
  // Memoize the date formatting function to re-compute when language changes
  const formatDate = React.useCallback((dateString: string) => {
    // Create a locale-specific config based on current language
    const languageSpecificConfig = {
      ...config,
      locale: (i18n.language === 'fa' ? 'iran' : 'uae') as TenantLocale,
      language: (i18n.language === 'fa' ? 'persian' : 'arabic') as TenantLanguage,
      dateFormat: {
        ...config.dateFormat,
        calendar: (i18n.language === 'fa' ? 'persian' : 'gregorian') as 'persian' | 'gregorian'
      },
      numberFormat: {
        ...config.numberFormat,
        digits: (i18n.language === 'fa' ? 'persian' : 'arabic') as 'persian' | 'arabic' | 'latin'
      }
    };
    return formatDateUtil(dateString, languageSpecificConfig);
  }, [config, i18n.language]);
  
  // State for filtering, sorting, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'fullName' | 'email' | 'lastLoginAt' | 'createdAt' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Reset password dialog state
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
  // Status change dialog state
  const [statusChangeUsers, setStatusChangeUsers] = useState<User | User[] | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive'>('active');
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);

  // Permission checks
  const { canUpdate, canDelete } = useClientPermissions();
  const canManageUserStatus = canUpdate('users'); // User status management requires UPDATE permission
  
  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  const limit = 25;

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query parameters
  const queryParams: UsersListParams = useMemo(() => {
    const params: UsersListParams = {
      page: currentPage,
      limit,
      sortBy,
      sortOrder,
    };
    
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }
    
    if (statusFilter !== 'all') {
      params.status = statusFilter as UserStatus;
    }
    
    if (roleFilter !== 'all') {
      params.roleId = roleFilter;
    }
    
    return params;
  }, [currentPage, limit, sortBy, sortOrder, debouncedSearchTerm, statusFilter, roleFilter]);

  // Fetch users with filtering and sorting
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => userService.getUsers(queryParams),
  });

  // Fetch roles for filter dropdown
  const {
    data: rolesData,
    isLoading: isLoadingRoles
  } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => userService.getRoles(),
  });

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleCloseResetPasswordDialog = () => {
    setResetPasswordUser(null);
    setIsResetPasswordDialogOpen(false);
  };

  const handleStatusChange = (user: User, status: 'active' | 'inactive') => {
    setStatusChangeUsers(user);
    setTargetStatus(status);
    setIsStatusChangeDialogOpen(true);
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    if (selectedUsers.length === 0) return;
    
    const usersToChange = usersData?.data.users.filter(user => selectedUsers.includes(user.id)) || [];
    setStatusChangeUsers(usersToChange);
    setTargetStatus(status);
    setIsStatusChangeDialogOpen(true);
  };

  const handleCloseStatusChangeDialog = () => {
    setStatusChangeUsers(null);
    setIsStatusChangeDialogOpen(false);
  };

  const handleStatusChangeSuccess = () => {
    setSelectedUsers([]);
    setIsAllSelected(false);
    handleCloseStatusChangeDialog();
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers([]);
      setIsAllSelected(false);
    } else {
      const allUserIds = usersData?.data.users.map(user => user.id) || [];
      setSelectedUsers(allUserIds);
      setIsAllSelected(true);
    }
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || roleFilter !== 'all' || sortBy !== 'createdAt' || sortOrder !== 'desc';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card className="dashboard-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-md">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('users.list.title')}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  {t('users.list.subtitle')}
                </p>
              </div>
            </div>
            
            <Button
              onClick={onCreateUser}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 text-white font-medium py-2 px-4 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t('users.list.create_user')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="glass-card rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('users.list.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm border-white/30 focus:border-white/50"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('users.list.filters.toggle')}
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('users.list.filters.clear')}
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/20">
                {/* Status Filter */}
                <div>
                  <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                    {t('users.list.filters.status.label')}
                  </Label>
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value as UserStatus | 'all');
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.list.filters.status.all')}</SelectItem>
                      <SelectItem value="active">{t('users.status.active')}</SelectItem>
                      <SelectItem value="inactive">{t('users.status.inactive')}</SelectItem>
                      <SelectItem value="pending_verification">{t('users.status.pending_verification')}</SelectItem>
                      <SelectItem value="suspended">{t('users.status.suspended')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Filter */}
                <div>
                  <Label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
                    {t('users.list.filters.role.label')}
                  </Label>
                  <Select value={roleFilter} onValueChange={(value) => {
                    setRoleFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.list.filters.role.all')}</SelectItem>
                      {rolesData?.data.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {getRoleDisplayName(role.name, t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div>
                  <Label htmlFor="sort-filter" className="text-sm font-medium text-gray-700">
                    {t('users.list.filters.sort.label')}
                  </Label>
                  <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('_') as [typeof sortBy, typeof sortOrder];
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullName_asc">{t('users.list.sort.fullName_asc')}</SelectItem>
                      <SelectItem value="fullName_desc">{t('users.list.sort.fullName_desc')}</SelectItem>
                      <SelectItem value="email_asc">{t('users.list.sort.email_asc')}</SelectItem>
                      <SelectItem value="email_desc">{t('users.list.sort.email_desc')}</SelectItem>
                      <SelectItem value="createdAt_asc">{t('users.list.sort.createdAt_asc')}</SelectItem>
                      <SelectItem value="createdAt_desc">{t('users.list.sort.createdAt_desc')}</SelectItem>
                      <SelectItem value="lastLoginAt_asc">{t('users.list.sort.lastLoginAt_asc')}</SelectItem>
                      <SelectItem value="lastLoginAt_desc">{t('users.list.sort.lastLoginAt_desc')}</SelectItem>
                      <SelectItem value="status_asc">{t('users.list.sort.status_asc')}</SelectItem>
                      <SelectItem value="status_desc">{t('users.list.sort.status_desc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 flex items-center justify-between">
            {t('users.list.load_error')}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('common.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="glass-card rounded-3xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">{t('users.list.loading')}</p>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      {usersData && !isLoading && (
        <Card className="glass-card rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t('users.list.results_summary', { 
                  showing: usersData.data.users.length,
                  total: usersData.data.pagination.total,
                  page: usersData.data.pagination.page,
                  totalPages: usersData.data.pagination.totalPages
                })}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {t('users.list.bulkActions.selected', { count: selectedUsers.length })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {canManageUserStatus && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkStatusChange('active')}
                          className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          {t('users.list.bulkActions.reactivate')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkStatusChange('inactive')}
                          className="text-red-700 border-red-300 hover:bg-red-50"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          {t('users.list.bulkActions.deactivate')}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUsers([]);
                        setIsAllSelected(false);
                      }}
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t('users.list.bulkActions.clear')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {usersData.data.users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters ? t('users.list.no_results.title') : t('users.list.no_users.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters ? t('users.list.no_results.description') : t('users.list.no_users.description')}
                </p>
                {hasActiveFilters ? (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="bg-white/90 backdrop-blur-sm border-white/30"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('users.list.filters.clear')}
                  </Button>
                ) : (
                  <Button
                    onClick={onCreateUser}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('users.list.create_first_user')}
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Table Header - Desktop View */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-700">
                    <div className="flex items-center justify-between px-2" dir="rtl">
                      <button
                        onClick={handleSelectAll}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <div className="w-10 h-10"></div> {/* Avatar placeholder */}
                    </div>
                    <button
                      onClick={() => handleSort('fullName')}
                      className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      {t('users.list.headers.fullName')}
                      {getSortIcon('fullName')}
                    </button>
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      {t('users.list.headers.email')}
                      {getSortIcon('email')}
                    </button>
                    <div className="flex items-center justify-center">{t('users.list.headers.phone')}</div>
                    <div className="flex items-center justify-center">{t('users.list.headers.role')}</div>
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      {t('users.list.headers.status')}
                      {getSortIcon('status')}
                    </button>
                    <button
                      onClick={() => handleSort('lastLoginAt')}
                      className="flex items-center justify-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      {t('users.list.headers.lastLogin')}
                      {getSortIcon('lastLoginAt')}
                    </button>
                    <div className="flex items-center justify-center">{t('users.list.headers.actions')}</div>
                  </div>
                </div>

                {/* Users List */}
                <div className="divide-y divide-gray-100">
                  {usersData.data.users.map((user: User) => (
                    <div
                      key={user.id}
                      className="p-6 hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      {/* Desktop Layout */}
                      <div className="hidden lg:grid lg:grid-cols-8 lg:gap-4 lg:items-center">
                        <div className="flex items-center justify-between px-2" dir="rtl">
                          <button
                            onClick={() => handleSelectUser(user.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {selectedUsers.includes(user.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm">
                              {getUserInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </h3>
                        </div>
                        
                        <div className="text-sm text-gray-600 text-center">
                          {user.email}
                        </div>
                        
                        <div className="text-sm text-gray-600 text-center" dir="ltr">
                          {user.phoneNumber || '-'}
                        </div>
                        
                        <div className="text-sm text-gray-600 text-center">
                          {t(`common.roles.${user.roleName}`)}
                        </div>
                        
                        <div className="flex justify-center">
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {t(`users.status.${user.status}`)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 text-center">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('users.list.never_logged_in')}
                        </div>
                        
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEditUser(user)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                            title={t('users.list.actions.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            className="hover:bg-orange-50 hover:text-orange-600"
                            title={t('users.list.actions.resetPassword')}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          {canManageUserStatus && (
                            <>
                              {user.status === 'active' ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusChange(user, 'inactive')}
                                  className="hover:bg-red-50 hover:text-red-600"
                                  title={t('users.list.actions.deactivate')}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusChange(user, 'active')}
                                  className="hover:bg-green-50 hover:text-green-600"
                                  title={t('users.list.actions.reactivate')}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleSelectUser(user.id)}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                            >
                              {selectedUsers.includes(user.id) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
                                {getUserInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {user.fullName}
                              </h3>
                              
                              <div className="mt-1 text-sm text-gray-600 space-y-1">
                                <div className="flex items-center min-w-0">
                                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                
                                {user.phoneNumber && (
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span dir="ltr">{user.phoneNumber}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge className={getStatusBadgeColor(user.status)}>
                                  {t(`users.status.${user.status}`)}
                                </Badge>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                  <Shield className="h-4 w-4 mr-1" />
                                  {t(`common.roles.${user.roleName}`)}
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('users.list.never_logged_in')}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onEditUser(user)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                              title={t('users.list.actions.edit')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResetPassword(user)}
                              className="hover:bg-orange-50 hover:text-orange-600"
                              title={t('users.list.actions.resetPassword')}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            {canManageUserStatus && (
                              <>
                                {user.status === 'active' ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleStatusChange(user, 'inactive')}
                                    className="hover:bg-red-50 hover:text-red-600"
                                    title={t('users.list.actions.deactivate')}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleStatusChange(user, 'active')}
                                    className="hover:bg-green-50 hover:text-green-600"
                                    title={t('users.list.actions.reactivate')}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {usersData && usersData.data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="bg-white/90 backdrop-blur-sm border-white/30"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('common.previous')}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(usersData.data.pagination.totalPages, currentPage + 1))}
              disabled={currentPage >= usersData.data.pagination.totalPages}
              className="bg-white/90 backdrop-blur-sm border-white/30"
            >
              {t('common.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-white/30">
            <span className="text-sm text-gray-600">
              {t('users.list.pagination_info', {
                current: currentPage,
                total: usersData.data.pagination.totalPages,
                showing: usersData.data.users.length,
                totalItems: usersData.data.pagination.total
              })}
            </span>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={resetPasswordUser}
        isOpen={isResetPasswordDialogOpen}
        onClose={handleCloseResetPasswordDialog}
      />

      {/* Status Change Dialog */}
      <UserStatusChangeDialog
        isOpen={isStatusChangeDialogOpen}
        onClose={handleCloseStatusChangeDialog}
        users={statusChangeUsers!}
        targetStatus={targetStatus}
        onSuccess={handleStatusChangeSuccess}
      />
    </div>
  );
}
