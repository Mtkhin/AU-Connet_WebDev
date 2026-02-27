import mongoose, { Schema, models } from "mongoose";

const ClubSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Club = models.Club || mongoose.model("Club", ClubSchema);
export default Club;