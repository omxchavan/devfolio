import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser as IUserBase } from "@/types";

export interface IUser extends IUserBase, Document {
  _id: any;
  projects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    githubUsername: { type: String, required: true, unique: true, index: true },
    onboarded: { type: Boolean, default: false },
    bio: { type: String, default: "", maxlength: 500 },
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
