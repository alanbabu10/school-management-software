import fs from "fs";
import path from "path";

// Read .env.local manually
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

async function testTeacherLogin() {
  console.log("Testing POST http://localhost:3000/api/teacher/login ...");
  const res = await fetch("http://localhost:3000/api/teacher/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginInput: "8085698847", password: "password123" }),
  });

  console.log("Status:", res.status);
  console.log("Cookies:", res.headers.getSetCookie());
  const data = await res.json();
  console.log("Response Body:", data);
}

testTeacherLogin();
