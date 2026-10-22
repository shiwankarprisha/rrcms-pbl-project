import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock, HardDrive, UserCheck, EyeOff, FileText, CheckCircle } from "lucide-react";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Effective Date: Academic Session 2026 · Remote Repair Centre Management System (RRCMS Nagpur Hub)
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          At <strong>RRCMS</strong>, we respect your privacy and are committed to protecting the personal data
          and device integrity of all customers, service vendors, certified technicians, and delivery personnel
          utilizing our platform. This policy outlines our data handling practices for remote repair requests.
        </p>
      </div>

      {/* Key Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <HardDrive className="w-4 h-4" />
            Device Data Protection
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Technicians operate strictly on board-level hardware diagnostics. Customer personal storage, files,
            and software accounts are strictly off-limits. Customers are encouraged to back up sensitive data.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <EyeOff className="w-4 h-4" />
            Zero Advertising Trackers
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            RRCMS does not utilize third-party ad networks, telemetry trackers, or profiling scripts. We do not sell or
            monetize user contact numbers or address information.
          </p>
        </div>
      </div>

      {/* Detailed Articles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            1. Information We Collect
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            We collect only the minimum required information to fulfill the hardware repair and doorstep logistics:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-2">
            <li>
              <strong>Account Information:</strong> Name, valid email address, role, and securely salted bcrypt password hashes.
            </li>
            <li>
              <strong>Logistics Coordinates:</strong> Physical street addresses within Nagpur jurisdiction for doorstep pickup and return delivery.
            </li>
            <li>
              <strong>Hardware Specifications:</strong> Device category (Laptop, Smartphone, Tablet), brand, model number, serial number, and reported symptoms.
            </li>
            <li>
              <strong>Operational Audit Trails:</strong> Timestamped status transitions, diagnostic logs, approved cost estimates, and courier handover receipts.
            </li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            2. Role-Based Access Control (RBAC) & Data Compartmentalization
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Information is strictly compartmentalized based on system role:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white">Delivery Couriers</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Can view only customer name, pickup/delivery address, and contact number. Cannot view internal diagnostic notes or technical cost breakdowns.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white">Diagnostic Technicians</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Can view hardware specs and reported issues to perform component repair. Full customer home addresses are hidden from technical bench personnel.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            3. Authentication & Storage Security
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All authentication tokens are transmitted via industry-standard JSON Web Tokens (JWT) signed with HMAC-SHA256. Passwords are never stored in plain text and are hashed using salted bcrypt rounds. Data is stored on a dedicated MySQL database with transactional consistency.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            4. Inquiries & Data Rights
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Customers have the right to inspect their complete repair audit trail at any time via the Repair Details view. For inquiries regarding data retention or academic demonstration details, contact the project coordinator at <code className="text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">support@rrcms.local</code>.
          </p>
        </section>
      </div>
    </div>
  );
};
