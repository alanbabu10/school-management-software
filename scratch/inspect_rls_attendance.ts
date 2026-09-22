import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function inspectRLS() {
  // Check RLS policies on attendance table
  const { data: policies, error } = await supabase.rpc("exec_sql", {
    sql: `SELECT policyname, permissive, roles, cmd, qual, with_check 
          FROM pg_policies 
          WHERE tablename = 'attendance'`
  });

  if (error) {
    // Fallback: query pg_policies directly via raw SQL
    console.log("RPC not available, trying direct query...");
    
    const { data, error: err2 } = await supabase
      .from("pg_policies")
      .select("*")
      .eq("tablename", "attendance");
    
    if (err2) {
      console.log("Cannot query pg_policies directly either:", err2.message);
      console.log("Trying information_schema approach...");
    } else {
      console.log("Policies:", data);
    }
  } else {
    console.log("Policies:", policies);
  }

  // Check if RLS is enabled
  const { data: rlsCheck, error: rlsErr } = await supabase.rpc("exec_sql", {
    sql: `SELECT relname, relrowsecurity, relforcerowsecurity 
          FROM pg_class 
          WHERE relname = 'attendance'`
  });

  if (!rlsErr) {
    console.log("RLS status:", rlsCheck);
  }
}

inspectRLS();
