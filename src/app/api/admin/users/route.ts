import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check admin role
    const currentUser = await User.findById(session.user.id).select("role").lean();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || "";
    const q = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "newest";

    // Build filter
    const filter: Record<string, unknown> = {};
    if (year) filter.year = year;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { prn: { $regex: q, $options: "i" } },
        { githubUsername: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    // Build sort
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "name") sortObj = { name: 1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };

    const users = await User.find(filter)
      .sort(sortObj)
      .select("name email image githubUsername bio prn year role projects socialLinks createdAt")
      .lean();

    // Add project count
    const usersWithCounts = users.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
      projectCount: u.projects?.length || 0,
    }));

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
