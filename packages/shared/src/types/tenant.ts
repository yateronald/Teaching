import { Locale, PlanType, TenantStatus } from './enums';

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: TenantStatus;
  plan: PlanType;
  schemaName: string;
  defaultLocale: Locale;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  displayName: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  storageUsedBytes: bigint;
  storageMaxBytes: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  defaultLocale: Locale;
}
