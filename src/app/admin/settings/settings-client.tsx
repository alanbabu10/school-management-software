"use client";

import React, { useState } from "react";
import { Building2, User, Shield, Bell, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<"school" | "profile" | "security">("school");
  const [toastMessage, setToastMessage] = useState("");

  const [schoolInfo, setSchoolInfo] = useState({
    name: "Apex International Academy",
    phone: "+1 555-0199",
    email: "info@apexacademy.edu",
    address: "100 Education Way, Silicon Valley, CA",
    academic_year: "2026-2027",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Settings updated successfully!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage institutional profile, administrator credentials, and security preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card padding="sm" className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("school")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "school"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4" /> School Information
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "profile"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" /> Admin Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "security"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Shield className="w-4 h-4" /> Security & Auth
            </button>
          </nav>
        </Card>

        {/* Content Area */}
        <Card className="lg:col-span-3">
          {activeTab === "school" && (
            <form onSubmit={handleSave} className="space-y-4">
              <CardHeader title="School Profile Information" subtitle="Global branding and official contact info" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="School Name"
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                />
                <Input
                  label="Official Email"
                  value={schoolInfo.email}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={schoolInfo.phone}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                />
                <Input
                  label="Current Academic Year"
                  value={schoolInfo.academic_year}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, academic_year: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="School Address"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" icon={<Save className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-4">
              <CardHeader title="Administrator Credentials" subtitle="Account email and administrative role" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input label="Admin Email" value={userEmail} disabled />
                <Input label="Role" value="System Administrator" disabled />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" icon={<Save className="w-4 h-4" />}>
                  Update Profile
                </Button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleSave} className="space-y-4">
              <CardHeader title="Password & Security" subtitle="Update login password and active sessions" />
              
              <div className="space-y-4 pt-2 max-w-md">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" icon={<Lock className="w-4 h-4" />}>
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
