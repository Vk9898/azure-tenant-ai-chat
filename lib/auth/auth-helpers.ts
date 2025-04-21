import { auth } from "./auth-api"; // Import auth function from our config
import { Session } from "next-auth"; // Import Session type
import { RedirectToPage } from "../../components/common/navigation-helpers";
import { redirect } from "next/navigation";
import { hashValue, hashValueSync } from "./auth-utils";

// Define the expected structure of the user object within the session
// Removed databaseConnectionString as it's handled per-request now
export interface CustomUser {
  id?: string | null; // From token.sub (provider-specific ID)
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean; // Changed to match NextAuth v5 type (no null)
  hashedUserId?: string | null; // Consistent hashed ID (based on email)
  provider?: string | null;
  databaseConnectionString?: string; // Add this property
}

// For backwards compatibility
export interface CustomSession extends Omit<Session, "user"> {
  user?: CustomUser;
}

/**
 * Server-side function to get user session
 * Only use in Server Components or Route Handlers
 */
export const userSession = async (): Promise<CustomUser | null> => {
  // Use the auth() function from NextAuth v5
  const session = await auth();
  if (session && session.user) {
    // Return user data
    return session.user as CustomUser;
  }
  return null;
};

// Add the getCurrentUser function to maintain backwards compatibility
export const getCurrentUser = async (): Promise<CustomUser> => {
  const user = await userSession();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
};

/**
 * Server-side redirect if user is authenticated
 * Only use in Server Components or Route Handlers
 */
export const redirectIfAuthenticated = async (path = '/chat') => {
  const session = await auth();
  if (session) {
    redirect(path);
  }
};

/**
 * Server-side redirect to login if user is not authenticated
 * Only use in Server Components or Route Handlers
 */
export const redirectToLoginIfUnauthenticated = async () => {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }
};

// This function returns the CONSISTENT identifier used across the system,
// primarily for database lookups and linking data to a user regardless of login provider.
// Using a hash of the lowercase email is the most reliable approach here.
export const getUserIdentifier = async (): Promise<string> => {
  const user = await userSession();

  // Prioritize the hashedUserId from the token if available (set during JWT callback)
  if (user?.hashedUserId) {
    return user.hashedUserId;
  }
  // Fallback: hash the email if hashedUserId wasn't set or is missing
  if (user?.email) {
     console.warn("User identifier: Falling back to hashing email directly in getUserIdentifier.");
    return hashValueSync(user.email.toLowerCase());
  }
  // Fallback: Use provider-specific ID if email is somehow missing (least desirable)
  if (user?.id) {
    console.warn("User identifier: Falling back to provider ID (sub claim) - this may cause issues with consistency.");
    return user.id;
  }

  throw new Error("Could not determine a consistent user identifier (hashedUserId, email, or ID missing).");
};

// Kept for backward compatibility or specific use cases, but prefer getUserIdentifier.
export const userHashedId = async (): Promise<string> => {
    return getUserIdentifier(); // Delegate to the consistent identifier function
};

// Exporting the type for use elsewhere (redefined above)
export type UserModel = CustomUser;