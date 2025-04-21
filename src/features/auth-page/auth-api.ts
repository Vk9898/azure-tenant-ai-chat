// src/app/api/auth/[...nextauth]/route.ts   (or pages/api/auth/[...nextauth].ts)
import NextAuth from "next-auth";

// ─── Providers ──────────────────────────────────────────────────────────────
import GitHubProvider from "next-auth/providers/github";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"; // Import from separate package
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";              // Consumer / CIAM  [oai_citation_attribution:1‡Auth.js | Authentication for the Web](https://authjs.dev/reference/core/providers/azure-ad-b2c)
import CredentialsProvider from "next-auth/providers/credentials";

import { hashValue } from "@/features/auth-page/helpers";
import { createNeonProjectForUser } from "@/features/common/services/neondb";

// ─── Helpers ────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL_ADDRESS ?? "")
  .split(",")
  .map((e) => e.toLowerCase().trim())
  .filter(Boolean);

const isAdmin = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());

// ─── NextAuth (v5) config ───────────────────────────────────────────────────
export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,                           // JWT/CSRF signing  [oai_citation_attribution:2‡Auth.js | Authentication for the Web](https://authjs.dev/getting-started/migrating-to-v5?utm_source=chatgpt.com)
  session: { strategy: "jwt" },

  // —— Providers array ————————————————————————————————————————————————
  providers: [
    /* GitHub – unchanged */                                      // OAuth ref  [oai_citation_attribution:3‡NextAuth.js](https://next-auth.js.org/configuration/providers/oauth?utm_source=chatgpt.com)
    process.env.AUTH_GITHUB_ID &&
      process.env.AUTH_GITHUB_SECRET &&
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
        profile(p) {
          return {
            id: String(p.id),
            name: p.name ?? p.login,
            email: p.email,
            image: p.avatar_url,
            isAdmin: isAdmin(p.email),
          };
        },
      }),

    /* Microsoft Entra ID (workforce / multitenant) */            // Provider docs  [oai_citation_attribution:4‡Auth.js | Authentication for the Web](https://authjs.dev/getting-started/providers/microsoft-entra-id?utm_source=chatgpt.com)
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
      process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
      process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER &&
      MicrosoftEntraID({
        clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
        clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
        issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,       // e.g. https://login.microsoftonline.com/<tenantId>/v2.0
        profile(p) {
          const email =
            p.email ?? p.preferred_username ?? p.unique_name ?? "";
          return {
            id: p.sub,
            name: p.name ?? email,
            email,
            image: p.picture,
            isAdmin: isAdmin(email),
          };
        },
      }),

    /* Azure AD B2C (consumer flow) */                            // v5 requires issuer, not tenantId  [oai_citation_attribution:5‡GitHub](https://github.com/nextauthjs/next-auth/issues/12175?utm_source=chatgpt.com)
    process.env.AUTH_AZURE_AD_B2C_ID &&
      process.env.AUTH_AZURE_AD_B2C_SECRET &&
      process.env.AUTH_AZURE_AD_B2C_ISSUER &&
      AzureADB2CProvider({
        clientId: process.env.AUTH_AZURE_AD_B2C_ID,
        clientSecret: process.env.AUTH_AZURE_AD_B2C_SECRET,
        issuer: process.env.AUTH_AZURE_AD_B2C_ISSUER,             // e.g. https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<userFlow>/v2.0/
        profile(p) {
          const email =
            p.email ?? p.emails?.[0] ?? p.preferred_username ?? "";
          return {
            id: p.sub,
            name: p.name ?? email,
            email,
            image: p.picture,
            isAdmin: isAdmin(email),
          };
        },
      }),

    /* Local‑dev back‑door (only in development) */
    process.env.NODE_ENV === "development" &&
      CredentialsProvider({
        name: "Local Dev",
        credentials: {
          username: { label: "Username", type: "text", value: "dev" },
          password: { label: "Password", type: "password" },
        },
        async authorize({ username }) {
          const email = `${username}@localhost`;
          return {
            id: hashValue(email),
            name: username,
            email,
            isAdmin: false,
            image: "",
          };
        },
      }),
  ].filter(Boolean), // removes any undefined entries

  // —— Callbacks ————————————————————————————————————————————————
  callbacks: {
    /** Provision a Neon database & persist flags */
    async signIn({ user }) {
      try {
        user.databaseConnectionString = await createNeonProjectForUser(user.id);
        return true;
      } catch (err) {
        console.error("Neon provisioning failed:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.isAdmin) token.isAdmin = true;
      if (user?.databaseConnectionString)
        token.databaseConnectionString = user.databaseConnectionString;
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = !!token.isAdmin;
      if (token.databaseConnectionString)
        session.user.databaseConnectionString =
          token.databaseConnectionString as string;
      return session;
    },
  },
});