import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Membership from "@/models/Membership";

export async function GET() {
  try {
    await connectDB();
    const memberships = await Membership.find().sort({ createdAt: -1 });
    return NextResponse.json(memberships);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { userId, clubId, studentName, studentId, major, reason } = body;

    if (!userId || !clubId) {
      return NextResponse.json(
        { message: "userId and clubId are required" },
        { status: 400 }
      );
    }

    const exists = await Membership.findOne({ userId, clubId });
    if (exists) {
      return NextResponse.json({ message: "Already joined" }, { status: 400 });
    }

    const membership = await Membership.create({
      userId,
      clubId,
      studentName: studentName || "",
      studentId: studentId || "",
      major: major || "",
      reason: reason || "",
    });

    return NextResponse.json({ success: true, membership });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { userId, clubId } = await req.json();

    if (!userId || !clubId) {
      return NextResponse.json(
        { message: "userId and clubId are required" },
        { status: 400 }
      );
    }

    await Membership.deleteOne({ userId, clubId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}