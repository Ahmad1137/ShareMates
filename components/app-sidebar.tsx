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
import { LayoutDashboard, LogOut, UserCircle, UsersRound } from "lucide-react";
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

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          ShareMates
        </Link>
        <p className="truncate text-xs text-sidebar-foreground/70">
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
      <SidebarFooter className="gap-2 p-2">
        <div className="rounded-lg bg-sidebar-accent/50 px-2 py-2 text-xs">
          <p className="truncate font-medium text-sidebar-foreground">
            {user.name}
          </p>
          <p className="truncate text-sidebar-foreground/70">{user.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 border-sidebar-border bg-sidebar hover:bg-sidebar-accent"
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
