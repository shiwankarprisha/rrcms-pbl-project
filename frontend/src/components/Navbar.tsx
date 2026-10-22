import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { NotificationBell } from "./NotificationBell";
import {
  Wrench,
  Truck,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  ClipboardList,
  PlusCircle,
  Sun,
  Moon,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "VENDOR":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "TECHNICIAN":
        return "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "DELIVERY_PARTNER":
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "CUSTOMER":
        return "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <span>RRCMS</span>
            <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium ml-1">
              Remote Repair Centre · Nagpur
            </span>
          </Link>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
            {role === "CUSTOMER" && (
              <>
                <Link
                  to="/customer/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  My Repairs
                </Link>
                <Link
                  to="/customer/new-repair"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  New Request
                </Link>
              </>
            )}

            {role === "VENDOR" && (
              <Link
                to="/vendor/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Vendor Workspace
              </Link>
            )}

            {role === "TECHNICIAN" && (
              <Link
                to="/technician/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Diagnostic Queue
              </Link>
            )}

            {role === "DELIVERY_PARTNER" && (
              <Link
                to="/delivery/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Delivery Trips
              </Link>
            )}

            {role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Operations Command
              </Link>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {user ? (
              <div className="flex items-center gap-2">
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getRoleBadgeColor()}`}
                >
                  {user.role.replace("_", " ")}
                </span>
                <span className="hidden md:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                >
                  <UserIcon className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
