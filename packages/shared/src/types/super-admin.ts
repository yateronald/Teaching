import { Locale } from './enums';

export interface SuperAdmin {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  locale: Locale;
  createdAt: Date;
  updatedAt: Date;
}
