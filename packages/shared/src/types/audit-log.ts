export interface AuditLog {
  id: number;
  tenantId: number | null;
  userId: number | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
}
