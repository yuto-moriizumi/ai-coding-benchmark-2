import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    return Response.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
