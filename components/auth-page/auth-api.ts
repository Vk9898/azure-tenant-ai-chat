import NextAuth from "next-auth";
import { authConfig } from "./config";

// Create a simple NextAuth handler with basic exports
// @ts-ignore - NextAuth v5 beta type issues
export const { auth } = NextAuth(authConfig);