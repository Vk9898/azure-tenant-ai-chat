//  lib/auth/auth-config.ts
import NextAuth, { type User, type Session } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { hashValueSync } from "@/lib/auth/auth-utils";
// Import the function type, not the function itself at the top level

import type { NextAuthConfig } from "next-auth";
import type { AdapterUser } from "next-auth/adapters"; // Import AdapterUser type
import { CustomUser } from "./auth-helpers"; // Import CustomUser for explicit typing

/* ────────────────────────────────────────────────────────── */
/*  Secret Check & Logging                                   */
/* ────────────────────────────────────────────────────────── */
const nextAuthSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

if (!nextAuthSecret && process.env.NODE_ENV !== "development") {
  console.error(
    "\x1b[31m%s\x1b[0m", // Red color
    "[AUTH_CONFIG_ERROR] Critical: NEXTAUTH_SECRET or AUTH_SECRET environment variable is not set. Authentication will fail."
  );
  // Optionally, throw an error in production to prevent startup without a secret
  // throw new Error("Missing NEXTAUTH_SECRET or AUTH_SECRET environment variable");
} else if (!nextAuthSecret && process.env.NODE_ENV === "development") {
   console.warn(
     "\x1b[33m%s\x1b[0m", // Yellow color
     "[AUTH_CONFIG_WARNING] NEXTAUTH_SECRET or AUTH_SECRET is not set. Using a generated value for development. Ensure it's set for production."
   );
}


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
  // Check if it's a string or number that can be parsed into a valid date
  if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) return date;
  }
  // Return null for any other case (undefined, null, object, invalid date string/number)
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
                image: "", // No image for dev user
              } satisfies AdapterUser; // Ensure it satisfies the base AdapterUser type
            },
          }),
        ]
      : []),
  ],

  session: { strategy: "jwt" as const },
  secret: nextAuthSecret, // Use the checked secret

  callbacks: {
    /* ---------------- JWT Callback ---------------------- */
    async jwt({ token, account, user, profile }) {
      if (account && user) {
        token.provider = account.provider;
        token.isAdmin = !!(
          user.email && adminEmails.includes(user.email.toLowerCase())
        );

        if (user.email) {
          token.hashedUserId = hashValueSync(user.email.toLowerCase());
        } else {
           token.hashedUserId = account.providerAccountId ?? token.sub;
           console.warn(`[auth] User email missing for provider ${account.provider}. Using provider ID ${token.hashedUserId} as hashedUserId.`);
        }

        // Safely handle emailVerified from the user object
        const rawEmailVerified = (user as AdapterUser).emailVerified;
        token.emailVerified = parseEmailVerified(rawEmailVerified);

        if (!token.databaseConnectionString && token.sub) {
           console.log(`[auth] No databaseConnectionString found for user ${token.sub}. Attempting to provision...`);
          try {
            // Dynamically import the function only when needed
            const { createNeonProjectForUser } = await import("@/features/common/services/neondb");
            token.databaseConnectionString = await createNeonProjectForUser(token.sub);
            console.log(`[auth] Provisioned/retrieved Neon DB for user ${token.sub}`);
          } catch (err) {
            console.error(`[auth] Neon provisioning failed for user ${token.sub}:`, err);
            console.warn(`[auth] Falling back to default/anonymous database connection string for user ${token.sub}. Ensure ANONYMOUS_DATABASE_URL is set.`);
            token.databaseConnectionString = process.env.ANONYMOUS_DATABASE_URL; // Use default DB URL (will be undefined if not set)
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
      return token;
    },

    /* --------------- Session Callback ------------------- */
    async session({ session, token }) {

      // Ensure session.user exists and initialize with base properties from token
      if (!session.user) {
        session.user = {
          id: "",
          name: "",
          email: "",
          image: "",
          emailVerified: null,
          isAdmin: false,
          hashedUserId: "",
          provider: "",
          databaseConnectionString: "",
        }; // Initialize as empty object
      }

      // Assign base properties expected by Session['user']
      session.user.id = token.sub ?? session.user.id ?? ""; // Ensure id is always a string
      session.user.name = token.name?.toString() ?? session.user.name ?? "";
      session.user.email = token.email?.toString() ?? session.user.email ?? "";
      session.user.image = token.image?.toString() ?? session.user.image ?? "";
      session.user.emailVerified = token.emailVerified instanceof Date ? token.emailVerified : 
                                  (token.emailVerified ? new Date(token.emailVerified.toString()) : null);
      session.user.isAdmin = Boolean(token.isAdmin ?? session.user.isAdmin ?? false);
      // emailVerified is handled as a Date object or null to match the expected type

      // Use type assertion to add custom properties, extending the base Session['user']
      const customUser = session.user as CustomUser;

      customUser.isAdmin = !!token.isAdmin; // Ensure boolean

      // Assign custom properties from token
      if (token.hashedUserId) {
        customUser.hashedUserId = token.hashedUserId as string;
      }
      if (token.provider) {
        customUser.provider = token.provider as string;
      }
       if (token.databaseConnectionString) {
         customUser.databaseConnectionString = token.databaseConnectionString as string;
       } else {
         // Explicitly ensure the property is undefined if not present/null on token
         customUser.databaseConnectionString = undefined;
       }

      // Assign the correctly typed and augmented user back
      session.user = customUser as AdapterUser & { isAdmin: boolean; hashedUserId?: string | undefined; provider?: string | undefined; databaseConnectionString?: string | undefined; };

      return session;
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