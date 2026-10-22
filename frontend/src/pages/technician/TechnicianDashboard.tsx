import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { RepairRequest } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import {
  Wrench,
  CheckCircle,
  FileEdit,
  ChevronRight,
} from "lucide-react";

export const TechnicianDashboard: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [progressModalRepair, setProgressModalRepair] = useState<RepairRequest | null>(null);
  const [completeModalRepair, setCompleteModalRepair] = useState<RepairRequest | null>(null);

  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [repairNotes, setRepairNotes] = useState("");

  const [finalCost, setFinalCost] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const openProgressModal = (repair: RepairRequest) => {
    setProgressModalRepair(repair);
    setDiagnosisNotes(repair.diagnosisNotes || "");
    setRepairNotes(repair.repairNotes || "");
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressModalRepair) return;
    try {
      setActionLoading(true);
      await api.updateProgress(progressModalRepair.id, {
        diagnosisNotes,
        repairNotes,
      });
      setMessage({ text: "Diagnostic notes and repair progress updated.", type: "success" });
      setProgressModalRepair(null);
      await fetchRepairs();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update progress", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteModal = (repair: RepairRequest) => {
    setCompleteModalRepair(repair);
    setFinalCost(repair.estimatedCost ? String(repair.estimatedCost) : "");
    setCompleteNotes("All 12 hardware stress tests and screen calibration completed.");
  };

  const handleCompleteRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalRepair) return;
    try {
      setActionLoading(true);
      await api.completeRepair(completeModalRepair.id, {
        finalCost: finalCost ? parseFloat(finalCost) : undefined,
        notes: completeNotes,
      });
      setMessage({ text: "Repair marked complete and eligible for delivery dispatch!", type: "success" });
      setCompleteModalRepair(null);
      await fetchRepairs();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to complete repair", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Technician Diagnostic Workspace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nagpur Workshop Workbench · Hardware diagnosis, component repairs, and QA certification
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
          Loading assigned workbench repairs...
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white text-sm">Assigned Workbench Tasks</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{repairs.length} devices in queue</span>
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

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Reported Issue:</strong> {repair.issueDescription}
                  </p>

                  {repair.diagnosisNotes && (
                    <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/60">
                      <strong>Diagnosis:</strong> {repair.diagnosisNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start lg:self-center">
                  {repair.status === "IN_REPAIR" && (
                    <>
                      <button
                        onClick={() => openProgressModal(repair)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Log Progress
                      </button>
                      <button
                        onClick={() => openCompleteModal(repair)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Complete
                      </button>
                    </>
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

      {/* Modal: Update Progress */}
      {progressModalRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Notes for {progressModalRepair.requestNumber}
            </h3>

            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hardware Diagnostic Notes
                </label>
                <textarea
                  rows={3}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="e.g. Multimeter check shows short on 5V power rail..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Repair Progress & Component Work Done
                </label>
                <textarea
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="e.g. Replaced capacitor C42, reassembled casing, commencing battery cycle test..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProgressModalRepair(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Repair */}
      {completeModalRepair && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Certify Repair Completion: {completeModalRepair.requestNumber}
            </h3>

            <form onSubmit={handleCompleteRepair} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Final Cost (₹)
                </label>
                <input
                  type="number"
                  step="50"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="Final invoiced cost"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quality Assurance & Handover Summary
                </label>
                <textarea
                  rows={3}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="e.g. All 12 hardware stress tests passed. Screen calibrated. Packaged securely."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalRepair(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? "Completing..." : "Certify Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
