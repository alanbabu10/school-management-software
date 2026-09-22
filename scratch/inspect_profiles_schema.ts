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

async function inspectProfilesSchema() {
  const { data, error } = await supabase.rpc("exec_sql", {
    sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';",
  });
  console.log("Profiles columns:", data || error);
}

inspectProfilesSchema();
