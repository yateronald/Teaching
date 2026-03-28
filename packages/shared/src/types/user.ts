import { Locale, UserRole } from './enums';

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  locale: Locale;
  mustChangePassword: boolean;
  passwordChangedAt: Date | null;
  passwordExpiresAt: Date | null;
  isActive: boolean;
  failedLoginAttempts: number;
  lastFailedLogin: Date | null;
  accountLockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe user representation without sensitive fields */
export interface UserPublic {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  locale: Locale;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
