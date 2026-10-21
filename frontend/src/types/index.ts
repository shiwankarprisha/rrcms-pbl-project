export type UserRole =
  | "ADMIN"
  | "CUSTOMER"
  | "VENDOR"
  | "TECHNICIAN"
  | "DELIVERY_PARTNER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  createdAt?: string;
}

export type RepairStatus =
  | "SUBMITTED"
  | "UNDER_INSPECTION"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "IN_REPAIR"
  | "REPAIR_COMPLETED"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CLOSED"
  | "CANCELLED";

export type DeliveryType = "PICKUP" | "DELIVERY";

export type DeliveryStatus =
  | "SCHEDULED"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type EstimateStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface RepairStatusHistory {
  id: number;
  repairId: number;
  oldStatus?: RepairStatus | null;
  newStatus: RepairStatus;
  changedById?: number | null;
  note?: string | null;
  changedAt: string;
}

export interface DeliveryStatusHistory {
  id: number;
  deliveryId: number;
  oldStatus?: DeliveryStatus | null;
  newStatus: DeliveryStatus;
  changedById?: number | null;
  note?: string | null;
  changedAt: string;
}

export interface TechnicianAssignment {
  id: number;
  repairId: number;
  technicianId: number;
  status: string;
  assignedAt: string;
  completedAt?: string | null;
  notes?: string | null;
  technician?: User;
}

export interface PickupDelivery {
  id: number;
  repairId: number;
  assignedPartnerId?: number | null;
  type: DeliveryType;
  status: DeliveryStatus;
  scheduledAt: string;
  address: string;
  customerNotes?: string | null;
  deliveryNotes?: string | null;
  completedAt?: string | null;
  customerConfirmed: boolean;
  confirmedAt?: string | null;
  assignedPartner?: User | null;
  history?: DeliveryStatusHistory[];
  repair?: RepairRequest;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead?: boolean;
  read?: boolean;
  linkUrl?: string | null;
  link?: string | null;
  type?: string;
  createdAt: string;
}

export interface RepairRequest {
  id: number;
  requestNumber: string;
  customerId: number;
  vendorId?: number | null;
  deviceType: string;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  serialNumber?: string | null;
  issueDescription: string;
  status: RepairStatus;
  estimatedCost?: number | string | null;
  finalCost?: number | string | null;
  estimatedDays?: number | null;
  estimateNotes?: string | null;
  estimateStatus?: EstimateStatus | null;
  diagnosisNotes?: string | null;
  repairNotes?: string | null;
  imageUrl?: string | null;
  pickupRequested?: boolean;
  pickupAddress?: string | null;
  receivedAt: string;
  repairCompletedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  vendor?: User | null;
  assignments?: TechnicianAssignment[];
  deliveries?: PickupDelivery[];
  statusHistory?: RepairStatusHistory[];
}
