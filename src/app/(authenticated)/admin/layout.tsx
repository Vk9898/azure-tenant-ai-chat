import { getCurrentUser } from "@/features/auth-page/helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, ListFilter, SparklesIcon } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-1 overflow-hidden">
        {/* Admin sidebar navigation */}
        <aside className="bg-muted/50 w-64 h-full hidden md:block border-r p-4">
          <div className="space-y-4 flex flex-col h-full">
            <h2 className="text-xl font-semibold">Admin Panel</h2>
            <nav className="space-y-2 flex-1">
              <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <AdminNavLink href="/admin/users" icon={<Users size={18} />} label="Users" />
              <AdminNavLink href="/admin/chats" icon={<MessageSquare size={18} />} label="Chat Histories" />
              <AdminNavLink href="/admin/playground" icon={<SparklesIcon size={18} />} label="Chat Playground" />
              <AdminNavLink href="/reporting" icon={<ListFilter size={18} />} label="Reports" />
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

interface AdminNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function AdminNavLink({ href, icon, label }: AdminNavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
} 