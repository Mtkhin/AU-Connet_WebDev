import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Club from "@/models/Club";

export async function GET() {
  try {
    await connectDB();
    const clubs = await Club.find().sort({ createdAt: -1 });
    return NextResponse.json(clubs);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, description } = await req.json();

    const club = await Club.create({
      name,
      description: description || "",
    });

    return NextResponse.json({ success: true, club });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}