import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const { userId, major, interests } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { major, interests },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}