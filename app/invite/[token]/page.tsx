import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { AcceptInviteCard } from "./accept-invite-card";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Invitation",
  description: "Accept your ShareMates group invitation",
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-[70vh] items-center px-4 py-12">
      <AcceptInviteCard token={token} signedInEmail={user?.email ?? null} />
    </div>
  );
}
