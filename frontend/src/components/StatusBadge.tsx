import React from "react";
import { RepairStatus, DeliveryStatus } from "../types";

export const StatusBadge: React.FC<{
  status: RepairStatus | DeliveryStatus;
  type?: "repair" | "delivery";
}> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "SUBMITTED":
      case "SCHEDULED":
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "UNDER_INSPECTION":
      case "ASSIGNED":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "AWAITING_APPROVAL":
        return "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "APPROVED":
        return "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "IN_REPAIR":
      case "IN_TRANSIT":
        return "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 animate-pulse";
      case "REPAIR_COMPLETED":
      case "READY_FOR_PICKUP":
        return "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "DELIVERED":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "CLOSED":
      case "COMPLETED":
        return "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "REJECTED":
      case "CANCELLED":
      case "FAILED":
        return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, " ");
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {formatText(status)}
    </span>
  );
};
