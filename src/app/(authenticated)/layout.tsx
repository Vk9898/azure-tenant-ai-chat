import { AuthenticatedProviders } from "@/features/globals/providers";
import { MainMenu } from "@/features/main-menu/main-menu";
import { MobileNavigation } from "@/features/main-menu/mobile-navigation";
import { AI_NAME } from "@/features/theme/theme-config";
import { cn } from "@/ui/lib";
import { getCurrentUser } from "@/features/auth-page/helpers";

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
  const user = await getCurrentUser();
  const isAdmin = user.isAdmin;

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
