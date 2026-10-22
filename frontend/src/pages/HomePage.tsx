import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Wrench,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  MapPin,
  Bell,
  RefreshCw,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/health/db")
      .then((r) => r.json())
      .then((d) => setDbStatus(d.database === "connected" ? "Connected (MySQL)" : "Disconnected"))
      .catch(() => setDbStatus("API Offline"));
  }, []);

  const handleQuickDemoLogin = async (email: string, roleName: string, targetPath: string) => {
    try {
      setLoadingRole(roleName);
      const res = await api.login({ email, password: "Password@123" });
      login(res.token, res.user);
      navigate(targetPath);
    } catch (err: any) {
      alert(`Demo login failed: ${err.message}`);
    } finally {
      setLoadingRole(null);
    }
  };

  const demoAccounts = [
    {
      role: "ADMIN",
      email: "admin@rrcms.local",
      name: "Vikramaditya Sharma",
      area: "Chief Operations (Nagpur HQ)",
      path: "/admin/dashboard",
      color: "border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 hover:bg-purple-100",
      badge: "bg-purple-600",
      letter: "A",
    },
    {
      role: "VENDOR 1",
      email: "vendor1@rrcms.local",
      name: "Priya Deshmukh",
      area: "Apex MicroTech (Dharampeth)",
      path: "/vendor/dashboard",
      color: "border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100",
      badge: "bg-amber-600",
      letter: "V1",
    },
    {
      role: "VENDOR 2",
      email: "vendor2@rrcms.local",
      name: "Ramesh Kulkarni",
      area: "Vidarbha Electronics (Sitabuldi)",
      path: "/vendor/dashboard",
      color: "border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100",
      badge: "bg-amber-600",
      letter: "V2",
    },
    {
      role: "TECH 1",
      email: "tech1@rrcms.local",
      name: "Amitabh Joshi",
      area: "Lead Chip Diagnostic Tech",
      path: "/technician/dashboard",
      color: "border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 hover:bg-blue-100",
      badge: "bg-blue-600",
      letter: "T1",
    },
    {
      role: "TECH 2",
      email: "tech2@rrcms.local",
      name: "Sneha Patil",
      area: "Display & Soldering Specialist",
      path: "/technician/dashboard",
      color: "border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 hover:bg-blue-100",
      badge: "bg-blue-600",
      letter: "T2",
    },
    {
      role: "DELIVERY 1",
      email: "delivery1@rrcms.local",
      name: "Tushar Raut",
      area: "Nagpur FastLogistics (Pratap Nagar)",
      path: "/delivery/dashboard",
      color: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100",
      badge: "bg-emerald-600",
      letter: "D1",
    },
    {
      role: "DELIVERY 2",
      email: "delivery2@rrcms.local",
      name: "Kunal Wankhede",
      area: "OrangeCity Express (Ramdaspeth)",
      path: "/delivery/dashboard",
      color: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100",
      badge: "bg-emerald-600",
      letter: "D2",
    },
    {
      role: "CUSTOMER 1",
      email: "customer1@rrcms.local",
      name: "Ananya Sharma",
      area: "Civil Lines, Nagpur",
      path: "/customer/dashboard",
      color: "border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100",
      badge: "bg-indigo-600",
      letter: "C1",
    },
    {
      role: "CUSTOMER 2",
      email: "customer2@rrcms.local",
      name: "Rahul Bhave",
      area: "Manish Nagar, Nagpur",
      path: "/customer/dashboard",
      color: "border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100",
      badge: "bg-indigo-600",
      letter: "C2",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-16 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5" />
            Software Engineering Individual PBL Project · Nagpur Hub
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto">
            Remote Repair Centre <br />
            <span className="text-indigo-600 dark:text-indigo-400">Management System (RRCMS)</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            One connected platform uniting <strong>Nagpur Customers</strong>, <strong>Authorized Vendors</strong>,{" "}
            <strong>Technicians</strong>, and <strong>Delivery Partners</strong> with doorstep pickup,
            delivery failure recovery, and real-time operational notifications.
          </p>

          {/* Quick Demo Switcher - 9 Nagpur Personas */}
          <div className="pt-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Instant Demonstration Logins (Nagpur Operations · Password: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">Password@123</code>)
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 self-start sm:self-auto">
                  <Database className="w-3.5 h-3.5" />
                  {dbStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickDemoLogin(acc.email, acc.name, acc.path)}
                    disabled={loadingRole !== null}
                    className={`p-3 text-left rounded-xl border transition flex items-start gap-3 shadow-2xs ${acc.color}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${acc.badge}`}
                    >
                      {acc.letter}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{acc.name}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        {acc.area}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Architectural Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Robust Engineering & Edge Case Handling</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Designed to eliminate operational gaps and maintain absolute data integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Delivery Failure Recovery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              If customer is unavailable during doorstep delivery, the system reverts repair status to <code>READY_FOR_PICKUP</code> and enables conflict-free re-scheduling without orphaned out-for-delivery states.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Doorstep Pickup Workflow</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nagpur customers can request doorstep device pickup upon request submission. A pickup trip is auto-scheduled for delivery partners to transport devices directly to authorized service centers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Multi-Stakeholder Notifications</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instant in-app alerts keep all parties synchronized with exact dates and timestamps when devices are out for delivery, estimates need approval, or status updates occur.
            </p>
          </div>
        </div>
      </section>

      {/* Stepper Lifecycle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">End-to-End Operational Lifecycle</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Strict transactional integrity enforced across modules with zero orphan records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Request & Doorstep Pickup</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Customer submits device specs and issue description with optional Nagpur pickup address. Generates unique tracking number (<code>RRCMS-YYYYMMDD-XXXX</code>).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Vendor Inspection & Estimate</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Authorized Nagpur vendor verifies the device and generates estimated cost and turnaround days. Work only proceeds upon customer approval.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Diagnosis & Repair</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Assigned technician logs component diagnostics, updates progress, and marks repair complete with final cost and QA notes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
              04
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Delivery & Final Closure</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Handover validation ensures delivery only schedules for completed repairs. Customer doorstep receipt confirmation automatically closes the request.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
