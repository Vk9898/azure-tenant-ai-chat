import { AuthenticatedProviders } from "@/components/globals/providers";
import { MainMenu } from "@/components/main-menu/main-menu";
import { MobileNavigation } from "@/components/main-menu/mobile-navigation";
import { AI_NAME } from "@/components/theme/theme-config";
import { cn } from "@/ui/lib";
import { auth } from "@/components/auth-page/auth-api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.isAdmin || false;

  return (
    <AuthenticatedProviders>
      <div className={cn("flex flex-1 items-stretch")}>
        <MainMenu />
        <div className="flex-1 flex flex-col pb-16 md:pb-0">{children}</div>
        <MobileNavigation isAdmin={isAdmin} />
      </div>
    </AuthenticatedProviders>
  );
}
