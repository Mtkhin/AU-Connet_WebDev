import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Membership from "@/models/Membership";

export async function DELETE(
  request: Request,
  context: any
) {
  try {
    await connectDB();

    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing membership id" },
        { status: 400 }
      );
    }

    const deleted = await Membership.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Membership not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("MEMBERSHIP DELETE ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}