import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { onboardingSchema } from "@/lib/validations";
import { sanitizeUserContent } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const [session, body] = await Promise.all([
      getServerSession(authOptions),
      request.json(),
      connectDB(),
    ]);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const validated = onboardingSchema.parse(body);
    const sanitized = sanitizeUserContent(
      validated as unknown as Record<string, unknown>
    );

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.set(sanitized);
    user.onboarded = true;
    await user.save();

    revalidateTag("profiles", "page");
    revalidatePath("/dashboard");
    revalidatePath(`/profile/${user.githubUsername}`);

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("Error onboarding user:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
