import mongoose, { Schema, models } from "mongoose";

const MembershipSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },

    studentName: { type: String, default: "" },
    studentId: { type: String, default: "" },
    major: { type: String, default: "" },
    reason: { type: String, default: "" },

    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// prevent model overwrite errors in dev
delete (mongoose.models as any).Membership;

const Membership = models.Membership || mongoose.model("Membership", MembershipSchema);
export default Membership;