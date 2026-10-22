import React from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, Truck, Clock, ShieldCheck, Scale } from "lucide-react";

export const TermsPage: React.FC = () => {
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
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Standard Service Agreement · RRCMS Remote Electronics Repair Operations (Nagpur Jurisdiction)
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          These Terms and Conditions govern the intake, doorstep transportation, diagnostic evaluation, component repair,
          and return handover of electronic devices managed via the <strong>Remote Repair Centre Management System (RRCMS)</strong>.
          By booking a service ticket, you agree to these operational terms.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Mandatory Estimate Approval
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Zero surprise fees. No physical chip repair begins until the customer formally reviews and approves the estimate in their portal.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Component Warranty
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All vendor-installed replacement ICs and display panels carry a standard 30-day functional warranty post-delivery.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            Nagpur Doorstep Transit
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Verified custody handovers between customer, courier, and authorized service centers with automated status audit trails.
          </p>
        </div>
      </div>

      {/* Detailed Articles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Doorstep Pickup & Custody Handover
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            When opting for doorstep pickup within Nagpur municipal limits, the customer must ensure the device is powered off and ready for pickup at the scheduled address. Our verified delivery partner will verify device serial identifiers against the active ticket before accepting custody.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Diagnostic Estimates & Customer Authorization
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Upon physical intake at an authorized Nagpur repair centre (e.g., Apex MicroTech Dharampeth or Vidarbha Electronics Sitabuldi), a qualified technician performs initial bench diagnostics. An itemized estimate (cost in INR and estimated turnaround days) is uploaded:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
            <li><strong>Approval:</strong> The ticket advances to technician assignment and repair execution.</li>
            <li><strong>Rejection:</strong> The repair is halted, and the device is scheduled for return dispatch with a nominal inspection fee of ₹150.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Delivery Attempt Protocol & Failure Handling
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            If the customer is unavailable, the address is unreachable, or recipient verification fails during return delivery, the courier will record a <span className="font-semibold text-red-600 dark:text-red-400">DELIVERY_FAILED</span> state with reason notes. The device safely returns to the hub, and the order transitions back to <code>READY_FOR_PICKUP</code> for seamless re-scheduling.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Limitation of Liability & Data Backup
          </h2>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Customers are solely responsible for backing up personal data prior to handover. RRCMS and authorized service centres are not liable for pre-existing internal board corrosion, logic board failure due to prior liquid damage, or data loss occurring during hardware reflow or firmware flashing.
            </p>
          </div>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Unclaimed Devices & Jurisdiction
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Devices left uncollected or without customer response for more than 45 days following repair completion will be subject to storage fees of ₹20/day and subsequent recycling disposition. All disputes are subject to the exclusive jurisdiction of the competent courts in Nagpur, Maharashtra.
          </p>
        </section>
      </div>
    </div>
  );
};
