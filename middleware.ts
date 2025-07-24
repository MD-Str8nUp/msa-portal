import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Completely disable middleware for now - let all requests through
  return NextResponse.next();
}

// Helper function to get role-based redirect URL
function getRoleBasedRedirectUrl(role: string, viewMode?: string): string {
  switch (role?.toLowerCase()) {
    case 'parent':
      return '/parent/dashboard';
    case 'leader':
      return '/leader/dashboard';
    case 'leader1':
      // Use view mode if set, otherwise default to leader mode
      return viewMode === 'parent' ? '/parent/dashboard' : '/leader/dashboard';
    case 'executive':
    case 'admin':
      return '/admin/data-management';
    default:
      return '/dashboard';
  }
}

// Helper function to check if user has access to a specific route
function hasRoleAccess(pathname: string, role: string, viewMode?: string): boolean {
  const normalizedRole = role?.toLowerCase();
  
  // Extract role from pathname (e.g., /parent/... -> parent, /leader/... -> leader)
  const pathSegments = pathname.split('/');
  const routeRole = pathSegments[1]; // Should be parent, leader, admin, or executive
  
  if (!routeRole || routeRole === 'dashboard') return true; // Allow access to general dashboard
  
  switch (normalizedRole) {
    case 'parent':
      return routeRole === 'parent';
    case 'leader':
      return routeRole === 'leader';
    case 'leader1':
      // Leader1 can access both parent and leader routes based on view mode
      return routeRole === 'leader' || routeRole === 'parent';
    case 'executive':
    case 'admin':
      return routeRole === 'executive' || routeRole === 'admin';
    default:
      return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
