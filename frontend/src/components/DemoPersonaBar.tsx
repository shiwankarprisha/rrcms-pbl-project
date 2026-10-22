import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
} from "lucide-react";

interface Persona {
  label: string;
  sub: string;
  role: string;
  email: string;
  badgeBg: string;
}

const PERSONAS: Persona[] = [
  {
    label: "Customer 1",
    sub: "Ananya (Civil Lines)",
    role: "CUSTOMER",
    email: "customer1@rrcms.local",
    badgeBg: "bg-indigo-600",
  },
  {
    label: "Customer 2",
    sub: "Rahul (Manish Nagar)",
    role: "CUSTOMER",
    email: "customer2@rrcms.local",
    badgeBg: "bg-indigo-600",
  },
  {
    label: "Vendor 1",
    sub: "Priya (Dharampeth Hub)",
    role: "VENDOR",
    email: "vendor1@rrcms.local",
    badgeBg: "bg-amber-600",
  },
  {
    label: "Vendor 2",
    sub: "Ramesh (Sitabuldi Hub)",
    role: "VENDOR",
    email: "vendor2@rrcms.local",
    badgeBg: "bg-amber-600",
  },
  {
    label: "Technician 1",
    sub: "Amitabh (Chip Lead)",
    role: "TECHNICIAN",
    email: "tech1@rrcms.local",
    badgeBg: "bg-blue-600",
  },
  {
    label: "Technician 2",
    sub: "Sneha (Display Spec)",
    role: "TECHNICIAN",
    email: "tech2@rrcms.local",
    badgeBg: "bg-blue-600",
  },
  {
    label: "Delivery 1",
    sub: "Tushar (Pratap Nagar)",
    role: "DELIVERY_PARTNER",
    email: "delivery1@rrcms.local",
    badgeBg: "bg-emerald-600",
  },
  {
    label: "Delivery 2",
    sub: "Kunal (Ramdaspeth)",
    role: "DELIVERY_PARTNER",
    email: "delivery2@rrcms.local",
    badgeBg: "bg-emerald-600",
  },
  {
    label: "Chief Admin",
    sub: "Vikramaditya (Ops)",
    role: "ADMIN",
    email: "admin@rrcms.local",
    badgeBg: "bg-purple-600",
  },
];

export const DemoPersonaBar: React.FC = () => {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSelectPersona = async (p: Persona) => {
    try {
      setSwitching(p.email);
      const newUser = await quickLogin(p.email);

      // Navigate to the respective dashboard
      switch (newUser.role) {
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
    } catch (err) {
      console.error("Quick login failed", err);
    } finally {
      setSwitching(null);
    }
  };

  const currentPersona = PERSONAS.find((p) => p.email === user?.email);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Nagpur Demo Personas:
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Active:{" "}
            {currentPersona ? (
              <strong className="text-white">
                {currentPersona.label} ({currentPersona.sub})
              </strong>
            ) : user ? (
              <strong className="text-white">
                {user.name} ({user.role})
              </strong>
            ) : (
              <em className="text-slate-400">Guest / Not Logged In</em>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick-switch buttons for the most common ones */}
          <div className="hidden lg:flex items-center gap-1">
            {PERSONAS.map((p) => {
              const isActive = user?.email === p.email;
              return (
                <button
                  key={p.email}
                  onClick={() => handleSelectPersona(p)}
                  disabled={switching !== null}
                  className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 ${
                    isActive
                      ? `${p.badgeBg} text-white font-bold ring-1 ring-white/50`
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  }`}
                  title={`${p.label} - ${p.sub} (${p.email})`}
                >
                  {isActive && <Check className="w-2.5 h-2.5" />}
                  {p.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-[11px]"
          >
            <UserCheck className="w-3 h-3" />
            <span>Switch Role</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Dropdown drawer */}
      {isOpen && (
        <div className="bg-slate-950/95 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] text-slate-400 mb-2">
              Click any verified Nagpur persona below to instantly switch roles and demonstrate that part of the repair lifecycle:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PERSONAS.map((p) => {
                const isActive = user?.email === p.email;
                return (
                  <button
                    key={p.email}
                    onClick={() => {
                      handleSelectPersona(p);
                      setIsOpen(false);
                    }}
                    disabled={switching !== null}
                    className={`p-2 rounded-xl text-left border transition ${
                      isActive
                        ? "bg-slate-800 border-indigo-500 ring-1 ring-indigo-500"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-white">{p.label}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.badgeBg}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.sub}</p>
                    <p className="text-[9px] font-mono text-slate-500 truncate">{p.email}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
