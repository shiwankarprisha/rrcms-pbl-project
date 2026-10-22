import {
  User,
  RepairRequest,
  PickupDelivery,
  RepairStatus,
  DeliveryStatus,
  Notification,
} from "../types";

const API_BASE_URL = "http://localhost:5000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("rrcms_token");

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMessage = data.error || "An unexpected network error occurred.";
    if (data.details && Array.isArray(data.details) && data.details.length > 0) {
      const detailsStr = data.details
        .map((d: any) => `${d.field ? `${d.field}: ` : ""}${d.message}`)
        .join("; ");
      errorMessage = `${errorMessage} (${detailsStr})`;
    }
    throw new Error(errorMessage);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  register: (body: any) => request<{ user: User; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request<{ user: User; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request<User>("/auth/me"),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  // Users
  getTechnicians: () => request<User[]>("/users/technicians"),
  getDeliveryPartners: () => request<User[]>("/users/delivery-partners"),
  getVendors: () => request<User[]>("/users/vendors"),
  updateProfile: (body: any) => request<User>("/users/profile", { method: "PATCH", body: JSON.stringify(body) }),

  // Repairs
  createRepair: (formData: FormData) => request<RepairRequest>("/repairs", { method: "POST", body: formData }),
  getRepairs: (status?: RepairStatus) => request<RepairRequest[]>(status ? `/repairs?status=${status}` : "/repairs"),
  getRepairById: (id: number) => request<RepairRequest>(`/repairs/${id}`),
  verifyRepair: (id: number, body: { decision: "ACCEPT" | "REJECT"; notes?: string; vendorId?: number }) =>
    request<RepairRequest>(`/repairs/${id}/verify`, { method: "PATCH", body: JSON.stringify(body) }),
  createEstimate: (id: number, body: { estimatedCost: number; estimatedDays: number; estimateNotes?: string }) =>
    request<RepairRequest>(`/repairs/${id}/estimate`, { method: "POST", body: JSON.stringify(body) }),
  respondToEstimate: (id: number, body: { action: "APPROVE" | "REJECT"; notes?: string }) =>
    request<RepairRequest>(`/repairs/${id}/estimate`, { method: "PATCH", body: JSON.stringify(body) }),
  assignTechnician: (id: number, body: { technicianId: number; notes?: string }) =>
    request<{ repair: RepairRequest }>(`/repairs/${id}/assign`, { method: "POST", body: JSON.stringify(body) }),
  updateProgress: (id: number, body: { diagnosisNotes?: string; repairNotes?: string }) =>
    request<RepairRequest>(`/repairs/${id}/progress`, { method: "PATCH", body: JSON.stringify(body) }),
  completeRepair: (id: number, body: { finalCost?: number; notes?: string }) =>
    request<RepairRequest>(`/repairs/${id}/complete`, { method: "PATCH", body: JSON.stringify(body) }),

  // Deliveries
  scheduleDelivery: (body: any) => request<PickupDelivery>("/delivery/schedule", { method: "POST", body: JSON.stringify(body) }),
  getDeliveries: (status?: DeliveryStatus) => request<PickupDelivery[]>(status ? `/delivery?status=${status}` : "/delivery"),
  getDeliveryById: (id: number) => request<PickupDelivery>(`/delivery/${id}`),
  assignDeliveryPartner: (id: number, body: { assignedPartnerId: number }) =>
    request<PickupDelivery>(`/delivery/${id}/assign`, { method: "POST", body: JSON.stringify(body) }),
  updateDeliveryStatus: (id: number, body: { status: DeliveryStatus; deliveryNotes?: string }) =>
    request<PickupDelivery>(`/delivery/${id}/status`, { method: "PATCH", body: JSON.stringify(body) }),
  confirmReceipt: (deliveryId: number, body: { notes?: string }) =>
    request<{ delivery: PickupDelivery; repair: RepairRequest }>(`/delivery/${deliveryId}/confirm-receipt`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Notifications
  getNotifications: () => request<Notification[]>("/notifications"),
  markNotificationAsRead: (id: number) => request<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsAsRead: () => request<{ message: string }>("/notifications/read-all", { method: "PATCH" }),
    clearAllNotifications: () =>
    request<{ message: string }>("/notifications/clear-all", { method: "DELETE" }),
};
