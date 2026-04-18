import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireUser } from "@/lib/auth";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MainAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 glass-strong px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="mr-1 h-6" />
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Sparkles className="size-3" />
            </span>
            <span className="gradient-text font-semibold">ShareMates</span>
          </span>
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
