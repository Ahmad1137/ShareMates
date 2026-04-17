import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { AddMemberDialog } from "@/components/add-member-dialog";
import { BalanceBarChart } from "@/components/balance-bar-chart";
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
import { createClient } from "@/lib/supabase/server";
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

export default async function GroupDetailPage({ params }: PageProps) {
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

  const { data: expenseRows } = await supabase
    .from("expenses")
    .select("id, amount, description, created_at, paid_by")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  const expenseIds = (expenseRows ?? []).map((e) => e.id);
  const { data: splitRows } =
    expenseIds.length > 0
      ? await supabase
          .from("splits")
          .select("expense_id, user_id, amount")
          .in("expense_id", expenseIds)
      : { data: [] };

  const memberUserIds = [...new Set(members.map((m) => m.user_id))];

  const balances = computeGroupBalances(
    (expenseRows ?? []).map((e) => ({
      id: e.id,
      amount: e.amount,
      paid_by: e.paid_by,
    })),
    splitRows ?? [],
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {group.name}
            </h1>
            {isCreator ? (
              <Badge variant="secondary" className="text-xs">
                You created this group
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Balances show who fronted cash vs. their share (equal splits).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddMemberDialog groupId={groupId} />
          <AddExpenseDialog
            groupId={groupId}
            memberCount={members.length}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/80 shadow-sm lg:col-span-3">
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

        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
            <CardDescription>{members.length} people</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members — you should be added automatically when you create a
                group.
              </p>
            ) : (
              members.map((m) => {
                const u = m.users;
                const label = u?.name ?? "Member";
                const email = u?.email ?? "";
                const self = u?.id === user.id;
                return (
                  <div
                    key={m.user_id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {label}
                        {self ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Who paid and how the bill was split equally.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {(expenseRows ?? []).length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              No expenses yet. Add the first one to see balances update.
            </p>
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
                  const when = e.created_at
                    ? new Date(e.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";
                  const splitsFor = (splitRows ?? []).filter(
                    (s) => s.expense_id === e.id,
                  );
                  const splitLabel =
                    splitsFor.length > 0
                      ? `${splitsFor.length}-way split`
                      : "—";
                  return (
                    <TableRow key={e.id}>
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
