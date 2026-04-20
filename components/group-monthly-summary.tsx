"use client";

import { generateGroupMonthlySummary } from "@/app/actions/group-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useState, useTransition } from "react";

type SummaryState = {
  monthLabel: string;
  totalSpent: number;
  topSpender: string;
  biggestCategory: string;
  summary: string;
};

export function GroupMonthlySummary({ groupId }: { groupId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryState | null>(null);

  function onGenerate() {
    setError(null);
    startTransition(async () => {
      const res = await generateGroupMonthlySummary(groupId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult({
        monthLabel: res.monthLabel,
        totalSpent: res.totalSpent,
        topSpender: res.topSpender,
        biggestCategory: res.biggestCategory,
        summary: res.summary,
      });
    });
  }

  return (
    <Card className="border-border/60 bg-card/70 shadow-card backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Monthly summary</CardTitle>
        <Button
          type="button"
          size="sm"
          className="btn-gradient border-0 text-white shadow-glow"
          disabled={pending}
          onClick={onGenerate}
        >
          <Sparkles className="mr-1.5 size-4" />
          {pending ? "Generating..." : "Generate summary"}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        ) : result ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{result.monthLabel}</p>
            <p className="text-sm">{result.summary}</p>
            <p className="text-xs text-muted-foreground">
              Total: ${result.totalSpent.toFixed(2)} · Top spender: {result.topSpender} ·
              Biggest category: {result.biggestCategory}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Get a short AI recap for this month: total spent, top spender, and biggest
            category.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
