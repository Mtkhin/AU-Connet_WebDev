import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const event = await Event.create({
      title: body.title,
      description: body.description || "",
      date: body.date,
      location: body.location || "",
      clubId: body.clubId,
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
    });

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}