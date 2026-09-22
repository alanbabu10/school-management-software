import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envText = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envText.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const publishableKey = envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const serviceRoleKey = envVars["SUPABASE_SERVICE_ROLE_KEY"] || publishableKey;

console.log("URL:", supabaseUrl);
console.log("Publishable Key:", publishableKey ? "PRESENT" : "MISSING");
console.log("Service Role Key:", envVars["SUPABASE_SERVICE_ROLE_KEY"] ? "PRESENT" : "NOT_IN_ENV_LOCAL");
