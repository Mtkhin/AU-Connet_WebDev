import mongoose, { Schema, models } from "mongoose";

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    location: { type: String, default: "" },
    clubId: { type: String, required: true },
    keywords: [{ type: String }], // for recommendations
  },
  { timestamps: true }
);

const Event = models.Event || mongoose.model("Event", EventSchema);
export default Event;