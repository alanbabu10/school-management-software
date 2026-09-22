import fs from "fs";

const envText = fs.readFileSync(".env.local", "utf8");
const envVars: Record<string, string> = {};
envText.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) envVars[k.trim()] = v.trim();
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey = envVars["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

async function inspectOpenApi() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  const json = await res.json();
  console.log("=== Open API Paths ===");
  console.log(Object.keys(json.paths || {}));
}

inspectOpenApi();
