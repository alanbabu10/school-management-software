import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("parent_session");
  cookieStore.delete("selected_child_id");

  const origin = request.headers.get("origin") || new URL(request.url).origin;
  return NextResponse.json({ success: true, redirect: `${origin}/login` });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("parent_session");
  cookieStore.delete("selected_child_id");

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/login`);
}
