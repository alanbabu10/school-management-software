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

async function addCol() {
  console.log("Adding column password to teachers table...");
  const sql = "ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS password text;";

  const rpcNames = ["exec_sql", "exec", "execute_sql", "query", "run_sql"];
  for (const name of rpcNames) {
    const { data, error } = await supabase.rpc(name, { sql_query: sql, sql: sql, query: sql });
    console.log(`RPC '${name}' -> data:`, data, "error:", error?.message);
  }
}

addCol();
