
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth-config";   // move your options out of the route file

export const { handlers: { GET, POST } } = NextAuth(authConfig);