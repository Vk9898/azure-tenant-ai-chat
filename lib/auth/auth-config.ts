//  lib/auth/auth-config.ts
import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { hashValueSync } from "@/lib/auth/auth-utils";
// Import the function type, not the function itself at the top level
import type { createNeonProjectForUser as CreateNeonProjectType } from "@/features/common/services/neondb";
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
                id: hashValueSync(email), // Use sync hash here as it's just for local dev ID
                name: username,
                email,
                isAdmin: false, // Dev users are not admins by default
                image: "", // No image for dev user
              };
            },
          }),
        ]
      : []),
  ],

  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET, // Use AUTH_SECRET for Vercel deployment

  callbacks: {
    /* ---------------- JWT Callback ---------------------- */
    // This callback is called whenever a JWT is created (i.e. on sign in) or updated.
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
          // Use the sync hash function for stability across environments if needed,
          // or prefer the async one if edge compatibility is crucial and can wait.
          // hashValueSync is generally safer here to avoid async issues during JWT creation.
          token.hashedUserId = hashValueSync(user.email.toLowerCase());
        } else {
           // Handle cases where email might be missing (e.g., some OAuth providers might not return it)
           // Use provider account ID as a fallback, less ideal for cross-provider consistency
           token.hashedUserId = account.providerAccountId ?? token.sub;
           console.warn(`[auth] User email missing for provider ${account.provider}. Using provider ID ${token.hashedUserId} as hashedUserId.`);
        }


        // Provision Neon DB *only if* the connection string isn't already in the token
        if (!token.databaseConnectionString && token.sub) {
           console.log(`[auth] No databaseConnectionString found for user ${token.sub}. Attempting to provision...`);
          try {
            // Dynamically import createNeonProjectForUser *inside* the callback
            const { createNeonProjectForUser } = await import("@/features/common/services/neondb");
            // Use token.sub (subject claim, usually provider's unique ID) for Neon project naming
            token.databaseConnectionString = await createNeonProjectForUser(token.sub);
            console.log(`[auth] Provisioned/retrieved Neon DB for user ${token.sub}`);
          } catch (err) {
            console.error(`[auth] Neon provisioning failed for user ${token.sub}:`, err);
            // Fallback to the default anonymous connection string if provisioning fails
            console.warn(`[auth] Falling back to default database connection string for user ${token.sub}. Ensure DATABASE_URL is set.`);
            token.databaseConnectionString = process.env.DATABASE_URL; // Use default DB URL
            if (!token.databaseConnectionString) {
              console.error("[auth] FATAL: Fallback failed. DATABASE_URL environment variable is not set.");
              // Potentially prevent login or throw an error if default DB is essential
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
    // This callback is called whenever a session is checked.
    async session({ session, token }) {
      // Ensure session.user exists
      if (!session.user) {
        session.user = {
          id: token.sub || "",
          email: token.email || "",
          emailVerified: token.emailVerified || null,
          name: token.name || "",
          image: token.image || "",
        };
      }

      // Add properties from the token to the session user object
      // These properties are now available on the client-side useSession() hook
      session.user.id = token.sub || ""; // Use token.sub as the primary user ID
      session.user.isAdmin = !!token.isAdmin; // Ensure boolean type

      // Add custom properties if they exist on the token
       if (token.hashedUserId) {
         session.user.hashedUserId = token.hashedUserId as string;
       }
       if (token.provider) {
         session.user.provider = token.provider as string;
       }
       // IMPORTANT: Only attach connection string if it exists AND is not null/undefined
       if (token.databaseConnectionString) {
         session.user.databaseConnectionString = token.databaseConnectionString as string;
       }

      return session; // Return the augmented session object
    },

    /* --------------- signIn guard ----------------------- */
    // This callback is called before the user is signed in.
    async signIn({ user, account, profile }) {
      // Example guard: Allow sign-in only if the user has an email address
      if (!user.email) {
        console.warn(`[auth] Sign-in rejected for user without email (provider: ${account?.provider})`);
        // You could redirect to an error page here if desired
        // return '/auth/error?error=EmailRequired';
        return false; // Returning false prevents the sign-in
      }
      console.log(`[auth] User ${user.email} signing in via ${account?.provider}`);
      return true; // Allow the sign-in
    },
  },
  // Add pages configuration if needed
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error',
  // }
}; 