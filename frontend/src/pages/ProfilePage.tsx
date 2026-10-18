import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRound, Mail, Phone, ShieldCheck, CalendarDays, ArrowLeft } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const fields = [
    { label: "Full name", value: user.name, icon: UserRound },
    { label: "Email address", value: user.email, icon: Mail },
    { label: "Phone number", value: user.phone || "Not provided", icon: Phone },
    { label: "Account role", value: user.role.replace("_", " "), icon: ShieldCheck },
    {
      label: "Member since",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "Not available",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <UserRound className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View your RRCMS account information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
          {fields.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Icon className="w-4 h-4" />
                {label}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white break-words">
                {value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Profile editing will be available here as the profile management workflow is completed.
        </p>
      </section>
    </div>
  );
};
