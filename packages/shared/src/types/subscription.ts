import { PlanType, SubscriptionInterval } from './enums';

export interface Subscription {
  id: number;
  tenantId: number;
  plan: PlanType;
  interval: SubscriptionInterval;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  gracePeriodEnd: Date | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: number;
  type: PlanType;
  nameEn: string;
  nameFr: string;
  descriptionEn: string | null;
  descriptionFr: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  maxUsers: number;
  maxStorageBytes: bigint;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  features: Record<string, boolean>;
  createdAt: Date;
}
