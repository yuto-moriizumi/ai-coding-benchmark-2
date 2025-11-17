import { clearAuthCookie } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    await clearAuthCookie();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
