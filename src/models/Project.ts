import mongoose, { Schema, Document, Model } from "mongoose";
import { DOMAINS } from "@/lib/constants";
import { IProject as IProjectBase, IContributor } from "@/types";

export interface IProject extends IProjectBase, Document {
  _id: any;
  owner: any;
}


const ContributorSchema = new Schema<IContributor>(
  {
    githubUsername: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isLinked: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, maxlength: 100, index: "text" },
    description: { type: String, required: true, maxlength: 2000 },
    domain: {
      type: String,
      required: true,
      enum: DOMAINS,
    },
    githubRepo: { type: String, required: true },
    liveLink: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
    images: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contributors: { type: [ContributorSchema], default: [] },
    stars: { type: Number, default: 0 },
    techStack: { type: [String], default: [] },
    readmeExcerpt: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true }
);

// Compound index for efficient filtering
ProjectSchema.index({ domain: 1, createdAt: -1 });
ProjectSchema.index({ tags: 1, createdAt: -1 });

const Project: Model<IProject> =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
