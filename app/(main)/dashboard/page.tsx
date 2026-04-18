import { CreateGroupDialog } from "@/components/create-group-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDebtDashboardTotals } from "@/app/actions/debt";
import { requireUser } from "@/lib/auth";
import { fetchRecentExpensesForGroups } from "@/lib/expense-queries";
import { formatExpenseDay } from "@/lib/format-expense-date";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, HandCoins, Receipt, Sparkles, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const debtTotals = await getDebtDashboardTotals();

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

  const { data: expenses } =
    groupIds.length > 0
      ? await fetchRecentExpensesForGroups(supabase, groupIds, 12)
      : { data: [] };

  const payerIds = [
    ...new Set((expenses ?? []).map((e) => e.paid_by)),
  ];
  const { data: payers } =
    payerIds.length > 0
      ? await supabase.from("users").select("id, name").in("id", payerIds)
      : { data: [] as { id: string; name: string }[] };

  const payerNames = new Map((payers ?? []).map((p) => [p.id, p.name]));

  const totalExpenseAmount = (expenses ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      {/* Welcome banner */}
      <div className="animate-fade-up">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/8 to-cyan-500/10 p-6 shadow-card md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-3" />
                Welcome back
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Hi, <span className="gradient-text">{firstName}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Your groups and latest expenses in one place.
              </p>
            </div>
            <CreateGroupDialog />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3 animate-fade-up [animation-delay:80ms]">
        <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-card backdrop-blur hover-lift">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-emerald-500/10 blur-2xl"
          />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wider">
                Groups
              </CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
                <Users className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {groups?.length ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {groups?.length === 1 ? "group" : "groups"} you&apos;re in
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-card backdrop-blur hover-lift">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-teal-500/10 blur-2xl"
          />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wider">
                Recent expenses
              </CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-glow">
                <Receipt className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {expenses?.length ?? 0}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              in the last 12 logged
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-card backdrop-blur hover-lift">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-cyan-500/10 blur-2xl"
          />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wider">
                Recent total
              </CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-glow">
                <TrendingUp className="size-4" />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums font-mono">
              ${totalExpenseAmount.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              across your groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal IOU */}
      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur animate-fade-up [animation-delay:120ms]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-glow">
              <HandCoins className="size-4" />
            </span>
            <div>
              <CardTitle className="text-base">Personal IOU</CardTitle>
              <CardDescription>Totals from contacts linked to registered users.</CardDescription>
            </div>
          </div>
          <Link
            href="/contacts"
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Open contacts
            <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">You owe</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
              ${debtTotals.totalYouOwe.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">You&apos;ll receive</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              ${debtTotals.totalOwedToYou.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Groups chips */}
      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur animate-fade-up [animation-delay:160ms]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base">Your groups</CardTitle>
            <CardDescription>Quick access to every group.</CardDescription>
          </div>
          <Link
            href="/groups"
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(groups ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No groups yet — create one to get started.
            </p>
          ) : (
            (groups ?? []).slice(0, 12).map((g) => (
              <Link key={g.id} href={`/group/${g.id}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer gap-2 rounded-full border border-border/50 bg-gradient-to-br from-background to-muted/60 px-3 py-1.5 text-sm font-medium transition-all hover:border-emerald-500/40 hover:shadow-glow"
                >
                  {g.name}
                  <span className="text-xs text-muted-foreground">
                    · {countByGroup.get(g.id) ?? 0}
                  </span>
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent expenses */}
      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur animate-fade-up [animation-delay:240ms]">
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
          <CardDescription>
            Latest activity across your groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {(expenses ?? []).length === 0 ? (
            <div className="px-6 pb-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted/60">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No expenses yet. Open a group and add one.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>When</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid by</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(expenses ?? []).map((e) => {
                  const g = e.groups as unknown as { name: string } | null;
                  const ex = e as {
                    spent_on?: unknown;
                    created_at?: string | null;
                  };
                  const when = formatExpenseDay(
                    ex.spent_on,
                    ex.created_at ?? null,
                    true,
                  );
                  return (
                    <TableRow
                      key={e.id}
                      className="transition-colors hover:bg-accent/40"
                    >
                      <TableCell className="text-muted-foreground">
                        {when}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/group/${e.group_id}`}
                          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          {g?.name ?? "Group"}
                        </Link>
                      </TableCell>
                      <TableCell>{e.description || "—"}</TableCell>
                      <TableCell>
                        {payerNames.get(e.paid_by) ?? "Someone"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">
                        ${Number(e.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
