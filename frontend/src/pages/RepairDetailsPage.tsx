import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { RepairRequest } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Truck,
  MapPin,
  UserCheck,
} from "lucide-react";

export const RepairDetailsPage: React.FC = () => {
  const { quickLogin } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [repair, setRepair] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      api
        .getRepairById(parseInt(id, 10))
        .then(setRepair)
        .catch((err) => setError(err.message || "Failed to load repair details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400 text-sm">
        Loading audit timeline...
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Denied or Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error || "The requested repair record does not exist."}</p>
        <Link to="/" className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                {repair.requestNumber}
              </span>
              <StatusBadge status={repair.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {repair.deviceBrand ? `${repair.deviceBrand} ` : ""}
              {repair.deviceModel || repair.deviceType}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <div>Submitted: {new Date(repair.createdAt).toLocaleDateString()}</div>
            {repair.closedAt && (
              <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                Closed: {new Date(repair.closedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Device Category</span>
            <span className="font-semibold text-slate-900 dark:text-white">{repair.deviceType}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Serial / IMEI</span>
            <span className="font-semibold text-slate-900 dark:text-white">{repair.serialNumber || "N/A"}</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Estimated Cost</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {repair.estimatedCost ? `₹${repair.estimatedCost}` : "Pending"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Final Invoiced Cost</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {repair.finalCost ? `₹${repair.finalCost}` : "In Progress"}
            </span>
          </div>
        </div>

        {/* Assigned Operations Partners Card */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Assigned Nagpur Service Centre
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                {repair.vendor?.name || "Apex MicroTech (Dharampeth, Nagpur)"}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Phone: {repair.vendor?.phone || "+91 98230 22001"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Demo Login: <code className="font-mono font-bold text-amber-700 dark:text-amber-300">{repair.vendor?.email || "vendor1@rrcms.local"}</code>
              </p>
            </div>

            {repair.vendor?.email && (
              <button
                onClick={async () => {
                  await quickLogin(repair.vendor!.email);
                  navigate("/vendor/dashboard");
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs self-start"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Switch to this Workshop (Vendor)
              </button>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Assigned Logistics Partner (Doorstep Trips)
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                {repair.deliveries?.[0]?.assignedPartner?.name || "OrangeCity Express (Ramdaspeth)"}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Phone: {repair.deliveries?.[0]?.assignedPartner?.phone || "+91 98230 44002"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Demo Login: <code className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {repair.deliveries?.[0]?.assignedPartner?.email || "delivery2@rrcms.local"}
                </code>
              </p>
            </div>

            {repair.deliveries?.[0]?.assignedPartner?.email && (
              <button
                onClick={async () => {
                  await quickLogin(repair.deliveries![0].assignedPartner!.email);
                  navigate("/delivery/dashboard");
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs self-start"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Switch to this Courier Partner
              </button>
            )}
          </div>
        </div>

        {/* Doorstep Pickup Badge if applicable */}
        {repair.pickupRequested && (
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-xs text-sky-900 dark:text-sky-200 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              Doorstep Collection in Nagpur requested at: <strong>{repair.pickupAddress}</strong>
            </span>
          </div>
        )}

        {/* Symptoms & Notes */}
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Customer Reported Symptoms:</h3>
            <p className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
              {repair.issueDescription}
            </p>
          </div>

          {repair.diagnosisNotes && (
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Technician Diagnostic Findings:</h3>
              <p className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 leading-relaxed">
                {repair.diagnosisNotes}
              </p>
            </div>
          )}

          {repair.repairNotes && (
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Workshop Repair Log:</h3>
              <p className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {repair.repairNotes}
              </p>
            </div>
          )}
        </div>

        {/* Attached Device Image */}
        {repair.imageUrl && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Attached Hardware Photo:</h3>
            <img
              src={`http://localhost:5000${repair.imageUrl}`}
              alt="Device damage"
              className="max-h-64 rounded-2xl border border-slate-200 dark:border-slate-700 object-contain bg-slate-50 dark:bg-slate-800 p-1"
            />
          </div>
        )}
      </div>

      {/* Audit Trail: Status History */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Immutable Audit History Log
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {repair.statusHistory?.length || 0} State Transitions Recorded
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {repair.statusHistory?.map((history) => (
            <div key={history.id} className="relative space-y-1">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-4 ring-white dark:ring-slate-900" />
              <div className="flex items-center gap-2">
                <StatusBadge status={history.newStatus} />
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(history.changedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {history.note || "Status updated."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
