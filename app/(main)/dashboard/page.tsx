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
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
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

  const { data: expenses } =
    groupIds.length > 0
      ? await supabase
          .from("expenses")
          .select(
            "id, amount, description, created_at, group_id, paid_by, groups(name)",
          )
          .in("group_id", groupIds)
          .order("created_at", { ascending: false })
          .limit(12)
      : { data: [] };

  const payerIds = [
    ...new Set((expenses ?? []).map((e) => e.paid_by)),
  ];
  const { data: payers } =
    payerIds.length > 0
      ? await supabase.from("users").select("id, name").in("id", payerIds)
      : { data: [] as { id: string; name: string }[] };

  const payerNames = new Map((payers ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Hi, {user.name.split(" ")[0] ?? user.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your groups and latest expenses in one place.
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-base">Quick start</CardTitle>
            </div>
            <CardDescription>
              Create a group, add people by email, then log shared expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/groups"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              View all groups
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your groups</CardTitle>
            <CardDescription>
              {groups?.length ?? 0}{" "}
              {groups?.length === 1 ? "group" : "groups"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(groups ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No groups yet — create one to get started.
              </p>
            ) : (
              (groups ?? []).slice(0, 6).map((g) => (
                <Link key={g.id} href={`/group/${g.id}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer px-3 py-1.5 text-sm hover:bg-secondary/80"
                  >
                    {g.name}
                    <span className="ml-1 text-muted-foreground">
                      ({countByGroup.get(g.id) ?? 0})
                    </span>
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
          <CardDescription>
            Latest activity across your groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {(expenses ?? []).length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              No expenses yet. Open a group and add one.
            </p>
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
                  const when = e.created_at
                    ? new Date(e.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "—";
                  return (
                    <TableRow key={e.id}>
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
                      <TableCell className="text-right font-mono font-medium tabular-nums">
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
