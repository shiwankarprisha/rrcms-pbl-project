import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Lock, Mail, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password@123");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);

      // Navigate to role-specific dashboard
      switch (res.user.role) {
        case "CUSTOMER":
          navigate("/customer/dashboard");
          break;
        case "VENDOR":
          navigate("/vendor/dashboard");
          break;
        case "TECHNICIAN":
          navigate("/technician/dashboard");
          break;
        case "DELIVERY_PARTNER":
          navigate("/delivery/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in to RRCMS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nagpur Operations Hub · Role-Based Access
          </p>
        </div>

        {/* Demo Fast-Fill Pills */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Quick-Fill Nagpur Demo Personas:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials("customer1@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 truncate"
              title="Ananya Sharma (Civil Lines)"
            >
              <strong className="block text-[11px] text-indigo-600 dark:text-indigo-400">Customer 1</strong>
              Ananya (Civil Lines)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("customer2@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 truncate"
              title="Rahul Bhave (Manish Nagar)"
            >
              <strong className="block text-[11px] text-indigo-600 dark:text-indigo-400">Customer 2</strong>
              Rahul (Manish Ngr)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("vendor1@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 truncate"
              title="Priya Deshmukh (Dharampeth)"
            >
              <strong className="block text-[11px] text-amber-600 dark:text-amber-400">Vendor 1</strong>
              Priya (Dharampeth)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("vendor2@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 truncate"
              title="Ramesh Kulkarni (Sitabuldi)"
            >
              <strong className="block text-[11px] text-amber-600 dark:text-amber-400">Vendor 2</strong>
              Ramesh (Sitabuldi)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("tech1@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 truncate"
              title="Amitabh Joshi (Chip-Level Lead)"
            >
              <strong className="block text-[11px] text-blue-600 dark:text-blue-400">Technician 1</strong>
              Amitabh (Chip Lead)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("tech2@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 truncate"
              title="Sneha Patil (Display Specialist)"
            >
              <strong className="block text-[11px] text-blue-600 dark:text-blue-400">Technician 2</strong>
              Sneha (Display Spec)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("delivery1@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 truncate"
              title="Tushar Raut (Pratap Nagar)"
            >
              <strong className="block text-[11px] text-emerald-600 dark:text-emerald-400">Delivery 1</strong>
              Tushar (Pratap Ngr)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("delivery2@rrcms.local")}
              className="px-2 py-1.5 text-left rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 truncate"
              title="Kunal Wankhede (Ramdaspeth)"
            >
              <strong className="block text-[11px] text-emerald-600 dark:text-emerald-400">Delivery 2</strong>
              Kunal (Ramdaspeth)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("admin@rrcms.local")}
              className="col-span-2 px-2 py-1.5 text-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-700 dark:text-slate-200"
            >
              <strong className="text-[11px] text-purple-600 dark:text-purple-400 mr-1.5">Admin:</strong>
              Vikramaditya Sharma (Chief Operations)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@rrcms.local"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
