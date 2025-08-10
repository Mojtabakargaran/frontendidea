# Samanin Frontend

> **📝 Note for AI Agents**: When updating this README , maintain the existing structure and sections. Do not add new sections and keep all updates concise and focused on essential information.

 do not add new sections and Keep all updates concise and focused on essential information.

This is the frontend implementation for the Samanin Rental Management Platform.

## 🎯 Implementation Overview

This implementation follows the exact specifications from ? to ? and provides:

- **Complete User Registration Flow** with automatic tenant creation
- **Full Authentication System** with login, logout, and password reset
- **Dynamic Role-Based Access Control** with permissions from login response (no hardcoded roles)
- **Tenant-specific Dashboard** with comprehensive information display
- **User Management System** with create, edit, list, and password reset functionality
- **User Account Deactivation and Reactivation** with individual and bulk operations
- **Self-Service Profile Management** with profile editing, password change, session management, and activity logs
- **Audit Trail Management** with comprehensive security monitoring and compliance reporting
- **Admin Password Reset System** with temporary passwords and reset links
- **Role-Based Permission Enforcement** with dynamic permission checking from server response and audit logging
- **Category Management System** with custom category creation, enhanced list view with pagination and search, category deletion with validation, and item count tracking for inventory organization
- **Inventory Management System** with serialized and non-serialized item creation, comprehensive list view with filtering and search, detailed item view with complete information display, inventory item editing with optimistic locking, advanced serialized item management with serial number tracking and validation, flexible quantity management for non-serialized items with change tracking, bulk selection and export functionality, and comprehensive inventory control
- **Inventory Export System** with multiple format support (PDF, Excel, CSV, JSON), configurable export options, single and bulk item export, and automatic file generation
- **Modular Navigation System** ready for future module expansion
- **Bilingual Support** (Persian/Arabic) with proper RTL layout
- **Locale-Specific Formatting** with Persian/Gregorian calendars and currency support
- **Real-time Form Validation** with password strength indicators
- **Modern UI/UX** following Material Design principles
- **Accessibility Compliance** with WCAG guidelines
- **Error Handling** with user-friendly messages

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **UI Library**: shadcn/ui + TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: react-i18next
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Project Structure
```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with RTL support
│   ├── page.tsx             # Registration page
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── auth/
│   │   ├── forgot-password/
│   │   │   └── page.tsx     # Password reset request
│   │   ├── reset-password/
│   │   │   └── page.tsx     # Password reset completion
│   │   ├── verify-email/
│   │   │   └── page.tsx     # Email verification (?-ALT-2)
│   │   └── change-password/
│   │       └── page.tsx     # Mandatory password change (?)
│   ├── dashboard/
│   │   ├── page.tsx         # Dashboard (post-login)
│   │   ├── users/
│   │   │   └── page.tsx     # User Management (?, ?, ?)
│   │   ├── profile/
│   │   │   └── page.tsx     # Self-Service Profile Management (?)
│   │   ├── permissions/
│   │   │   └── page.tsx     # Role-Based Permission Management (?)
│   │   ├── categories/
│   │   │   └── page.tsx     # Category Management (?)
│   │   ├── inventory/
│   │   │   ├── page.tsx     # Inventory Management (?, ?, ?)
│   │   │   └── [itemId]/
│   │   │       ├── page.tsx # Inventory Item Details (?)
│   │   │       └── edit/
│   │   │           └── page.tsx # Inventory Item Edit (?)
│   │   └── audit/
│   │       └── page.tsx     # Audit Trail Management (?)
│   └── globals.css          # Global styles with RTL/font support
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── registration-form.tsx # User registration form
│   ├── login-form.tsx       # User login form (enhanced for ?)
│   ├── password-reset-form.tsx # Password reset request form
│   ├── password-reset-complete-form.tsx # Password reset completion form
│   ├── mandatory-password-change-form.tsx # Mandatory password change form (?)
│   ├── logout-button.tsx    # Logout button component
│   ├── language-selector.tsx # Language switcher
│   ├── dashboard-header.tsx # Dashboard header with user info (enhanced for ?)
│   ├── dashboard-navigation.tsx # Dashboard navigation sidebar (role-based for ?)
│   ├── dashboard-info-cards.tsx # Dashboard information display cards
│   ├── create-user-form.tsx # Create new user form (?)
│   ├── edit-user-form.tsx   # Edit user form component (?)
│   ├── reset-password-dialog.tsx # Reset password dialog component (?)
│   ├── user-status-change-dialog.tsx # User status change dialog component (?)
│   ├── users-list.tsx       # Users list component (?, ?, ?, ?)
│   ├── profile-overview.tsx # Profile overview component (?)
│   ├── profile-edit-form.tsx # Profile edit form component (?)
│   ├── change-password-form.tsx # Change password form component (?)
│   ├── sessions-management.tsx # Sessions management component (?)
│   ├── activity-log.tsx     # Activity log component (?)
│   ├── audit-trail-list.tsx # Audit trail list component (?)
│   ├── role-permissions-manager.tsx # Role permissions management component (?)
│   ├── permissions-audit-list.tsx # Permissions audit list component (?)
│   ├── categories-list.tsx  # Categories list component (?, ?, ?)
│   ├── create-category-form.tsx # Create category form component (?)
│   ├── delete-category-dialog.tsx # Delete category dialog component (?)
│   └── inventory/
│   │   ├── inventory-items-list.tsx # Inventory items list component (?, ?, ?)
│   │   ├── create-inventory-item-form.tsx # Create inventory item form component (?, ?)
│   │   ├── edit-inventory-item-form.tsx # Edit inventory item form component (?)
│   │   ├── change-status-dialog.tsx # Change inventory item status dialog component (?)
│   │   └── inventory-export-dialog.tsx # Inventory export dialog component (?)
├── hooks/
│   ├── use-direction.ts     # RTL direction hook
│   ├── use-language-persistence.ts # Language persistence hook
│   ├── use-locale-formatting.ts # Locale formatting configuration hook
│   ├── use-permissions.ts   # Permission checking and management hooks (?)
│   └── use-user.tsx         # User context and session management (?)
├── i18n/
│   ├── index.ts             # i18n configuration
│   ├── fa.json              # Persian translations (enhanced for ?)
│   └── ar.json              # Arabic translations (enhanced for ?)
├── services/
│   └── api.ts               # API client with interceptors (enhanced for ?)
├── types/
│   └── index.ts             # TypeScript type definitions (enhanced for ?)
└── lib/
    ├── utils.ts             # Utility functions
    ├── locale-formatting.ts # Locale-specific formatting utilities
    ├── role-utils.ts        # Legacy role-based access control utilities
    └── dynamic-permission-utils.ts # Dynamic permission checking using login response permissions
```

