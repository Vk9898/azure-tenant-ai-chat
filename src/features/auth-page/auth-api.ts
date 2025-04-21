import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { Provider } from "next-auth/providers/index";
import { hashValue } from "./helpers";
import { createNeonProjectForUser } from "@/features/common/services/neondb";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
    email.toLowerCase().trim()
  );

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        async profile(profile) {
          return {
            ...profile,
            isAdmin: adminEmails?.includes(profile.email.toLowerCase()),
          };
        },
      })
    );
  }

  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
        async profile(profile) {
          return {
            ...profile,
            id: profile.sub,
            isAdmin:
              adminEmails?.includes(profile.email.toLowerCase()) ||
              adminEmails?.includes(profile.preferred_username.toLowerCase()),
          };
        },
      })
    );
  }

  if (process.env.NODE_ENV === "development") {
    providers.push(
      CredentialsProvider({
        name: "localdev",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "dev" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req): Promise<any> {
          const username = credentials?.username || "dev";
          const email = username + "@localhost";
          const user = {
            id: hashValue(email),
            name: username,
            email: email,
            isAdmin: false,
            image: "",
          };
          console.log(
            "=== DEV USER LOGGED IN:\n",
            JSON.stringify(user, null, 2)
          );
          return user;
        },
      })
    );
  }

  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async signIn({ user }) {
      try {
        const connectionString = await createNeonProjectForUser(user.id);
        user.databaseConnectionString = connectionString;
      } catch (error) {
        console.error(`Error creating Neon project for user ${user.id}:`, error);
        return false; // Prevent sign-in if project creation fails
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }
      if (user?.databaseConnectionString) {
        token.databaseConnectionString = user.databaseConnectionString; // Pass connection string to token
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.isAdmin = token.isAdmin as boolean;
      session.user.databaseConnectionString = token.databaseConnectionString as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

// New auth function that works in both pages/ and app/ directories
export async function auth() {
  // For development, provide a fallback user to avoid errors
  if (process.env.NODE_ENV === 'development') {
    try {
      // Try to get real token first if it exists
      if (typeof window === 'undefined') {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const sessionCookie = cookieStore.get(process.env.NEXTAUTH_SECRET ?
            `next-auth.session-token` :
            `__Secure-next-auth.session-token`);
            
          if (sessionCookie?.value) {
            // Try to use the real token if it exists
            const parts = sessionCookie.value.split('.');
            if (parts.length >= 2) {
              try {
                let base64Url = parts[1];
                let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                let jsonPayload = Buffer.from(base64, 'base64').toString();
                
                if (jsonPayload && jsonPayload.trim() !== '') {
                  const token = JSON.parse(jsonPayload);
                  return {
                    user: {
                      id: token.sub || "",
                      email: token.email || "",
                      name: token.name || "",
                      image: token.picture || "",
                      isAdmin: token.isAdmin || false,
                      databaseConnectionString: token.databaseConnectionString || null,
                    }
                  };
                }
              } catch (e) {
                console.log("Token parsing failed, using dev fallback");
              }
            }
          }
        } catch (e) {
          console.log("Cookie access failed, using dev fallback");
        }
      }
      
      // Fallback to development user
      console.log("Using development fallback authentication");
      return {
        user: {
          id: "dev-user-id",
          email: "dev@example.com",
          name: "Development User",
          image: "",
          isAdmin: true, // Set to true for development
          databaseConnectionString: null,
        }
      };
    } catch (error) {
      console.error("Error in development auth fallback:", error);
      return null;
    }
  }
  
  // Normal production flow
  try {
    // Use getServerSession for compatibility with both directories
    if (typeof window === 'undefined') {
      // We're on the server
      try {
        // Dynamic import to avoid build errors
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(process.env.NEXTAUTH_SECRET ?
          `next-auth.session-token` :
          `__Secure-next-auth.session-token`);

        if (!sessionCookie?.value) {
          console.log("No session cookie found");
          return null;
        }

        // Check if cookie value has the expected format
        const parts = sessionCookie.value.split('.');
        if (parts.length < 2) {
          console.log("Invalid session token format");
          return null;
        }

        // Safely parse the base64 part
        try {
          let base64Url = parts[1];
          let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          let jsonPayload = Buffer.from(base64, 'base64').toString();
          
          // Add more defensive parsing
          if (!jsonPayload || jsonPayload.trim() === '') {
            console.log("Empty JSON payload");
            return null;
          }

          // Parse the JSON
          const token = JSON.parse(jsonPayload);
          
          return {
            user: {
              id: token.sub || "",
              email: token.email || "",
              name: token.name || "",
              image: token.picture || "",
              isAdmin: token.isAdmin || false,
              databaseConnectionString: token.databaseConnectionString || null,
            }
          };
        } catch (parseError) {
          console.error("Error parsing token payload:", parseError);
          return null;
        }
      } catch (error) {
        console.error("Error accessing cookies:", error);
        return null;
      }
    } else {
      // We're on the client
      return null;
    }
  } catch (error) {
    console.error("Error in auth function:", error);
    return null;
  }
}

export const handlers = NextAuth(options);
