"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { formatDebtBalanceLabel } from "@/lib/debt/balance";
import type { ContactRow, DebtTransactionRow, DebtTransactionType } from "@/lib/debt/types";

function parseAmount(raw: string): number {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Enter a valid positive amount.");
  return Math.round(n * 100) / 100;
}

export async function addContact(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!name) return { ok: false, error: "Name is required." };

  const supabase = await createClient();
  let contactUserId: string | null = null;
  if (email) {
    const { data: other } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (other?.id) {
      if (other.id === user.id) return { ok: false, error: "You cannot add yourself as a contact." };
      contactUserId = other.id;
    }
  }

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    contact_user_id: contactUserId,
    name,
    email: email || "",
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}

export type AddTransactionInput = {
  contactUserId: string;
  amount: string;
  /** UI: what you did with this person */
  flow: "i_gave" | "i_received" | "settled";
  /** When flow is settled: who paid whom */
  settleDirection?: "i_paid_them" | "they_paid_me";
  note?: string;
};

export async function addTransaction(
  input: AddTransactionInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const amount = parseAmount(input.amount);
  const note = (input.note ?? "").trim();
  const otherId = input.contactUserId;
  if (!otherId || otherId === user.id) return { ok: false, error: "Pick a registered contact for the ledger." };

  let type: DebtTransactionType;
  let sender_id: string;
  let receiver_id: string;

  if (input.flow === "i_gave") {
    type = "lend";
    sender_id = user.id;
    receiver_id = otherId;
  } else if (input.flow === "i_received") {
    type = "borrow";
    sender_id = otherId;
    receiver_id = user.id;
  } else {
    type = "settle";
    if (input.settleDirection === "i_paid_them") {
      sender_id = user.id;
      receiver_id = otherId;
    } else if (input.settleDirection === "they_paid_me") {
      sender_id = otherId;
      receiver_id = user.id;
    } else {
      return { ok: false, error: "Choose who made the settlement payment." };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    sender_id,
    receiver_id,
    amount,
    type,
    note,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}

export type RelayTransactionInput = {
  lenderUserId: string;
  recipientUserId: string;
  amount: string;
  note?: string;
};

/** Borrow from A, immediately lend to B — two ledger rows. */
export async function addRelayTransaction(
  input: RelayTransactionInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const amount = parseAmount(input.amount);
  const note = (input.note ?? "").trim();
  const { lenderUserId, recipientUserId } = input;
  if (!lenderUserId || !recipientUserId) return { ok: false, error: "Select both people." };
  if (lenderUserId === user.id || recipientUserId === user.id) {
    return { ok: false, error: "Lender and recipient must be other registered users." };
  }
  if (lenderUserId === recipientUserId) return { ok: false, error: "Lender and recipient must be different." };

  const supabase = await createClient();
  const rows = [
    { sender_id: lenderUserId, receiver_id: user.id, amount, type: "borrow" as const, note },
    { sender_id: user.id, receiver_id: recipientUserId, amount, type: "lend" as const, note },
  ];
  const { error } = await supabase.from("transactions").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}

export async function getTransactionsForContactRow(contactRowId: string): Promise<{
  contact: ContactRow;
  transactions: DebtTransactionRow[];
} | null> {
  const contact = await getMyContactRow(contactRowId);
  if (!contact) return null;
  if (!contact.contact_user_id) return { contact, transactions: [] };
  const transactions = await getTransactionsByContact(contact.contact_user_id);
  return { contact, transactions };
}

export async function getTransactionsByContact(contactUserId: string): Promise<DebtTransactionRow[]> {
  const user = await requireUser();
  if (!contactUserId || contactUserId === user.id) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, sender_id, receiver_id, amount, type, note, created_at")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${contactUserId}),and(sender_id.eq.${contactUserId},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DebtTransactionRow[];
}

export async function getBalance(me: string, contactUserId: string): Promise<number> {
  if (!contactUserId || contactUserId === me) return 0;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_debt_balance", {
    p_me: me,
    p_counterparty: contactUserId,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function listContactsWithBalances(): Promise<
  (ContactRow & { balance: number | null; balanceLabel: string })[]
> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("id, user_id, contact_user_id, name, email, created_at")
    .eq("user_id", user.id)
    .order("name");

  if (error) throw new Error(error.message);

  const rows = (contacts ?? []) as ContactRow[];

  const out: (ContactRow & { balance: number | null; balanceLabel: string })[] = [];
  for (const c of rows) {
    if (!c.contact_user_id) {
      out.push({ ...c, balance: null, balanceLabel: "Link email to a user to track balance" });
      continue;
    }
    const bal = await getBalance(user.id, c.contact_user_id);
    out.push({ ...c, balance: bal, balanceLabel: formatDebtBalanceLabel(bal) });
  }
  return out;
}

export async function getMyContactRow(contactRowId: string): Promise<ContactRow | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, user_id, contact_user_id, name, email, created_at")
    .eq("id", contactRowId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ContactRow | null) ?? null;
}

export async function getDebtDashboardTotals(): Promise<{ totalYouOwe: number; totalOwedToYou: number }> {
  const user = await requireUser();
  const contacts = await listContactsWithBalances();
  let totalYouOwe = 0;
  let totalOwedToYou = 0;
  for (const c of contacts) {
    if (c.balance == null) continue;
    if (c.balance > 0) totalOwedToYou += c.balance;
    else if (c.balance < 0) totalYouOwe += Math.abs(c.balance);
  }
  return { totalYouOwe, totalOwedToYou };
}
