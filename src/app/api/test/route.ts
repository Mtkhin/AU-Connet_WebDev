import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      users,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}