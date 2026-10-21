import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { RepairRequest } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  PackageCheck,
  AlertTriangle,
  Truck,
  MapPin,
  RefreshCw,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export const CustomerDashboard: React.FC = () => {
  const { quickLogin } = useAuth();
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchRepairs = async () => {
    try {
      const data = await api.getRepairs();
      setRepairs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleEstimateResponse = async (
    repairId: number,
    action: "APPROVE" | "REJECT",
  ) => {
    try {
      setActionLoading(repairId);
      await api.respondToEstimate(repairId, { action });
      setMessage({
        text: `Estimate successfully ${action.toLowerCase()}ed.`,
        type: "success",
      });
      await fetchRepairs();
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to respond to estimate",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReceipt = async (deliveryId: number, repairId: number) => {
    try {
      setActionLoading(repairId);
      await api.confirmReceipt(deliveryId, {
        notes: "Customer confirmed receipt via dashboard",
      });
      setMessage({
        text: "Delivery receipt confirmed! Your repair request has been closed successfully.",
        type: "success",
      });
      await fetchRepairs();
    } catch (err: any) {
      setMessage({
        text: err.message || "Failed to confirm receipt",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Customer Repair Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track and manage your active Nagpur device repairs and deliveries
          </p>
        </div>
        <Link
          to="/customer/new-repair"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Repair Request
        </Link>
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
          Loading your repair requests...
        </div>
      ) : repairs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No repair requests found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You have not submitted any device repairs yet. Click below to submit
            your first repair request.
          </p>
          <Link
            to="/customer/new-repair"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Device Repair
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {repairs.map((repair) => {
            const activeDelivery = repair.deliveries?.find(
              (d) => d.type === "DELIVERY" && !d.customerConfirmed,
            );
            const failedDelivery = repair.deliveries?.find(
              (d) => d.type === "DELIVERY" && d.status === "FAILED",
            );
            const activePickup = repair.deliveries?.find(
              (d) => d.type === "PICKUP",
            );

            return (
              <div
                key={repair.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {repair.requestNumber}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {repair.deviceBrand ? `${repair.deviceBrand} ` : ""}
                      {repair.deviceModel || repair.deviceType}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={repair.status} />
                    <Link
                      to={`/repairs/${repair.id}`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title="View Full Timeline"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">
                      Device Type
                    </span>
                    {repair.deviceType}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">
                      Serial Number
                    </span>
                    {repair.serialNumber || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-700 dark:text-slate-300">
                      Estimated Cost
                    </span>
                    {repair.estimatedCost
                      ? `₹${repair.estimatedCost}`
                      : "Awaiting inspection"}
                  </div>
                </div>

                <div className="text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-0.5">
                    Reported Issue:
                  </span>
                  {repair.issueDescription}
                </div>

                {/* Assigned Nagpur Service Centre & Logistics Partner Information */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {/* Service Centre Card */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-slate-700 dark:text-slate-300 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Assigned Service Centre (Workshop)
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white mt-1">
                        {repair.vendor?.name ||
                          "Apex MicroTech (Dharampeth, Nagpur)"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Phone: {repair.vendor?.phone || "+91 98230 22001"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Demo Login:{" "}
                        <code className="font-mono font-bold text-amber-700 dark:text-amber-300">
                          {repair.vendor?.email || "vendor1@rrcms.local"}
                        </code>
                      </p>
                    </div>

                    {repair.vendor?.email && (
                      <button
                        onClick={async () => {
                          await quickLogin(repair.vendor!.email);
                          navigate("/vendor/dashboard");
                        }}
                        className="mt-2 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs self-start"
                      >
                        <UserCheck className="w-3 h-3" />
                        Switch to this Workshop (Vendor)
                      </button>
                    )}
                  </div>

                  {/* Courier Partner Card */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-slate-700 dark:text-slate-300 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Assigned Logistics Partner (Courier)
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white mt-1">
                        {activePickup?.assignedPartner?.name ||
                          activeDelivery?.assignedPartner?.name ||
                          "OrangeCity Express (Ramdaspeth)"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Phone:{" "}
                        {activePickup?.assignedPartner?.phone ||
                          activeDelivery?.assignedPartner?.phone ||
                          "+91 98230 44002"}{" "}
                        ·{" "}
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Status:{" "}
                          {activePickup?.status ||
                            activeDelivery?.status ||
                            "ASSIGNED"}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Demo Login:{" "}
                        <code className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          {activePickup?.assignedPartner?.email ||
                            activeDelivery?.assignedPartner?.email ||
                            "delivery2@rrcms.local"}
                        </code>
                      </p>
                    </div>

                    {(activePickup?.assignedPartner?.email ||
                      activeDelivery?.assignedPartner?.email) && (
                      <button
                        onClick={async () => {
                          const courierEmail =
                            activePickup?.assignedPartner?.email ||
                            activeDelivery?.assignedPartner?.email ||
                            "delivery2@rrcms.local";
                          await quickLogin(courierEmail);
                          navigate("/delivery/dashboard");
                        }}
                        className="mt-2 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs self-start"
                      >
                        <UserCheck className="w-3 h-3" />
                        Switch to this Courier Partner
                      </button>
                    )}
                  </div>
                </div>

                {/* Doorstep Pickup Information Banner */}
                {repair.pickupRequested && activePickup && (
                  <>
                    {activePickup.status === "FAILED" ? (
                      <div className="p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">
                            Doorstep Pickup Attempt Failed
                          </span>
                          <p className="opacity-90">
                            Reason:{" "}
                            <em>
                              "
                              {activePickup.deliveryNotes ||
                                "Courier could not reach doorstep"}
                              "
                            </em>
                            . The service centre will contact you to re-attempt
                            collection.
                          </p>
                        </div>
                      </div>
                    ) : activePickup.status === "COMPLETED" ? (
                      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          Device collected from your doorstep and safely
                          received at workshop by{" "}
                          <strong>
                            {activePickup.assignedPartner?.name ||
                              "Nagpur Courier Partner"}
                          </strong>
                          .
                        </span>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5">
                        <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">
                            {activePickup.status === "IN_TRANSIT"
                              ? "Courier Is En Route for Pickup!"
                              : "Doorstep Pickup Assigned & Scheduled"}{" "}
                            ·{" "}
                            {activePickup.assignedPartner?.name ||
                              "OrangeCity Express (Ramdaspeth)"}
                          </span>
                          <p className="opacity-90">
                            Address: <strong>{repair.pickupAddress}</strong> ·
                            Scheduled Date:{" "}
                            {new Date(
                              activePickup.scheduledAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Estimate Approval Banner */}
                {repair.status === "AWAITING_APPROVAL" && (
                  <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm dark:border-purple-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3 border-b border-purple-100 bg-purple-50 px-5 py-4 dark:border-purple-900 dark:bg-purple-950/40">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                          Repair Estimate Ready for Review
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-purple-800 dark:text-purple-300">
                          Review the proposed repair cost and turnaround time
                          before deciding whether to proceed.
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-purple-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300">
                        Action Required
                      </span>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Estimated Repair Cost
                          </span>
                          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                            {repair.estimatedCost != null
                              ? `₹${repair.estimatedCost}`
                              : "Not available"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Estimated Turnaround
                          </span>
                          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                            {repair.estimatedDays != null
                              ? `${repair.estimatedDays} days`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      {repair.estimateNotes && (
                        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Workshop Notes
                          </h4>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {repair.estimateNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
                        <button
                          onClick={() =>
                            handleEstimateResponse(repair.id, "REJECT")
                          }
                          disabled={actionLoading === repair.id}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          Reject Estimate
                        </button>

                        <button
                          onClick={() =>
                            handleEstimateResponse(repair.id, "APPROVE")
                          }
                          disabled={actionLoading === repair.id}
                          className="rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading === repair.id
                            ? "Processing..."
                            : "Approve Estimate"}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Delivery Failure Notice & Auto-Recovery Banner */}
                {failedDelivery && repair.status === "READY_FOR_PICKUP" && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Previous Delivery Attempt Failed · Status Recovered to
                        Ready for Dispatch
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Reason:{" "}
                        <em>
                          "
                          {failedDelivery.deliveryNotes ||
                            "Customer unavailable"}
                          "
                        </em>
                        . The service centre will reschedule doorstep delivery
                        or coordinate pickup.
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirm Receipt Banner */}
                {(repair.status === "DELIVERED" ||
                  (activeDelivery &&
                    activeDelivery.status === "COMPLETED")) && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                        <PackageCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        Device Delivered! Confirm Receipt to Close Request
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300">
                        Please confirm you have received your repaired device in
                        working condition.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        activeDelivery &&
                        handleConfirmReceipt(activeDelivery.id, repair.id)
                      }
                      disabled={actionLoading === repair.id || !activeDelivery}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs disabled:opacity-50 shrink-0"
                    >
                      {actionLoading === repair.id
                        ? "Confirming..."
                        : "Confirm Receipt & Close"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
