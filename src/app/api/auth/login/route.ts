import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: err.errors?.[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}