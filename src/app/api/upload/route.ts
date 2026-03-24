import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSignedUploadParams } from "@/lib/cloudinary";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadParams = generateSignedUploadParams();

    return NextResponse.json(uploadParams);
  } catch (error) {
    console.error("Error generating upload params:", error);
    return NextResponse.json(
      { error: "Failed to generate upload parameters" },
      { status: 500 }
    );
  }
}
