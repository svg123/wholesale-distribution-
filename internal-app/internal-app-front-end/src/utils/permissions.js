import { ROLES } from './constants';

/**
 * Check if a user has access to a specific route/feature
 */
export function hasAccess(userRole, requiredRoles) {
  if (!userRole || !requiredRoles) return false;
  if (typeof requiredRoles === 'string') return userRole === requiredRoles;
  if (Array.isArray(requiredRoles)) return requiredRoles.includes(userRole);
  return false;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole) {
  return userRole === ROLES.ADMIN;
}

/**
 * Check if user is management or above
 */
export function isManagementOrAbove(userRole) {
  return [ROLES.MANAGEMENT, ROLES.ADMIN].includes(userRole);
}

/**
 * Get role display label
 */
export function getRoleLabel(role) {
  const labels = {
    [ROLES.STAFF]: 'Staff',
    [ROLES.MANAGEMENT]: 'Management',
    [ROLES.ADMIN]: 'Administrator',
  };
  return labels[role] || role;
}

/**
 * Get role badge color class
 */
export function getRoleBadgeColor(role) {
  const colors = {
    [ROLES.STAFF]: 'badge-info',
    [ROLES.MANAGEMENT]: 'badge-warning',
    [ROLES.ADMIN]: 'badge-success',
  };
  return colors[role] || 'badge-gray';
}

/**
 * Check if user has access to a specific sub-station
 * Admin and Management have access to all sub-stations
 * Staff can only access their assigned sub-stations
 */
export function hasSubstationAccess(user, substationName) {
  if (!user || !substationName) return false;
  
  // Admin and Management have access to all sub-stations
  if ([ROLES.MANAGEMENT, ROLES.ADMIN].includes(user.role)) {
    return true;
  }
  
  // Staff: check if sub-station is in their accessible list
  if (user.role === ROLES.STAFF) {
    // "all" means access to all sub-stations
    if (user.accessibleSubstations === 'all') return true;
    
    // Check if sub-station is in the array
    if (Array.isArray(user.accessibleSubstations)) {
      return user.accessibleSubstations.includes(substationName);
    }
  }
  
  return false;
}

/**
 * Get sub-stations user can access
 */
export function getAccessibleSubstations(user, allSubstations) {
  if (!user || !allSubstations) return [];
  
  // Admin and Management can access all
  if ([ROLES.MANAGEMENT, ROLES.ADMIN].includes(user.role)) {
    return allSubstations;
  }
  
  // Staff with "all" permission
  if (user.accessibleSubstations === 'all') {
    return allSubstations;
  }
  
  // Staff with specific sub-stations
  if (Array.isArray(user.accessibleSubstations)) {
    return allSubstations.filter(s => 
      user.accessibleSubstations.includes(s.name)
    );
  }
  
  return [];
}

/**
 * Filter nav items based on user role
 */
export function filterNavByRole(navItems, userRole) {
  return navItems.filter((item) => item.roles.includes(userRole));
}

/**
 * Check if user has access to Utility Module
 * Admin and Management always have access.
 * Staff users only have access if explicitly granted via Utility Manager.
 */
export function hasUtilityAccess(user, utilityUsers) {
  if (!user) return false;
  // Admin and Management always have full access
  if ([ROLES.ADMIN, ROLES.MANAGEMENT].includes(user.role)) return true;
  // Staff: check if explicitly granted access
  if (user.role === ROLES.STAFF) {
    const matchedUser = utilityUsers?.find(
      (u) => u.email === user.email || u.name === user.name
    );
    return matchedUser?.hasUtilityAccess || false;
  }
  return false;
}

/**
 * Check if user can manage Utility permissions (Admin/Manager only)
 */
export function canManageUtilityAccess(userRole) {
  return [ROLES.ADMIN, ROLES.MANAGEMENT].includes(userRole);
}
