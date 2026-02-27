import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await connectDB();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await connectDB();
    const body = await req.json();

    const updated = await Event.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description || "",
        date: body.date,
        location: body.location || "",
        clubId: body.clubId,
        keywords: Array.isArray(body.keywords) ? body.keywords : [],
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await connectDB();

    // delete registrations first
    await EventRegistration.deleteMany({ eventId: id });

    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}