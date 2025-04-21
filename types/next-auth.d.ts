import { DefaultSession } from "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      hashedUserId?: string;
      provider?: string;
      databaseConnectionString?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    isAdmin?: boolean;
    hashedUserId?: string;
    provider?: string;
    databaseConnectionString?: string; 
  }
}