## 🌍 Internationalization

### Supported Languages
- **Persian (fa)** - Default language, RTL layout
- **Arabic (ar)** - RTL layout with Arabic fonts

### Translation Files
- `i18n/fa.json` - Persian translations
- `i18n/ar.json` - Arabic translations

### Locale-Specific Formatting
- **Persian (Iran)**: Persian calendar, Persian digits, Iranian Rial (IRR)
- **Arabic (UAE)**: Gregorian calendar, Arabic digits, UAE Dirham (AED)
- **Automatic Detection**: Tenant-specific locale configuration from API
- **Fallback Support**: Default Persian locale for error scenarios

## 🔒 Security Features

- **Dynamic Permission System**: Uses actual permissions from login response, not hardcoded roles
- **Password Masking**: Passwords hidden by default with toggle
- **Input Validation**: Client-side validation with server confirmation
- **Error Handling**: No sensitive data exposed in error messages
- **Type Safety**: Full TypeScript coverage

## 🔧 Development

### Code Style
- Follow naming conventions in `convention.md`
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks

### Performance
- Code splitting with Next.js App Router
- Optimized bundle size with tree shaking
- Lazy loading for non-critical components

**Date**: August 5, 2025  
**Compliance**: Fully implements ? to ? requirements + ? Category Creation + ? Enhanced Categories List with Pagination & Search + ? Category Deletion with Validation + ? Serialized Inventory Item Creation + ? Non-Serialized Inventory Item Creation + ? View Inventory Items List + ? View Individual Inventory Item Details + ? Export Inventory Item Information + ? Edit Inventory Item Basic Information + ? Change Inventory Item Status + ? Update Serialized Item Information + ? Update Non-Serialized Item Quantity
