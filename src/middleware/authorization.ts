import { NextResponse } from 'next/server';
import { checkPermission, checkPermissions, Permission } from '@/lib/auth0-fga';
import { auth0 } from '@/lib/auth0';

/**
 * Authorization Middleware
 * Wraps API routes to check permissions before execution
 */
export async function withAuthorization(
  requiredPermission: Permission
): Promise<NextResponse | null> {
  try {
    // Check if user is authenticated
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    // Check if user has required permission
    const hasPermission = await checkPermission(requiredPermission);

    if (!hasPermission) {
      return NextResponse.json(
        { 
          error: 'Forbidden: Insufficient permissions',
          required: requiredPermission,
          message: 'Upgrade to Pro to access this feature'
        },
        { status: 403 }
      );
    }

    // Permission granted
    return null;
  } catch (error) {
    console.error('[Authorization] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check multiple permissions (user must have ALL)
 */
export async function withPermissions(
  requiredPermissions: Permission[]
): Promise<NextResponse | null> {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    // Check all permissions
    const hasAllPermissions = await checkPermissions(requiredPermissions);
    
    if (!hasAllPermissions) {
      return NextResponse.json(
        { 
          error: 'Forbidden: Insufficient permissions',
          required: requiredPermissions,
          message: 'You do not have all the required permissions for this action'
        },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error('[Authorization] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Require specific role
 */
export async function requireRole(
  allowedRoles: ('free_user' | 'pro_user' | 'admin')[]
): Promise<NextResponse | null> {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    const namespace = process.env.APP_BASE_URL || 'http://localhost:3000';
    const userRoles = session.user[`${namespace}/roles`] as string[] | undefined;
    
    const hasRole = userRoles?.some(role => allowedRoles.includes(role as 'free_user' | 'pro_user' | 'admin'));
    
    if (!hasRole) {
      return NextResponse.json(
        { 
          error: 'Forbidden: Insufficient role',
          required: allowedRoles,
          message: 'This feature requires a higher subscription tier'
        },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error('[Authorization] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
