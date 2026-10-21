import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { RepairRequest, User } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Calculator,
  UserCheck,
  ChevronRight,
  Truck,
} from "lucide-react";

export const VendorDashboard: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Action states
  const [estimateModalRepair, setEstimateModalRepair] = useState<RepairRequest | null>(null);
  const [assignModalRepair, setAssignModalRepair] = useState<RepairRequest | null>(null);
  const [deliveryModalRepair, setDeliveryModalRepair] = useState<RepairRequest | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );

  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("3");
  const [estimateNotes, setEstimateNotes] = useState("");

  const [selectedTechId, setSelectedTechId] = useState<number | "">("");
  const [assignNotes, setAssignNotes] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [repairsData, techData] = await Promise.all([
        api.getRepairs(),
        api.getTechnicians().catch(() => []),
      ]);
      setRepairs(repairsData);
      setTechnicians(techData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (repairId: number, decision: "ACCEPT" | "REJECT") => {
    try {
      setActionLoading(true);
      await api.verifyRepair(repairId, { decision, notes: `Vendor ${decision.toLowerCase()}ed request` });
      setMessage({ text: `Repair request ${decision.toLowerCase()}ed successfully.`, type: "success" });
      await fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || "Action failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimateModalRepair) return;
    try {
      setActionLoading(true);
      await api.createEstimate(estimateModalRepair.id, {
        estimatedCost: parseFloat(estimatedCost),
        estimatedDays: parseInt(estimatedDays, 10),
        estimateNotes,
      });
      setMessage({ text: "Estimate generated and sent for customer approval.", type: "success" });
      setEstimateModalRepair(null);
      setEstimatedCost("");
      setEstimateNotes("");
      await fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to create estimate", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalRepair || !selectedTechId) return;
    try {
      setActionLoading(true);
      await api.assignTechnician(assignModalRepair.id, {
        technicianId: Number(selectedTechId),
        notes: assignNotes,
      });
      setMessage({ text: "Technician assigned! Repair is now in progress.", type: "success" });
      setAssignModalRepair(null);
      setSelectedTechId("");
      setAssignNotes("");
      await fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to assign technician", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeliveryModal = (repair: RepairRequest) => {
    setDeliveryModalRepair(repair);
    setDeliveryAddress(repair.pickupAddress || "Civil Lines, Nagpur 440001");
  };

  const handleScheduleDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalRepair) return;
    try {
      setActionLoading(true);
      await api.scheduleDelivery({
        repairId: deliveryModalRepair.id,
        type: "DELIVERY",
        scheduledAt: new Date(deliveryDate).toISOString(),
        address: deliveryAddress,
      });
      setMessage({
        text: "Return delivery successfully dispatched! Closest Nagpur courier partner automatically assigned.",
        type: "success",
      });
      setDeliveryModalRepair(null);
      await fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to dispatch return delivery", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Operations Workspace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nagpur Authorized Service Centre · Verify requests, issue estimates, and assign workshop technicians
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
          Loading workspace requests...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white text-sm">Active Repair Requests Queue</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{repairs.length} total records</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {repairs.map((repair) => (
              <div
                key={repair.id}
                className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
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

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {repair.issueDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Customer: <strong>{repair.customer?.name}</strong></span>
                    <span>Cost: <strong>{repair.estimatedCost ? `₹${repair.estimatedCost}` : "Unestimated"}</strong></span>
                    {repair.pickupRequested && (
                      <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-medium">
                        <Truck className="w-3 h-3" /> Nagpur Doorstep Pickup
                      </span>
                    )}
                  </div>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                  {/* Step 1: Verification */}
                  {repair.status === "SUBMITTED" && (
                    <>
                      <button
                        onClick={() => handleVerify(repair.id, "ACCEPT")}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleVerify(repair.id, "REJECT")}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}

                  {/* Step 2: Estimate Generation */}
                  {repair.status === "UNDER_INSPECTION" && (
                    <button
                      onClick={() => setEstimateModalRepair(repair)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-2xs"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Create Estimate
                    </button>
                  )}

                  {/* Step 3: Technician Assignment */}
                  {repair.status === "APPROVED" && (
                    <button
                      onClick={() => setAssignModalRepair(repair)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shadow-2xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Assign Technician
                    </button>
                  )}

                  {/* Step 4: Dispatch Return Delivery */}
                  {(repair.status === "REPAIR_COMPLETED" || repair.status === "READY_FOR_PICKUP") && (
                    <button
                      onClick={() => openDeliveryModal(repair)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {repair.status === "READY_FOR_PICKUP" ? "Reschedule Delivery" : "Dispatch Return Delivery"}
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
      )}

      {/* Modal: Create Estimate */}
      {estimateModalRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Generate Estimate for {estimateModalRepair.requestNumber}
            </h3>

            <form onSubmit={handleCreateEstimate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Repair Cost (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Turnaround Days *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parts & Labour Notes (Visible to Customer)
                </label>
                <textarea
                  rows={3}
                  value={estimateNotes}
                  onChange={(e) => setEstimateNotes(e.target.value)}
                  placeholder="e.g. Replacement battery + motherboard connector reflow..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEstimateModalRepair(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Send Estimate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Technician */}
      {assignModalRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Assign Technician to {assignModalRepair.requestNumber}
            </h3>

            <form onSubmit={handleAssignTechnician} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Workshop Technician *
                </label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose active technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technician Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Special instructions, handling notes, or priority alerts..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalRepair(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !selectedTechId}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {actionLoading ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dispatch Return Delivery */}
      {deliveryModalRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Dispatch Repaired Device: {deliveryModalRepair.requestNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shortest-distance routing automatically connects this dispatch to the closest available Nagpur courier partner.
            </p>

            <form onSubmit={handleScheduleDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Delivery Date *
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
                  Customer Destination Address in Nagpur *
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

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
                <span className="font-bold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Automated Courier Routing:
                </span>
                <p className="text-[11px] opacity-90">
                  The system will instantly calculate the closest logistics partner based on distance and notify them immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveryModalRepair(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? "Scheduling..." : "Confirm Dispatch Handover"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
