import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Shield, FileText, MapPin, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Wrench className="w-4 h-4" />
              </div>
              <span>RRCMS</span>
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                Remote Repair Centre
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              A full-lifecycle electronics repair management system engineered for Nagpur operations.
              Coordinating doorstep logistics, transparent cost estimation, certified technician workflows,
              and auditable multi-stakeholder tracking.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Nagpur Hubs: Dharampeth · Sitabuldi · Pratap Nagar · Ramdaspeth · Civil Lines</span>
            </div>
          </div>

          {/* Quick Legal & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal & Compliance
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & System Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Project Information
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Software Engineering Individual PBL Project
              <br />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Third-Year CSE · Academic Year 2026</span>
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Nagpur Services Operational
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} RRCMS Platform. Developed for Software Engineering PBL.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for reliable device repair
          </p>
        </div>
      </div>
    </footer>
  );
};
