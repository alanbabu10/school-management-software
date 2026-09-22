"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Building2, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnifiedLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanInput = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanInput || !cleanPassword) {
      setError("Please enter your phone number, email, or ID and password.");
      setLoading(false);
      return;
    }

    // 1. Try Supabase Auth (Staff / Admin / Registered Auth Teachers)
    let loginEmail = cleanInput;
    if (!cleanInput.includes("@")) {
      const cleanPhone = cleanInput.replace(/\D/g, "");
      loginEmail = cleanPhone
        ? `teacher_${cleanPhone}@school.com`
        : `teacher_${cleanInput.toLowerCase()}@school.com`;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: cleanPassword,
    });

    if (!authError && authData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const target = profile?.role === "teacher" ? "/teacher/dashboard" : "/admin/dashboard";
      window.location.href = target;
      return;
    }

    // 2. Try Teacher API Fallback (for teachers logging in with phone / employee ID)
    try {
      const teacherRes = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginInput: cleanInput, password: cleanPassword }),
      });

      const teacherData = await teacherRes.json();
      if (teacherRes.ok && teacherData.success) {
        window.location.href = teacherData.redirect || "/teacher/dashboard";
        return;
      }
    } catch {
      // Ignore fallback error
    }

    // 3. Try Parent API Fallback (for Parents logging in with Phone + Password)
    try {
      const parentRes = await fetch("/api/parent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanInput, password: cleanPassword }),
      });

      const parentData = await parentRes.json();
      if (parentRes.ok && parentData.success) {
        window.location.href = parentData.redirect || "/parent/select-child";
        return;
      }
    } catch {
      // Ignore fallback error
    }

    setError("Incorrect username, phone number, or password. Please try again.");
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50/80 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold shadow-md mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            St MARY&apos;s L P School
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Pallippuram — Institutional Management Portal
          </p>
        </div>

        {/* Single Unified Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">Account Login</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sign in with your registered credentials (Admin, Teacher, or Parent)
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Unified Login Form */}
          <form onSubmit={handleUnifiedLogin} className="space-y-4">
            <Input
              label="Email, Phone Number, or ID"
              type="text"
              placeholder="e.g. admin@school.com or 9876543210"
              icon={<User className="w-4 h-4" />}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Protected by Secure Auth & Role-Based Access Control
        </p>
      </div>
    </main>
  );
}