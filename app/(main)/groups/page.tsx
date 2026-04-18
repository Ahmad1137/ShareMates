import { CreateGroupDialog } from "@/components/create-group-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, UsersRound } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groups",
};

const GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-teal-500 to-cyan-600",
  "from-cyan-500 to-sky-600",
  "from-sky-500 to-indigo-600",
  "from-indigo-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-pink-500 to-rose-600",
  "from-rose-500 to-orange-600",
];

function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export default async function GroupsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("members")
    .select("group_id")
    .eq("user_id", user.id);

  const groupIds = [...new Set(memberRows?.map((m) => m.group_id) ?? [])];

  const { data: groups } =
    groupIds.length > 0
      ? await supabase
          .from("groups")
          .select("id, name, created_at")
          .in("id", groupIds)
          .order("name", { ascending: true })
      : { data: [] as { id: string; name: string; created_at: string }[] };

  const { data: memberCounts } =
    groupIds.length > 0
      ? await supabase.from("members").select("group_id").in("group_id", groupIds)
      : { data: [] as { group_id: string }[] };

  const countByGroup = new Map<string, number>();
  for (const row of memberCounts ?? []) {
    countByGroup.set(row.group_id, (countByGroup.get(row.group_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 animate-fade-up sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            All groups
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Your <span className="gradient-text">groups</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Open a group to see balances and expenses.
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(groups ?? []).length === 0 ? (
          <Card className="col-span-full border-dashed bg-card/40 shadow-none backdrop-blur animate-fade-up">
            <CardHeader className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15">
                <UsersRound className="size-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <CardTitle className="mt-4">No groups yet</CardTitle>
              <CardDescription>
                Create your first group to start splitting expenses.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          (groups ?? []).map((g, i) => {
            const initials = g.name
              .split(" ")
              .filter((s: string) => Boolean(s))
              .slice(0, 2)
              .map((p: string) => p[0]?.toUpperCase() ?? "")
              .join("") || "G";
            return (
              <Link
                key={g.id}
                href={`/group/${g.id}`}
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Card className="relative h-full overflow-hidden border-border/60 bg-card/70 shadow-card backdrop-blur transition-all hover-lift hover:border-emerald-500/40">
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br ${gradientFor(g.id)} opacity-20 blur-2xl transition-opacity group-hover:opacity-30`}
                  />
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFor(g.id)} text-sm font-bold text-white shadow-glow`}
                      >
                        {initials}
                      </span>
                      <div className="space-y-1">
                        <CardTitle className="line-clamp-1 text-base">
                          {g.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs">
                          <UsersRound className="size-3" />
                          {countByGroup.get(g.id) ?? 0} members
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="gap-1 border-border/50 bg-background/50"
                    >
                      <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Created{" "}
                    {g.created_at
                      ? new Date(g.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
