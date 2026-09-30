import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { AuthSessionUser } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'reservespace_secure_super_secret_jwt_key_2026_local_prod'
);

/**
 * Hash a password securely using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for authenticated session
 */
export async function createSessionToken(user: AuthSessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    customerCode: user.customerCode,
    fullName: user.fullName,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token and return session payload
 */
export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as {
      id: string;
      email: string;
      customerCode: string;
      fullName: string;
      role: 'admin' | 'customer';
    };
  } catch (error) {
    return null;
  }
}
