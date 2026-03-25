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
        const existingUser = await User.findOne({
          githubUsername: profile.login,
        });

        if (!existingUser) {
          await User.create({
            name: profile.name || profile.login,
            email: profile.email || `${profile.login}@github.com`,
            image: (profile as Record<string, unknown>).avatar_url as string || "",
            githubUsername: profile.login,
            socialLinks: {
              github: `https://github.com/${profile.login}`,
            },
          });
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
        const user = await User.findOne({ githubUsername: profile.login });
        if (user) {
          token.id = user._id.toString();
          token.githubUsername = profile.login;
          token.onboarded = user.onboarded;
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
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
