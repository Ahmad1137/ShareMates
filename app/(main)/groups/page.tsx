import { CreateGroupDialog } from "@/components/create-group-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groups",
};

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
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Groups</h1>
          <p className="mt-1 text-muted-foreground">
            Open a group to see balances and expenses.
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      <div className="grid gap-4">
        {(groups ?? []).length === 0 ? (
          <Card className="border-dashed shadow-sm">
            <CardHeader>
              <CardTitle>No groups yet</CardTitle>
              <CardDescription>
                Create your first group to start splitting expenses.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          (groups ?? []).map((g) => (
            <Link key={g.id} href={`/group/${g.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{g.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="size-3.5" />
                      {countByGroup.get(g.id) ?? 0} members
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    Open
                    <ChevronRight className="size-3" />
                  </Badge>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Created{" "}
                  {g.created_at
                    ? new Date(g.created_at).toLocaleDateString()
                    : "—"}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
