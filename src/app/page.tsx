import { Suspense } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/features/ui/button';
import { auth } from '@/features/auth-page/auth-api';

export default async function Home() {
  // Use the new auth() function which properly awaits cookies() internally
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-primary mb-4">Multi-user RAG Chat in Azure</h1>
          <div className="ds-accent-bar"></div>
          <p className="text-lg sm:text-xl max-w-3xl mb-6 sm:mb-8 text-foreground">
            Deploy a private chat tenant in your Azure Subscription with a dedicated database per user on Neon
          </p>
          <div className="flex flex-col gap-4 max-w-[600px] mx-auto w-full">
            {session && (
              <Link href="/chat" className={buttonVariants({ size: "lg", className: "ds-button-primary min-h-11 w-full sm:w-auto" })}>
                Start Chat
              </Link>
            )}
            {!session && (
              <>
                <Link href="/auth/signin" className={buttonVariants({ size: "lg", className: "ds-button-primary min-h-11 w-full" })}>
                  Sign In
                </Link>
                <Link href="/public-chat" className={buttonVariants({ size: "lg", variant: "outline", className: "ds-button-outline min-h-11 w-full" })}>
                  Try Public Chat Demo
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            title="Database per user"
            description="Keeps chat data isolated by creating a separate database instance per user"
            icon="💾"
          />
          <FeatureCard
            title="AI-Powered Conversations"
            description="Chat with documents such as PDF. Build your own prompt templates"
            icon="🧠"
          />
          <FeatureCard
            title="Customizable Chat Personas"
            description="Personalize conversations with user-defined chat personas"
            icon="🎨"
          />
          <FeatureCard
            title="Extensions Support"
            description="Extend chat functionalities by defining custom extensions"
            icon="🛠️"
          />
          <FeatureCard
            title="Speech and Voice Support"
            description="Enable multilingual voice interactions in the chat application"
            icon="🎙️"
          />
          <FeatureCard
            title="Deployment-Ready Architecture"
            description="Fully deployable to Azure App Service with scalability for enterprise workloads"
            icon="🌐"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex flex-col items-center bg-card p-4 sm:p-6 rounded-xs shadow-xs border-2 border-border" data-slot="feature-card">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-bold mb-2">{title}</h3>
      <p className="text-center text-muted-foreground">{description}</p>
    </div>
  );
}
