import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envText.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardQueries() {
  console.log("--- Testing Dashboard Queries ---");

  // Student Count
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  // Teacher Count
  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("*", { count: "exact", head: true });

  // Class Count
  const { count: classCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true });

  // Pending Fees
  const { data: feeData } = await supabase
    .from("fees")
    .select("amount, paid_amount, status");

  const pendingFees = (feeData || []).filter((f) => f.status !== "paid");
  const pendingAmount = pendingFees.reduce(
    (sum, f) => sum + (Number(f.amount) - Number(f.paid_amount || 0)),
    0
  );

  // Today Attendance
  const todayStr = new Date().toISOString().split("T")[0];
  const { data: attendanceData } = await supabase
    .from("attendance")
    .select("status")
    .eq("attendance_date", todayStr);

  const presentCount = (attendanceData || []).filter((a) => a.status === "present").length;
  const totalMarked = (attendanceData || []).length;

  // Pending Leave Requests
  const { count: pendingLeaveCount } = await supabase
    .from("leave_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Recent Notices
  const { data: recentNotices } = await supabase
    .from("notices")
    .select("id, title, content, target_role, published_at, created_at, classes(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent Students
  const { data: recentStudents } = await supabase
    .from("students")
    .select("id, admission_number, full_name, status, created_at, classes(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  console.log("studentCount:", studentCount);
  console.log("teacherCount:", teacherCount);
  console.log("classCount:", classCount);
  console.log("pendingFeesCount:", pendingFees.length, "pendingAmount:", pendingAmount);
  console.log("todayStr:", todayStr, "presentCount:", presentCount, "totalMarked:", totalMarked);
  console.log("pendingLeaveCount:", pendingLeaveCount);
  console.log("recentNotices count:", recentNotices?.length);
  console.log("recentStudents count:", recentStudents?.length);
}

testDashboardQueries();
