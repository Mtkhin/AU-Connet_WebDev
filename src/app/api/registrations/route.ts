import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import EventRegistration from "@/models/EventRegistration";

export async function GET() {
  try {
    await connectDB();
    const regs = await EventRegistration.find();
    return NextResponse.json(regs);
  } catch (error: any) {
    console.error("REGISTRATION GET ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Failed to load registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, eventId } = await req.json();

    const existing = await EventRegistration.findOne({ userId, eventId });
    if (existing) {
      return NextResponse.json(
        { message: "Already registered." },
        { status: 400 }
      );
    }

    const reg = await EventRegistration.create({
      userId,
      eventId,
    });

    return NextResponse.json({ success: true, reg });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { userId, eventId } = await req.json();

    await EventRegistration.deleteOne({ userId, eventId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}