import { Domain } from "@/lib/constants";

export interface IContributor {
  githubUsername: string;
  avatarUrl: string;
  userId?: string; // Stringified ObjectId for client compatibility
  isLinked: boolean;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  domain: Domain;
  githubRepo: string;
  liveLink?: string;
  tags: string[];
  images: string[];
  owner: any; // ID or IUser
  contributors: IContributor[];
  stars: number;
  techStack: string[];
  readmeExcerpt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  githubUsername: string;
  onboarded: boolean;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  projects: any[]; // IDs or IProjects
}
