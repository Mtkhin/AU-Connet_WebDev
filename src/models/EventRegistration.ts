import mongoose, { Schema, models } from "mongoose";

const EventRegistrationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

delete (mongoose.models as any).EventRegistration;

const EventRegistration =
  models.EventRegistration ||
  mongoose.model("EventRegistration", EventRegistrationSchema);

export default EventRegistration;