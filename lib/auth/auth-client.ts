import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side hook to redirect if the user is authenticated
 * Use in client components
 */
export const useRedirectIfAuthenticated = (path = '/chat') => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(path);
    }
  }, [session, status, router, path]);

  return { isLoading: status === "loading" };
};

/**
 * Client-side hook to redirect to login if the user is not authenticated
 * Use in client components
 */
export const useRedirectToLoginIfUnauthenticated = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  return { 
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated"
  };
};

/**
 * Client-side utility to check if the user is authenticated
 * Use in client components
 */
export const useAuthStatus = () => {
  const { data: session, status } = useSession();
  
  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user || null
  };
}; 