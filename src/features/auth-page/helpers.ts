import { createHash } from "crypto";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RedirectToPage } from "../common/navigation-helpers";
import { options } from "./auth-api";

export const userSession = async (): Promise<UserModel | null> => {
  const session = await getServerSession(options);
  if (session && session.user) {
    return {
      name: session.user.name!,
      image: session.user.image!,
      email: session.user.email!,
      isAdmin: session.user.isAdmin!,
      databaseConnectionString: session.user.databaseConnectionString!,
    };
  }

  return null;
};

// Use this when you need to handle anonymous users gracefully
export const getUserOrNull = async (): Promise<UserModel | null> => {
  return await userSession();
};

// Use this when you need to enforce authentication and redirect anonymous users
export const getCurrentUser = async (): Promise<UserModel> => {
  const user = await userSession();
  if (user) {
    return user;
  }
  redirect('/');
};

export const userHashedId = async (): Promise<string | null> => {
  const user = await getUserOrNull();
  if (!user) {
    return null;
  }
  return hashValue(user.email);
};

export const hashValue = (value: string): string => {
  return createHash("sha256").update(value).digest("hex");
};

export const redirectIfAuthenticated = async () => {
  const user = await userSession();
  if (user) {
    // Redirect admin users to the reporting page and regular users to chat
    if (user.isAdmin) {
      RedirectToPage("reporting");
    } else {
      RedirectToPage("chat");
    }
  }
};

export type UserModel = {
  name: string;
  image: string;
  email: string;
  isAdmin: boolean;
  databaseConnectionString: string;
};
