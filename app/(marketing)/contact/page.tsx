import { ContactForm } from "@/components/marketing/contact-form";
import { Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get help with ShareMates.",
};

export default function ContactPage() {
  return (
    <div className="relative px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center animate-fade-up">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
            <Mail className="size-6" />
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Questions, feedback, or bug reports? Send us a message — we read
            every note.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border/60 bg-card/70 p-8 shadow-card backdrop-blur animate-fade-up [animation-delay:120ms] md:p-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
