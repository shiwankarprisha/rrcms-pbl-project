import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { PickupDelivery, DeliveryStatus } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Clock,
  ArrowRight,
  Building2,
  User,
  X,
} from "lucide-react";

export const DeliveryPartnerDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<PickupDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Failure modal state
  const [failureModalDelivery, setFailureModalDelivery] = useState<PickupDelivery | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [customFailureNote, setCustomFailureNote] = useState("");

  const fetchDeliveries = async () => {
    try {
      const data = await api.getDeliveries();
      setDeliveries(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (id: number, status: DeliveryStatus, notes: string) => {
    try {
      setActionLoading(id);
      await api.updateDeliveryStatus(id, { status, deliveryNotes: notes });
      setMessage({
        text: `Trip #${id} updated to ${status}.${
          status === "FAILED"
            ? " The repair status has been recovered cleanly for re-dispatch."
            : ""
        }`,
        type: "success",
      });
      await fetchDeliveries();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update status", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmFailure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!failureModalDelivery) return;

    const fullNote = customFailureNote.trim()
      ? `${failureReason}: ${customFailureNote.trim()}`
      : failureReason || "Delivery attempt failed; customer unavailable.";

    await handleUpdateStatus(failureModalDelivery.id, "FAILED", fullNote);
    setFailureModalDelivery(null);
    setFailureReason("");
    setCustomFailureNote("");
  };

  const failurePresets = [
    "Customer unavailable at given address",
    "Customer requested reschedule for tomorrow",
    "Premises locked / could not contact phone",
    "Customer address not traceable in locality",
    "Device was not packed or ready for pickup",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Delivery Partner Logistics Portal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nagpur Logistics Dispatches · Manage assigned doorstep pickups and return deliveries with live status synchronization
        </p>
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

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
          Loading assigned trips...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          No delivery trips currently assigned to you.
        </div>
      ) : (
        <div className="grid gap-5">
          {deliveries.map((delivery) => {
            const isPickup = delivery.type === "PICKUP";
            const customerName = delivery.repair?.customer?.name || "Customer";
            const customerPhone = delivery.repair?.customer?.phone || "N/A";
            const workshopName = delivery.repair?.vendor?.name || "Authorized Service Centre (Nagpur)";
            const workshopPhone = delivery.repair?.vendor?.phone || "+91 98230 22001";

            return (
              <div
                key={delivery.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4"
              >
                {/* Header row: type badge, repair reference, status, scheduled date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isPickup
                          ? "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                          : "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                      }`}
                    >
                      {isPickup ? "Doorstep Pickup Trip" : "Return Delivery Trip"}
                    </span>
                    <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                      Repair #{delivery.repair?.requestNumber}
                    </span>
                    <StatusBadge status={delivery.status} type="delivery" />
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Scheduled: {new Date(delivery.scheduledAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Logistics Route Visual Indicator */}
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Logistics Route:
                  </span>
                  <span>{isPickup ? "Customer Doorstep" : "Service Workshop"}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {isPickup ? "Service Workshop" : "Customer Doorstep"}
                  </span>
                </div>

                {/* Route Points: Origin & Destination */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  {/* Origin Card */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      {isPickup ? <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> : <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                      {isPickup ? "Pickup Point (Customer Doorstep)" : "Pickup Point (Workshop)"}
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {isPickup ? customerName : workshopName}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isPickup ? delivery.address : "Authorized Service Workshop, Nagpur"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {isPickup ? customerPhone : workshopPhone}
                    </p>
                  </div>

                  {/* Destination Card */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      {isPickup ? <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> : <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                      {isPickup ? "Delivery Point (Service Workshop)" : "Delivery Point (Customer Doorstep)"}
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {isPickup ? workshopName : customerName}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {isPickup ? "Authorized Service Workshop, Nagpur" : delivery.address}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {isPickup ? workshopPhone : customerPhone}
                    </p>
                  </div>
                </div>

                {/* Device summary */}
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                  <span>Device: <strong>{delivery.repair?.deviceType} ({delivery.repair?.deviceModel || "Standard"})</strong></span>
                  {delivery.customerNotes && (
                    <span className="italic truncate">Note: {delivery.customerNotes}</span>
                  )}
                </div>

                {/* Action Buttons for courier partner */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {delivery.status === "ASSIGNED" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          delivery.id,
                          "IN_TRANSIT",
                          isPickup
                            ? `Courier partner en route to customer location in Nagpur for device collection at ${new Date().toLocaleTimeString()}.`
                            : `Repaired device collected from workshop; out for return delivery at ${new Date().toLocaleTimeString()}.`
                        )
                      }
                      disabled={actionLoading === delivery.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-2xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {isPickup ? "Start Doorstep Pickup Trip" : "Start Return Transit (Out for Delivery)"}
                    </button>
                  )}

                  {delivery.status === "IN_TRANSIT" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            delivery.id,
                            "COMPLETED",
                            isPickup
                              ? `Device successfully collected from customer and delivered to service workshop at ${new Date().toLocaleTimeString()}.`
                              : `Repaired device handed over directly to customer at doorstep at ${new Date().toLocaleTimeString()}.`
                        )
                      }
                      disabled={actionLoading === delivery.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isPickup ? "Confirm Delivered to Workshop" : "Confirm Delivered to Customer"}
                    </button>

                    <button
                      onClick={() => {
                        setFailureModalDelivery(delivery);
                        setFailureReason(failurePresets[0]);
                      }}
                      disabled={actionLoading === delivery.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {isPickup ? "Mark Pickup Failed" : "Mark Delivery Failed"}
                    </button>
                  </>
                )}

                {delivery.status === "COMPLETED" && (
                  <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Trip completed successfully. {isPickup ? "Device delivered to workshop for inspection." : "Delivered to customer."}{" "}
                    {!isPickup && (
                      <strong>
                        ({delivery.customerConfirmed ? "Customer Confirmed ✓" : "Awaiting customer confirmation"})
                      </strong>
                    )}
                  </div>
                )}

                {delivery.status === "FAILED" && (
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Trip failed: {delivery.deliveryNotes || "Delivery attempt failed."} (System safely reset for re-dispatch)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Failure Reason Modal */}
      {failureModalDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Report {failureModalDelivery.type === "PICKUP" ? "Pickup" : "Delivery"} Failure
              </h3>
              <button
                onClick={() => setFailureModalDelivery(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Reporting a failure will update the trip history and safely revert the repair status so the operations team or customer can coordinate a reschedule.
            </p>

            <form onSubmit={handleConfirmFailure} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Reason:
                </label>
                <div className="space-y-1.5">
                  {failurePresets.map((preset) => (
                    <label
                      key={preset}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                        failureReason === preset
                          ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={preset}
                        checked={failureReason === preset}
                        onChange={(e) => setFailureReason(e.target.value)}
                        className="text-indigo-600"
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  value={customFailureNote}
                  onChange={(e) => setCustomFailureNote(e.target.value)}
                  placeholder="e.g. Called customer twice at +91... no answer."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFailureModalDelivery(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-2xs disabled:opacity-50"
                >
                  Confirm Failure & Reset Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
