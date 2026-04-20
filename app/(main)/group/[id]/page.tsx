import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { BalanceBarChart } from "@/components/balance-bar-chart";
import { DeleteGroupDialog } from "@/components/delete-group-dialog";
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
import { computeGroupBalances } from "@/lib/balances";
import { requireUser } from "@/lib/auth";
import { fetchExpensesForGroup } from "@/lib/expense-queries";
import { formatExpenseDay } from "@/lib/format-expense-date";
import { createClient } from "@/lib/supabase/server";
import { Crown, Receipt, Users } from "lucide-react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  return { title: group?.name ? `${group.name}` : "Group" };
}

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

export default async function GroupDetailPage({ params }: PageProps) {
  await connection();
  const { id: groupId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, created_at, created_by")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: access } = await supabase
    .from("members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  const isCreator = group.created_by === user.id;
  if (!access && !isCreator) {
    notFound();
  }

  const { data: memberRows } = await supabase
    .from("members")
    .select("user_id, users(id, name, email)")
    .eq("group_id", groupId);

  type UserRow = { id: string; name: string; email: string };
  type MemberRow = { user_id: string; users: UserRow | null };

  function pickUser(
    u: UserRow | UserRow[] | null | undefined,
  ): UserRow | null {
    if (!u) {
      return null;
    }
    return Array.isArray(u) ? (u[0] ?? null) : u;
  }

  const members: MemberRow[] = (memberRows ?? []).map((row) => ({
    user_id: row.user_id as string,
    users: pickUser(
      row.users as unknown as UserRow | UserRow[] | null | undefined,
    ),
  }));
  const userNames = new Map<string, string>();
  for (const m of members) {
    const u = m.users;
    if (u) {
      userNames.set(u.id, u.name);
    }
  }

  const {
    data: expenseRows,
    error: expensesError,
  } = await fetchExpensesForGroup(supabase, groupId);

  const expenseIds = (expenseRows ?? []).map((e) => e.id);
  const splitsRes =
    expenseIds.length > 0
      ? await supabase
          .from("splits")
          .select("expense_id, user_id, amount")
          .in("expense_id", expenseIds)
      : { data: [] as { expense_id: string; user_id: string; amount: number }[], error: null };
  const splitRows = splitsRes.data ?? [];
  const splitsError = splitsRes.error;

  const memberUserIds = [...new Set(members.map((m) => m.user_id))];

  const balances = computeGroupBalances(
    (expenseRows ?? []).map((e) => ({
      id: e.id,
      amount: e.amount,
      paid_by: e.paid_by,
    })),
    splitRows,
    userNames,
    memberUserIds,
  );

  const payerIds = [...new Set((expenseRows ?? []).map((e) => e.paid_by))];
  const payerNameMap = new Map(userNames);
  if (payerIds.some((pid) => !payerNameMap.has(pid))) {
    const { data: extra } = await supabase
      .from("users")
      .select("id, name")
      .in("id", payerIds);
    for (const u of extra ?? []) {
      payerNameMap.set(u.id, u.name);
    }
  }

  const totalSpent = (expenseRows ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const initials = group.name
    .split(" ")
    .filter((s: string) => Boolean(s))
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() ?? "")
    .join("") || "G";

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      {/* Hero */}
      <div className="animate-fade-up">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-card backdrop-blur md:p-8">
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br ${gradientFor(group.id)} opacity-15 blur-3xl`}
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientFor(group.id)} text-lg font-bold text-white shadow-glow`}
              >
                {initials}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {group.name}
                  </h1>
                  {isCreator ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-amber-500/15 text-xs text-amber-700 dark:text-amber-400"
                    >
                      <Crown className="size-3" />
                      Creator
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Balances show who fronted cash vs. their share (equal splits).
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-3.5" />
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Receipt className="size-3.5" />
                    {(expenseRows ?? []).length} expenses
                  </span>
                  <span className="flex items-center gap-1.5 font-mono font-medium text-foreground">
                    ${totalSpent.toFixed(2)} total
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <AddMemberDialog groupId={groupId} />
              <AddExpenseDialog
                groupId={groupId}
                memberCount={members.length}
              />
              {isCreator ? (
                <DeleteGroupDialog groupId={groupId} groupName={group.name} />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Balances + Members */}
      <div className="grid gap-6 animate-fade-up [animation-delay:80ms] lg:grid-cols-5">
        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Group balances</CardTitle>
            <CardDescription>
              Positive = net lent to the group; negative = net owed. Sum rounds
              to zero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceBarChart rows={balances} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
            <CardDescription>{members.length} people</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members — you should be added automatically when you create
                a group.
              </p>
            ) : (
              members.map((m) => {
                const u = m.users;
                const label = u?.name ?? "Member";
                const email = u?.email ?? "";
                const self = u?.id === user.id;
                const memberInitials = label
                  .split(" ")
                  .filter((s: string) => Boolean(s))
                  .slice(0, 2)
                  .map((p: string) => p[0]?.toUpperCase() ?? "")
                  .join("") || "U";
                return (
                  <div
                    key={m.user_id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-3 py-2.5 transition-colors hover:bg-accent/40"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradientFor(m.user_id)} text-xs font-semibold text-white shadow-glow`}
                    >
                      {memberInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {label}
                        {self ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {email}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expenses */}
      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur animate-fade-up [animation-delay:160ms]">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Who paid and how the bill was split equally.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {expensesError || splitsError ? (
            <div className="px-6 pb-6">
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {expensesError?.message ??
                  splitsError?.message ??
                  "Could not load expenses."}
              </p>
            </div>
          ) : (expenseRows ?? []).length === 0 ? (
            <div className="px-6 pb-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted/60">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No expenses yet. Add the first one to see balances update.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid by</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(expenseRows ?? []).map((e) => {
                  const ex = e as {
                    spent_on?: unknown;
                    created_at?: string | null;
                  };
                  const when = formatExpenseDay(
                    ex.spent_on,
                    ex.created_at ?? null,
                  );
                  const splitsFor = splitRows.filter(
                    (s) => s.expense_id === e.id,
                  );
                  const splitLabel =
                    splitsFor.length > 0
                      ? `${splitsFor.length}-way split`
                      : "—";
                  return (
                    <TableRow
                      key={e.id}
                      className="transition-colors hover:bg-accent/40"
                    >
                      <TableCell className="text-muted-foreground">
                        {when}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{e.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {splitLabel}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payerNameMap.get(e.paid_by) ?? "—"}
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
