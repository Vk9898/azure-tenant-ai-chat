import { redirectIfAuthenticated } from "@/lib/auth/auth-helpers";
import { LogIn } from "@/components/auth-page/login";
import Link from "next/link";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <main className="container flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">User Login</h1>
      
      <LogIn
        isDevMode={process.env.NODE_ENV === "development"}
        githubEnabled={!!process.env.AUTH_GITHUB_ID}
        entraIdEnabled={!!process.env.AZURE_AD_CLIENT_ID}
      />
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-2">
          Need to access administrator features?
        </p>
        <Link
          href="/admin-auth"
          className="text-primary hover:underline"
        >
          Go to Admin Login
        </Link>
      </div>
      
      <div className="mt-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
} 