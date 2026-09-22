import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const teacherCookie = request.cookies.get("teacher_session")?.value;
  const parentCookie = request.cookies.get("parent_session")?.value;

  const pathname = request.nextUrl.pathname;

  // Protect /admin routes
  if (!user && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect /teacher routes (allow if user or teacher_session cookie exists)
  if (!user && !teacherCookie && pathname.startsWith("/teacher")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect /parent routes (allow if parent_session cookie exists)
  if (!parentCookie && pathname.startsWith("/parent")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged in user visiting /login according to role
  if ((user || teacherCookie || parentCookie) && pathname === "/login") {
    const url = request.nextUrl.clone();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "teacher") {
        url.pathname = "/teacher/dashboard";
      } else {
        url.pathname = "/admin/dashboard";
      }
      return NextResponse.redirect(url);
    } else if (teacherCookie) {
      url.pathname = "/teacher/dashboard";
      return NextResponse.redirect(url);
    } else if (parentCookie) {
      url.pathname = "/parent/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
