import Link from 'next/link';

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Multi-user RAG Chat in Azure</h1>
          <p className="text-xl max-w-3xl mb-8">
            Deploy a private chat tenant in your Azure Subscription with a dedicated database per user on Neon
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-white shadow hover:bg-primary/90"
            >
              Sign In
            </Link>
            <Link
              href="/admin-auth"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    <div className="flex flex-col items-center bg-card p-6 rounded-lg shadow-sm border">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-center text-muted-foreground">{description}</p>
    </div>
  );
}
