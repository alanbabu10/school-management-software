"use client";

import React from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-slate-200 animate-in slide-in-from-bottom-5 duration-200">
      {type === "success" ? (
        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
      )}
      <p className="text-sm font-medium text-slate-800">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
