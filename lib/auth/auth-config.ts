//  lib/auth/auth-config.ts
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { hashValueSync } from "@/lib/auth/auth-utils";
import { createNeonProjectForUser } from "@/features/common/services/neondb";
import type { NextAuthConfig } from "next-auth";

/* ────────────────────────────────────────────────────────── */
/*  Helpers                                                  */
/* ────────────────────────────────────────────────────────── */
const adminEmails = (process.env.ADMIN_EMAIL_ADDRESS || "")
  .toLowerCase()
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

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
              return {
                id: hashValueSync(email),
                name: username,
                email,
                isAdmin: false,
                image: "",
              };
            },
          }),
        ]
      : []),
  ],

  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

  callbacks: {
    /* ---------------- JWT Callback ---------------------- */
    async jwt({ token, account, user }) {
      if (account && user) {
        token.provider = account.provider;

        // Admin flag
        token.isAdmin =
          !!(user.email && adminEmails.includes(user.email.toLowerCase()));

        // Stable cross‑provider identifier
        if (user.email) {
          token.hashedUserId = hashValueSync(user.email.toLowerCase());
        }

        // Provision Neon DB once
        if (!token.databaseConnectionString) {
          try {
            const uid = token.sub ?? account.providerAccountId ?? user.id;
            token.databaseConnectionString =
              await createNeonProjectForUser(uid);
          } catch (err) {
            console.error("[auth] Neon provisioning failed", err);
          }
        }
      }
      return token;
    },

    /* --------------- Session Callback ------------------- */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.isAdmin = !!token.isAdmin;
        if (token.hashedUserId) session.user.hashedUserId = token.hashedUserId;
        if (token.provider) session.user.provider = token.provider;
        if (token.databaseConnectionString)
          session.user.databaseConnectionString =
            token.databaseConnectionString;
      }
      return session;
    },

    /* --------------- signIn guard ----------------------- */
    async signIn({ user }) {
      if (!user.email) {
        console.warn("[auth] sign‑in rejected: missing email");
        return false;
      }
      return true;
    },
  },
}; 