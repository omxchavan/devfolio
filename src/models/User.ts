import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser as IUserBase } from "@/types";
import { ACADEMIC_YEARS } from "@/lib/constants";

export interface IUser extends IUserBase, Document {
  _id: any;
  projects: mongoose.Types.ObjectId[];
  createdAt: any;
  updatedAt: any;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    githubUsername: { type: String, required: true, unique: true, index: true },
    onboarded: { type: Boolean, default: false },
    bio: { type: String, default: "", maxlength: 500 },
    prn: { type: String, default: "", index: true },
    year: { type: String, enum: [...ACADEMIC_YEARS, ""], default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
