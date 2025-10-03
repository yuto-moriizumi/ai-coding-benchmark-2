import { logout } from "@/app/actions/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await logout();
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
  );
}
