import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Club from "@/models/Club";
import Membership from "@/models/Membership";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await connectDB();
    const club = await Club.findById(id);
    return NextResponse.json(club);
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

    const updated = await Club.findByIdAndUpdate(
      id,
      { name: body.name, description: body.description || "" },
      { new: true }
    );

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

    // delete memberships first (important)
    await Membership.deleteMany({ clubId: id });

    const deleted = await Club.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Club not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}