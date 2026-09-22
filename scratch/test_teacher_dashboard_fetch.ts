async function testTeacherDashboardFetch() {
  console.log("Testing GET http://localhost:3000/teacher/dashboard with teacher_session cookie...");

  // First get cookie from login
  const loginRes = await fetch("http://localhost:3000/api/teacher/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginInput: "8085698847", password: "password123" }),
  });

  const cookies = loginRes.headers.getSetCookie();
  const teacherCookieStr = cookies.find(c => c.startsWith("teacher_session="));

  console.log("Teacher cookie header:", teacherCookieStr);

  const dashRes = await fetch("http://localhost:3000/teacher/dashboard", {
    headers: {
      Cookie: teacherCookieStr || "",
    },
    redirect: "manual",
  });

  console.log("Dashboard HTTP Status:", dashRes.status);
  if (dashRes.status === 200) {
    const html = await dashRes.text();
    console.log("Dashboard HTML contains 'Teacher Portal':", html.includes("Teacher Portal"));
    console.log("Dashboard HTML contains 'Seena':", html.includes("Seena"));
  } else {
    console.log("Dashboard Headers:", Object.fromEntries(dashRes.headers.entries()));
  }
}

testTeacherDashboardFetch();
