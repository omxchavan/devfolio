import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { revalidateTag } from "next/cache";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("Missing GitHub OAuth credentials");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.login) return false;

      try {
        await connectDB();
        let user = await User.findOne({
          githubUsername: { $regex: new RegExp(`^${escapeRegex(profile.login)}$`, 'i') },
        });

        if (!user) {
          user = await User.create({
            name: profile.name || profile.login,
            email: profile.email || `${profile.login}@github.com`,
            image: (profile as Record<string, unknown>).avatar_url as string || "",
            githubUsername: profile.login,
            socialLinks: {
              github: `https://github.com/${profile.login}`,
            },
          });
        }

        // Link user to existing projects they contributed to
        const Project = require("@/models/Project").default;
        // Find projects where this user is a contributor but not yet linked
        // Use $elemMatch to ensure both conditions match the SAME array element
        const escapedLogin = escapeRegex(profile.login);
        const projectsToLink = await Project.find({
          contributors: {
            $elemMatch: {
              githubUsername: { $regex: new RegExp(`^${escapedLogin}$`, 'i') },
              isLinked: false
            }
          }
        });

        if (projectsToLink.length > 0) {
          const projectIds = projectsToLink.map((p: any) => p._id);

          // Update user to include these projects
          await User.findByIdAndUpdate(user._id, {
            $addToSet: { projects: { $each: projectIds } }
          });

          // Update the projects to link this contributor
          await Project.updateMany(
            { _id: { $in: projectIds } },
            {
              $set: {
                "contributors.$[elem].userId": user._id,
                "contributors.$[elem].isLinked": true
              }
            },
            {
              arrayFilters: [{ "elem.githubUsername": { $regex: new RegExp(`^${escapedLogin}$`, 'i') } }]
            }
          );

          // Bust caches so project/profile pages reflect the linking immediately
          revalidateTag("projects", "page");
          revalidateTag("profiles", "page");
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },

    async jwt({ token, profile, trigger, session }) {
      if (trigger === "update" && session?.onboarded !== undefined) {
        token.onboarded = session.onboarded;
      }

      // If we're signing in, profile will be present. 
      // Otherwise, if the token is missing critical attributes like 'id', 
      // we attempt to re-hydrate it from the database for a resilient session.
      if (profile?.login || !token.id) {
        await connectDB();
        
        // Find user by githubUsername (if login available) OR by email
        const user = await User.findOne({
          $or: [
            ...(profile?.login ? [{ githubUsername: { $regex: new RegExp(`^${escapeRegex(profile.login)}$`, 'i') } }] : []),
            ...(token.email ? [{ email: token.email }] : [])
          ]
        });

        if (user) {
          token.id = user._id.toString();
          token.githubUsername = user.githubUsername; // Canonical casing
          token.onboarded = user.onboarded;
          token.role = user.role || "user";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.githubUsername) {
        session.user.githubUsername = token.githubUsername as string;
      }
      if (token.onboarded !== undefined) {
        session.user.onboarded = token.onboarded as boolean;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
