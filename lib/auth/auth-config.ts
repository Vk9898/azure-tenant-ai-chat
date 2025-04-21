//  lib/auth/auth-config.ts
import NextAuth, { type User, type Session } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { hashValueSync } from "@/lib/auth/auth-utils";
// Import the function type, not the function itself at the top level
import type { createNeonProjectForUser as CreateNeonProjectType } from "@/features/common/services/neondb";
import type { NextAuthConfig } from "next-auth";
import type { AdapterUser } from "next-auth/adapters"; // Import AdapterUser type
import { CustomUser } from "./auth-helpers"; // Import CustomUser for explicit typing

/* ────────────────────────────────────────────────────────── */
/*  Helpers                                                  */
/* ────────────────────────────────────────────────────────── */
const adminEmails = (process.env.ADMIN_EMAIL_ADDRESS || "")
  .toLowerCase()
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// Helper function to safely parse emailVerified from user/token
const parseEmailVerified = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
  }
  return null;
};

/* ────────────────────────────────────────────────────────── */
/*  Provider Configuration                                   */
/* ────────────────────────────────────────────────────────── */
export const authConfig: NextAuthConfig = {
  providers: [
    /* ---------------- Workforce / B2B ------------------- */
    MicrosoftEntraID({
      clientId: process.env.MT_CLIENT_ID ?? "",
      clientSecret: process.env.MT_CLIENT_SECRET ?? "",
      issuer: process.env.MT_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.MT_TENANT_ID}/v2.0`
        : "https://login.microsoftonline.com/common/v2.0",
    }),

    /* ---------------- Consumer / B2C -------------------- */
    AzureADB2CProvider({
      issuer:
        process.env.B2C_TENANT && process.env.B2C_POLICY
          ? `https://${process.env.B2C_TENANT}.b2clogin.com/${process.env.B2C_TENANT}.onmicrosoft.com/${process.env.B2C_POLICY}/v2.0`
          : undefined,
      clientId: process.env.B2C_CLIENT_ID ?? "",
      clientSecret: process.env.B2C_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "offline_access openid" } },
      checks: ["pkce"],
      client: { token_endpoint_auth_method: "client_secret_post" },
    }),

    /* ---------------- GitHub ---------------------------- */
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
          }),
        ]
      : []),

    /* ---------------- Dev Credentials ------------------- */
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            name: "localdev",
            credentials: {
              username: { label: "Username", type: "text", placeholder: "dev" },
              password: { label: "Password", type: "password" },
            },
            async authorize(creds) {
              const username = (creds?.username as string) || "dev";
              const email = `${username}@localhost`.toLowerCase();
              // Return an object satisfying AdapterUser properties expected by NextAuth core
              return {
                id: hashValueSync(email), // Use sync hash here as it's just for local dev ID
                name: username,
                email: email,
                emailVerified: null, // Dev users are not email verified by default
                // isAdmin: false, // Removed isAdmin from here, set in JWT callback
                image: "", // No image for dev user
              } satisfies AdapterUser; // Ensure it satisfies the base AdapterUser type
            },
          }),
        ]
      : []),
  ],

  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET, // Use AUTH_SECRET for Vercel deployment

  callbacks: {
    /* ---------------- JWT Callback ---------------------- */
    async jwt({ token, account, user, profile }) {
      // Ensure user and account details are present on initial sign-in
      if (account && user) {
        token.provider = account.provider; // Store the provider used

        // Determine admin status based on email
        token.isAdmin = !!(
          user.email && adminEmails.includes(user.email.toLowerCase())
        );

        // Generate and store a consistent hashed user ID based on email
        if (user.email) {
          token.hashedUserId = hashValueSync(user.email.toLowerCase());
        } else {
           token.hashedUserId = account.providerAccountId ?? token.sub;
           console.warn(`[auth] User email missing for provider ${account.provider}. Using provider ID ${token.hashedUserId} as hashedUserId.`);
        }

        // Forward emailVerified status from user object if available
        // Check if 'emailVerified' exists on the user object before accessing
        const rawEmailVerified = (user as AdapterUser).emailVerified;
        token.emailVerified = parseEmailVerified(rawEmailVerified);


        // Provision Neon DB *only if* the connection string isn't already in the token
        if (!token.databaseConnectionString && token.sub) {
           console.log(`[auth] No databaseConnectionString found for user ${token.sub}. Attempting to provision...`);
          try {
            const { createNeonProjectForUser } = await import("@/features/common/services/neondb");
            token.databaseConnectionString = await createNeonProjectForUser(token.sub);
            console.log(`[auth] Provisioned/retrieved Neon DB for user ${token.sub}`);
          } catch (err) {
            console.error(`[auth] Neon provisioning failed for user ${token.sub}:`, err);
            console.warn(`[auth] Falling back to default database connection string for user ${token.sub}. Ensure DATABASE_URL is set.`);
            token.databaseConnectionString = process.env.DATABASE_URL ?? null; // Use default DB URL or null
            if (!token.databaseConnectionString) {
              console.error("[auth] FATAL: Fallback failed. DATABASE_URL environment variable is not set.");
            }
          }
        } else if (token.databaseConnectionString) {
             console.log(`[auth] Found existing databaseConnectionString for user ${token.sub}.`);
        } else if (!token.sub) {
            console.error(`[auth] Cannot provision Neon DB: token.sub is missing.`);
        }
      }
      return token; // Return the updated token
    },

    /* --------------- Session Callback ------------------- */
    async session({ session, token }) {

       // Initialize session.user if it doesn't exist, fulfilling basic User type
       if (!session.user) {
         session.user = {
           id: token.sub || "anonymous", // Provide a default id
           name: token.name || null,
           email: token.email || null,
           image: token.image || null,
         };
       }

      // Assign properties from token to session.user, ensuring base properties are handled
      session.user.id = token.sub || session.user.id || "";
      session.user.name = token.name || session.user.name || null;
      session.user.email = token.email || session.user.email || null;
      session.user.image = token.image || session.user.image || null;
      session.user.emailVerified = token.emailVerified || session.user.emailVerified || null;
      // No need to assign emailVerified here, it's part of the default Session.user if using Adapter

      // Now, safely add our custom properties
      const customUser = session.user as CustomUser; // Use our extended type

      customUser.isAdmin = !!token.isAdmin; // Ensure boolean

      if (token.hashedUserId) {
        customUser.hashedUserId = token.hashedUserId as string;
      }
      if (token.provider) {
        customUser.provider = token.provider as string;
      }
      if (token.databaseConnectionString) {
        customUser.databaseConnectionString = token.databaseConnectionString as string;
      } else {
        // Ensure property exists even if null/undefined from token for type consistency
        customUser.databaseConnectionString = undefined;
      }

      session.user = customUser; // Assign the fully typed user back

      return session; // Return the augmented session object
    },

    /* --------------- signIn guard ----------------------- */
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.warn(`[auth] Sign-in rejected for user without email (provider: ${account?.provider})`);
        return false;
      }
      console.log(`[auth] User ${user.email} signing in via ${account?.provider}`);
      return true;
    },
  },
}; 