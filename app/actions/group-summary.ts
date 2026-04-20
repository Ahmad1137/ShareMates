"use server";

import { requireUser } from "@/lib/auth";
import { fetchExpensesForGroup } from "@/lib/expense-queries";
import { createClient } from "@/lib/supabase/server";

type SummaryResult =
  | {
      ok: true;
      monthLabel: string;
      totalSpent: number;
      topSpender: string;
      biggestCategory: string;
      summary: string;
    }
  | { ok: false; error: string };

const CATEGORY_RULES: Array<{ name: string; words: string[] }> = [
  { name: "Food & Drinks", words: ["food", "dinner", "lunch", "breakfast", "cafe", "coffee", "restaurant", "pizza", "burger", "drink"] },
  { name: "Transport", words: ["uber", "taxi", "bus", "metro", "train", "flight", "fuel", "gas", "petrol"] },
  { name: "Stay", words: ["hotel", "rent", "airbnb", "hostel", "apartment"] },
  { name: "Groceries", words: ["grocery", "groceries", "market", "supermarket"] },
  { name: "Entertainment", words: ["movie", "cinema", "netflix", "games", "concert", "party"] },
];

function categorize(description: string): string {
  const d = description.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.words.some((w) => d.includes(w))) return rule.name;
  }
  return "Other";
}

function monthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

async function generateWithGemini(input: {
  monthLabel: string;
  totalSpent: number;
  topSpender: string;
  biggestCategory: string;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const prompt = `Write one short monthly group expense recap (max 2 sentences, friendly tone).
Month: ${input.monthLabel}
Total spent: $${input.totalSpent.toFixed(2)}
Top spender: ${input.topSpender}
Biggest category: ${input.biggestCategory}
Return plain text only.`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 120 },
      }),
      cache: "no-store",
    },
  );

  if (!resp.ok) return null;
  const json = (await resp.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || null;
}

export async function generateGroupMonthlySummary(
  groupId: string,
): Promise<SummaryResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, created_by")
    .eq("id", groupId)
    .maybeSingle();
  if (!group) return { ok: false, error: "Group not found." };

  const { data: membership } = await supabase
    .from("members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  const canAccess = group.created_by === user.id || Boolean(membership);
  if (!canAccess) return { ok: false, error: "You do not have access." };

  const { data: expenses, error } = await fetchExpensesForGroup(supabase, groupId);
  if (error) return { ok: false, error: error.message };

  const { start, end } = monthRange();
  const monthRows = (expenses ?? []).filter((e) => {
    const dateLike = (e as { spent_on?: string | null; created_at?: string | null })
      .spent_on ??
      (e as { spent_on?: string | null; created_at?: string | null }).created_at;
    if (!dateLike) return false;
    const dt = new Date(dateLike);
    return dt >= start && dt < end;
  });

  const monthLabel = start.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  if (monthRows.length === 0) {
    return {
      ok: true,
      monthLabel,
      totalSpent: 0,
      topSpender: "N/A",
      biggestCategory: "N/A",
      summary: `No expenses were logged in ${monthLabel} for this group.`,
    };
  }

  const totalSpent = monthRows.reduce((sum, e) => sum + Number(e.amount), 0);

  const spendByUser = new Map<string, number>();
  const spendByCategory = new Map<string, number>();
  for (const e of monthRows) {
    spendByUser.set(e.paid_by, (spendByUser.get(e.paid_by) ?? 0) + Number(e.amount));
    const cat = categorize(e.description ?? "");
    spendByCategory.set(cat, (spendByCategory.get(cat) ?? 0) + Number(e.amount));
  }

  const topSpenderId =
    [...spendByUser.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const { data: payer } = topSpenderId
    ? await supabase.from("users").select("name").eq("id", topSpenderId).maybeSingle()
    : { data: null };
  const topSpender = payer?.name ?? "Unknown member";

  const biggestCategory =
    [...spendByCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Other";

  const aiSummary = await generateWithGemini({
    monthLabel,
    totalSpent,
    topSpender,
    biggestCategory,
  });
  const summary =
    aiSummary ??
    `In ${monthLabel}, the group spent $${totalSpent.toFixed(2)}. ${topSpender} spent the most, and ${biggestCategory} was the biggest category.`;

  return {
    ok: true,
    monthLabel,
    totalSpent,
    topSpender,
    biggestCategory,
    summary,
  };
}
