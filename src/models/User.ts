import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },

    // 🔥 NEW FIELDS
    major: {
      type: String,
      default: "",
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", UserSchema);

export default User;