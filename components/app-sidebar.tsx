"use client";

import type { AppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserCircle,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="size-4" />
          </span>
          <span className="gradient-text">ShareMates</span>
        </Link>
        <p className="mt-1 truncate pl-10 text-xs text-sidebar-foreground/60">
          Split bills, stay friends
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href === "/groups" && pathname.startsWith("/group")) ||
                  (href !== "/dashboard" &&
                    href !== "/profile" &&
                    pathname.startsWith(href));
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => router.push(href)}
                      tooltip={label}
                      className="transition-all data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500/15 data-[active=true]:to-teal-500/10 data-[active=true]:text-emerald-800 dark:data-[active=true]:text-emerald-300"
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="gap-2 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/60 bg-gradient-to-br from-sidebar-accent/60 to-sidebar-accent/20 px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white shadow-glow">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => void signOut()}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
