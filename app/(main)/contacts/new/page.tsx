import { AddContactForm } from "@/components/debt/add-contact-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add contact",
};

export default function NewContactPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-8">
      <Link
        href="/contacts"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "inline-flex gap-1 px-0 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4" />
        Contacts
      </Link>
      <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
        <CardHeader>
          <CardTitle>New contact</CardTitle>
          <CardDescription>Add someone for IOU tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <AddContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
