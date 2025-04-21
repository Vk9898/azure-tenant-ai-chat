import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { hashValueSync } from "./utils";
import type { JWT } from "next-auth/jwt";
import type { Session, User, Account } from "next-auth";
import type { NextAuthConfig } from "next-auth";

// Extend the next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
      hashedUserId?: string;
      provider?: string;
      databaseConnectionString?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    hashedUserId?: string;
    provider?: string;
    databaseConnectionString?: string;
  }
}

// Define the configuration for NextAuth
export const authConfig: NextAuthConfig = {
  providers: [
    // ───── B2B / Workforce / guests ──────────
    MicrosoftEntraID({
      clientId: process.env.MT_CLIENT_ID ?? "",
      clientSecret: process.env.MT_CLIENT_SECRET ?? "",
      /**
       * 'common' lets ANY Entra tenant (including guests) sign in.
       * Use https://login.microsoftonline.com/organizations if you
       * want only work/school accounts, or set `issuer` to lock to
       * your own tenant.
       */
      issuer: "https://login.microsoftonline.com/common/v2.0",
    }),

    // ───── B2C / Consumer  ──────────
    AzureADB2CProvider({
      // For NextAuth v5, we need to use issuer format instead of tenantId
      issuer: process.env.B2C_TENANT && process.env.B2C_POLICY
        ? `https://${process.env.B2C_TENANT}.b2clogin.com/${process.env.B2C_TENANT}.onmicrosoft.com/${process.env.B2C_POLICY}/v2.0`
        : undefined,
      clientId: process.env.B2C_CLIENT_ID ?? "",
      clientSecret: process.env.B2C_CLIENT_SECRET ?? "",
      authorization: { 
        params: { scope: "offline_access openid" } 
      },
      checks: ["pkce"],
      client: {
        token_endpoint_auth_method: 'none'
      },
    }),

    // ───── GitHub ──────────
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
          }),
        ]
      : []),

    // ───── Development Only ──────────
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            name: "localdev",
            credentials: {
              username: { label: "Username", type: "text", placeholder: "dev" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<string, unknown> | undefined, req: any) {
              const username = credentials?.username || "dev";
              const email = `${username}@localhost`.toLowerCase();
              return {
                id: hashValueSync(email),
                name: username as string,
                email,
                image: "",
                isAdmin: false,
              };
            },
          }),
        ]
      : []),
  ],

  // Specify 'jwt' as a literal type for NextAuth v5
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign-in
      if (account && user) {
        // Store the provider ID
        token.provider = account.provider;
        
        // Apply admin role if email is in admin list
        const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.toLowerCase().split(",").map((e) => e.trim()) || [];
        token.isAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;
        
        // Create a consistent hashed user ID for cross-provider identification
        if (user.email) {
          token.hashedUserId = hashValueSync(user.email.toLowerCase());
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        // Copy claims from token to session
        session.user.id = token.sub || "";
        session.user.isAdmin = !!token.isAdmin;
        
        // Add custom properties to session.user
        if (token.hashedUserId) {
          session.user.hashedUserId = token.hashedUserId;
        }
        if (token.provider) {
          session.user.provider = token.provider;
        }
      }
      return session;
    },
    
    // Only allow sign-in with email
    async signIn({ user }) {
      if (!user.email) {
        console.warn(`Sign-in denied for user ID ${user.id}: Missing email address.`);
        return false;
      }
      return true;
    }
  },
}; 