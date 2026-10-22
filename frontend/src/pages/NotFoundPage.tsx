import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Home, LayoutDashboard, ArrowLeft, Shield, FileText } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    switch (role) {
      case "ADMIN":
        return "/admin/dashboard";
      case "VENDOR":
        return "/vendor/dashboard";
      case "TECHNICIAN":
        return "/technician/dashboard";
      case "DELIVERY_PARTNER":
        return "/delivery/dashboard";
      case "CUSTOMER":
      default:
        return "/customer/dashboard";
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
            Error 404 · Route Unresolved
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The page or operational endpoint you are looking for does not exist or may have been relocated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {user ? (
            <Link
              to={getDashboardPath()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
            >
              <Home className="w-4 h-4" />
              Log In to Portal
            </Link>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Home
          </Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
};
