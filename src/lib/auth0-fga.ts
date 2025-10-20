import { auth0 } from "./auth0";
// Note: `cookies` is a server-side helper from Next.js. We use it to read a demo
// cookie (`demo_role`) so the app can simulate a role change without updating
// Auth0 during demos. This keeps behavior local to the app and visible
// immediately in Settings after an upgrade.
import { cookies } from "next/headers";

/**
 * Auth0 Fine-Grained Authorization
 * Controls access to agents, APIs, and data based on user roles/permissions
 */

export interface AuthorizationModel {
  user: string;
  relation: 'viewer' | 'editor' | 'owner' | 'user';
  object: string;
}

export const permissions = {
  // Agent permissions
  USE_VISION_AGENT: 'use:vision_agent',
  USE_DIET_AGENT: 'use:diet_agent',
  
  // Data permissions
  READ_HEALTH_DATA: 'read:health_data',
  WRITE_HEALTH_DATA: 'write:health_data',
  DELETE_HEALTH_DATA: 'delete:health_data',
  
  // API permissions
  USE_VISION_API: 'use:vision_api',
  USE_NUTRITION_API: 'use:nutrition_api',
  USE_PDF_API: 'use:pdf_api',
  
  // Token management
  MANAGE_TOKENS: 'manage:tokens',
  VIEW_TOKENS: 'view:tokens',
} as const;

export type Permission = typeof permissions[keyof typeof permissions];

/**
 * User roles with their default permissions
 */
export const roles = {
  FREE_USER: {
    name: 'free_user',
    permissions: [
      permissions.USE_VISION_AGENT, // Limited usage
      permissions.READ_HEALTH_DATA,
      permissions.USE_VISION_API,
    ],
  },
  PRO_USER: {
    name: 'pro_user',
    permissions: [
      permissions.USE_VISION_AGENT,
      permissions.USE_DIET_AGENT,
      permissions.READ_HEALTH_DATA,
      permissions.WRITE_HEALTH_DATA,
      permissions.USE_VISION_API,
      permissions.USE_NUTRITION_API,
      permissions.USE_PDF_API,
    ],
  },
  ADMIN: {
    name: 'admin',
    permissions: Object.values(permissions), // All permissions
  },
} as const;

/**
 * Get user permissions from Auth0 session
 */
export async function getUserPermissions(): Promise<Permission[]> {
  try {
    // Demo override: if a demo role cookie is present, honor it first so
    // upgrades in the demo flow are reflected immediately.
    try {
      const cookieStore = await cookies();
      const demoRole = cookieStore.get("demo_role")?.value;
      if (demoRole) {
        if (demoRole === "admin") return [...roles.ADMIN.permissions];
        if (demoRole === "pro_user") return [...roles.PRO_USER.permissions];
        return [...roles.FREE_USER.permissions];
      }
    } catch (e) {
      // cookies() may throw in non-server contexts; ignore and continue
    }

    const session = await auth0.getSession();
    
    if (!session?.user) {
      return [];
    }

    // Get permissions from custom claims
    const namespace = process.env.APP_BASE_URL || 'http://localhost:3000';
    const userPermissions = session.user[`${namespace}/permissions`] as string[] | undefined;
    
    if (userPermissions && Array.isArray(userPermissions)) {
      return userPermissions as Permission[];
    }

    // Fallback: Get from roles
    const userRoles = session.user[`${namespace}/roles`] as string[] | undefined;
    
    if (userRoles && userRoles.includes('admin')) {
      return [...roles.ADMIN.permissions];
    } else if (userRoles && userRoles.includes('pro_user')) {
      return [...roles.PRO_USER.permissions];
    }
    
    // Default to free user permissions
    return [...roles.FREE_USER.permissions];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions();
    return userPermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if user has all required permissions
 */
export async function checkPermissions(requiredPermissions: Permission[]): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions();
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Get user role from session
 */
export async function getUserRole(): Promise<string | null> {
  try {
    // Check demo cookie override first (server-side only)
    try {
      const cookieStore = await cookies();
      const demoRole = cookieStore.get("demo_role")?.value;
      if (demoRole) {
        if (demoRole === "admin") return "admin";
        if (demoRole === "pro_user") return "pro_user";
        return "free_user";
      }
    } catch (e) {
      // ignore errors reading cookies in non-server contexts
    }

    const session = await auth0.getSession();
    
    if (!session?.user) {
      return null;
    }

    const namespace = process.env.APP_BASE_URL || 'http://localhost:3000';
    const userRoles = session.user[`${namespace}/roles`] as string[] | undefined;
    
    if (userRoles && userRoles.length > 0) {
      // Return highest role
      if (userRoles.includes('admin')) return 'admin';
      if (userRoles.includes('pro_user')) return 'pro_user';
      return 'free_user';
    }
    
    return 'free_user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if user can access a specific resource
 * This is where you'd integrate with Auth0 FGA API for fine-grained control
 */
export async function canAccessResource(
  resourceType: 'health_data' | 'agent' | 'api_token',
  resourceId: string,
  action: 'read' | 'write' | 'delete' | 'use' = 'read'
): Promise<boolean> {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return false;
    }

    // For now, implement basic ownership check
    // In production, this would call Auth0 FGA API
    const userId = session.user.sub;
    
    // Example: User can access their own health data
    if (resourceType === 'health_data') {
      // Check if resource belongs to user
      // This would query your database
      return resourceId.startsWith(userId);
    }
    
    // Check permission for agents
    if (resourceType === 'agent') {
      if (action === 'use') {
        if (resourceId === 'vision') {
          return await checkPermission(permissions.USE_VISION_AGENT);
        }
        if (resourceId === 'diet') {
          return await checkPermission(permissions.USE_DIET_AGENT);
        }
      }
    }
    
    // Check permission for API tokens
    if (resourceType === 'api_token') {
      if (action === 'read') {
        return await checkPermission(permissions.VIEW_TOKENS);
      }
      if (action === 'write' || action === 'delete') {
        return await checkPermission(permissions.MANAGE_TOKENS);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking resource access:', error);
    return false;
  }
}
