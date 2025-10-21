import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'toredco-admin-secret-key-2024-super-secure';

const adminUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'approve', 'manage_users']
  },
  {
    id: 2,
    username: 'admin2',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'approve']
  },
  {
    id: 3,
    username: 'admin3',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    permissions: ['read', 'write']
  }
];

export interface AdminUser {
  userId: number;
  username: string;
  role: string;
  permissions?: string[];
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  permissions?: string[];
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify admin token (mock implementation)
export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = adminUsers.find(u => u.id === decoded.userId);
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      permissions: user?.permissions || []
    };
  } catch (error) {
    return null;
  }
}

// Get user from request (từ cookie hoặc header)
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    // Thử lấy từ cookie trước
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      return verifyToken(token);
    }

    // Thử lấy từ Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Get admin user from request
export function getAdminFromRequest(request: NextRequest): AdminUser | null {
  // Lấy từ cookie trước
  const cookieToken = request.cookies.get('admin-token')?.value;
  if (cookieToken) {
    const user = verifyAdminToken(cookieToken);
    if (user) return user;
  }
  // Lấy từ header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token);
  }
  return null;
}

// Authenticate admin user
export function authenticateAdmin(username: string, password: string): AdminUser | null {
  const __DEV__ = process.env.NODE_ENV !== 'production';
  if (__DEV__) console.log('🔍 [AUTH] authenticateAdmin called with:', { username, password: password ? '***' : 'undefined' });
  if (__DEV__) console.log('🔍 [AUTH] Available users:', adminUsers.map(u => ({ username: u.username, id: u.id, role: u.role })));

  // Normalize inputs to avoid common user mistakes (spaces/case)
  const normalizedUsername = (username || '').trim().toLowerCase();
  const normalizedPassword = (password || '').trim();

  const user = adminUsers.find(u => u.username.toLowerCase() === normalizedUsername);
  if (__DEV__) console.log('🔍 [AUTH] Found user:', user ? { username: user.username, id: user.id, role: user.role } : 'NOT FOUND');
  
  if (user) {
    if (__DEV__) console.log('🔍 [AUTH] User found, checking password...');
    // Nếu password đã hash, dùng bcrypt.compareSync
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      if (__DEV__) console.log('🔍 [AUTH] Password is hashed, using bcrypt.compareSync');
      if (bcrypt.compareSync(normalizedPassword, user.password)) {
        if (__DEV__) console.log('✅ [AUTH] Password verified with bcrypt');
        return {
          userId: user.id,
          username: user.username,
          role: user.role,
          permissions: user.permissions
        };
      } else {
        if (__DEV__) console.log('❌ [AUTH] Password verification failed with bcrypt');
        // Fallback DEV credentials to reduce friction locally
        if (__DEV__ && user.username.toLowerCase() === 'admin' && (normalizedPassword === 'admin' || normalizedPassword === 'password')) {
          if (__DEV__) console.log('✅ [AUTH] Accepted DEV fallback credentials for admin');
          return {
            userId: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions
          };
        }
      }
    } else if (user.password === normalizedPassword) {
      if (__DEV__) console.log('✅ [AUTH] Password verified with plain text comparison');
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      };
    } else {
      if (__DEV__) console.log('❌ [AUTH] Password verification failed with plain text comparison');
      if (__DEV__) console.log('🔍 [AUTH] Expected:', user.password, 'Received:', '***');
    }
    
    // Fallback DEV credentials - chạy cho mọi trường hợp thất bại
    if (__DEV__ && user.username.toLowerCase() === 'admin' && (normalizedPassword === 'admin' || normalizedPassword === 'password')) {
      if (__DEV__) console.log('✅ [AUTH] Accepted DEV fallback credentials for admin');
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      };
    }
  } else {
    if (__DEV__) console.log('❌ [AUTH] User not found in adminUsers array');
  }
  
  if (__DEV__) console.log('❌ [AUTH] Authentication failed, returning null');
  return null;
}

// Middleware để check authentication
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Middleware để check role
export function requireRole(request: NextRequest, roles: string[]): JWTPayload {
  const user = requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

// Middleware để check admin authentication
export function requireAdmin(request: NextRequest): AdminUser {
  const admin = getAdminFromRequest(request);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized - Admin access required');
  }
  return admin;
}

// Middleware để check admin permissions
export function requireAdminPermission(request: NextRequest, permission: string): AdminUser {
  const admin = requireAdmin(request);
  if (!admin.permissions || !admin.permissions.includes(permission)) {
    throw new Error(`Forbidden - Permission '${permission}' required`);
  }
  return admin;
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
} 