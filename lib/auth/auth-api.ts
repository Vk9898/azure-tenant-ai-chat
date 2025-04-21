import NextAuth from "next-auth";
import { authConfig } from "./auth-config";

// Create a simple NextAuth handler with basic exports

export const { auth } = NextAuth(authConfig);