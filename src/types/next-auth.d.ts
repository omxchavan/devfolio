import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubUsername: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    login?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    githubUsername?: string;
  }
}
