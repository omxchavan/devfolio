import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

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
          githubUsername: { $regex: new RegExp(`^${profile.login}$`, 'i') },
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
        // Find projects where this user is a contributor but not linked
        const projectsToLink = await Project.find({
          "contributors.githubUsername": { $regex: new RegExp(`^${profile.login}$`, 'i') },
          "contributors.isLinked": false
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
              arrayFilters: [{ "elem.githubUsername": { $regex: new RegExp(`^${profile.login}$`, 'i') } }]
            }
          );
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

      if (profile?.login) {
        await connectDB();
        const user = await User.findOne({
          githubUsername: { $regex: new RegExp(`^${profile.login}$`, 'i') },
        });
        if (user) {
          token.id = user._id.toString();
          token.githubUsername = user.githubUsername; // Ensure canonical casing from DB
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
