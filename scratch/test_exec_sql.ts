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

async function runSql() {
  const sql = "ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_password text;";
  
  // Try calling rpc 'exec_sql' or 'exec' or 'run_sql'
  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });
  console.log("RPC exec_sql result:", data, "error:", error?.message);
}

runSql();
