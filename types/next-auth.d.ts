import { DefaultSession } from "next-auth";

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      databaseConnectionString?: string;
    } & DefaultSession["user"];
  }

  interface Token {
    isAdmin: boolean;
    databaseConnectionString?: string; 
  }

  interface User {
    isAdmin: boolean;
    databaseConnectionString?: string; 
  }
}
