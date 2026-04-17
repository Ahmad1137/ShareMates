import { requireUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-lg space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account details from your sign-in. Name and email sync to your group
          directory.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>
            Managed through Supabase Auth. Password changes happen on the sign-in
            flow when we add that UI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Display name
            </p>
            <p className="mt-1 text-lg font-medium">{user.name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </p>
            <p className="mt-1 font-mono text-sm">{user.email}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User ID
            </p>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
              {user.id}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to dashboard
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Marketing site
        </Link>
      </div>
    </div>
  );
}
