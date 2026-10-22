import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { RepairRequest, PickupDelivery, User } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import {
  ShieldCheck,
  Truck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [deliveries, setDeliveries] = useState<PickupDelivery[]>([]);
  const [partners, setPartners] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"repairs" | "deliveries">("repairs");
  const [loading, setLoading] = useState(true);

  // Delivery Scheduling Modal
  const [scheduleModalRepair, setScheduleModalRepair] = useState<RepairRequest | null>(null);
  const [deliveryType, setDeliveryType] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | "">("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [repairsData, deliveriesData, partnersData] = await Promise.all([
        api.getRepairs(),
        api.getDeliveries(),
        api.getDeliveryPartners().catch(() => []),
      ]);
      setRepairs(repairsData);
      setDeliveries(deliveriesData);
      setPartners(partnersData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openScheduleModal = (repair: RepairRequest) => {
    setScheduleModalRepair(repair);
    setDeliveryAddress(
      repair.pickupAddress || "Flat 204, Royal Palms, Civil Lines, Nagpur 440001"
    );
  };

  const handleScheduleDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalRepair) return;
    try {
      setActionLoading(true);
      await api.scheduleDelivery({
        repairId: scheduleModalRepair.id,
        type: deliveryType,
        scheduledAt: new Date(deliveryDate).toISOString(),
        address: deliveryAddress,
        assignedPartnerId: selectedPartnerId ? Number(selectedPartnerId) : undefined,
      });
      setMessage({
        text: `Handover successful! ${deliveryType} dispatch scheduled in Nagpur and linked to repair.`,
        type: "success",
      });
      setScheduleModalRepair(null);
      await fetchAll();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to schedule delivery", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Administrative Operations Command · Nagpur HQ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cross-module synchronization between Repair Management and Pickup & Delivery
          </p>
        </div>

        {/* Stats Pill Row */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
            {repairs.length} Total Repairs
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
            {deliveries.length} Deliveries
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("repairs")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "repairs"
              ? "border-purple-600 text-purple-700 dark:text-purple-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Repair Requests ({repairs.length})
        </button>
        <button
          onClick={() => setActiveTab("deliveries")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === "deliveries"
              ? "border-purple-600 text-purple-700 dark:text-purple-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Pickup & Delivery Schedules ({deliveries.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
          Loading operations data...
        </div>
      ) : activeTab === "repairs" ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {repairs.map((repair) => (
              <div
                key={repair.id}
                className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {repair.requestNumber}
                    </span>
                    <StatusBadge status={repair.status} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {repair.deviceBrand ? `${repair.deviceBrand} ` : ""}
                    {repair.deviceModel || repair.deviceType}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Customer: <strong>{repair.customer?.name}</strong> · Issue: {repair.issueDescription}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-center">
                  {/* Module Integration: Handover or Reschedule eligible repaired/ready device */}
                  {(repair.status === "REPAIR_COMPLETED" || repair.status === "READY_FOR_PICKUP") && (
                    <button
                      onClick={() => openScheduleModal(repair)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {repair.status === "READY_FOR_PICKUP" ? "Reschedule Delivery" : "Handover for Delivery"}
                    </button>
                  )}

                  <Link
                    to={`/repairs/${repair.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Audit View"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {delivery.type}
                    </span>
                    <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                      Linked Repair #{delivery.repair?.requestNumber}
                    </span>
                    <StatusBadge status={delivery.status} type="delivery" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Address:</strong> {delivery.address}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Partner: <strong>{delivery.assignedPartner?.name || "Unassigned"}</strong> · Scheduled:{" "}
                    {new Date(delivery.scheduledAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Customer Receipt:{" "}
                  {delivery.customerConfirmed ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Confirmed ✓</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-bold">Pending Receipt</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Schedule Delivery Handover */}
      {scheduleModalRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Dispatch Handover: {scheduleModalRepair.requestNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Schedule doorstep dispatch in Nagpur and assign a logistics partner.
            </p>

            <form onSubmit={handleScheduleDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Type
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="DELIVERY">Return Delivery (Repaired Device to Nagpur Customer)</option>
                  <option value="PICKUP">Initial Pickup (From Customer to Service Centre)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nagpur Destination Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Civil Lines, Dharampeth, Ramdaspeth, Pratap Nagar, Nagpur"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Nagpur Delivery Partner
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Assign later / Unassigned --</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone || "No phone"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalRepair(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {actionLoading ? "Scheduling..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
