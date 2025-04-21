import { redirectIfAuthenticated } from "@/components/auth-page/helpers";
import { AdminLogin } from "./admin-login";
import Link from "next/link";

export default async function AdminLoginPage() {
  await redirectIfAuthenticated();
  return (
    <main className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="p-2 rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-6 w-6">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-primary mb-2">Admin Login</h1>
        <p className="text-center text-muted-foreground mb-6">
          Access the admin dashboard
        </p>
        
        <AdminLogin 
          githubEnabled={!!process.env.AUTH_GITHUB_ID}
        />
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-2">
            Not an administrator?
          </p>
          <Link
            href="/login"
            className="text-primary hover:underline"
          >
            Go to User Login
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 