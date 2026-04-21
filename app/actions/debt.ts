"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { formatDebtBalanceLabel } from "@/lib/debt/balance";
import { sendContactNotificationEmail } from "@/lib/email/send-contact-notification-email";
import type {
  ContactRow,
  DebtTransactionRow,
  DebtTransactionType,
} from "@/lib/debt/types";

function parseAmount(raw: string): number {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0)
    throw new Error("Enter a valid positive amount.");
  return Math.round(n * 100) / 100;
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Resolve a contact row by `contacts.id` or by linked `contact_user_id`. */
async function resolveContactRow(
  contactInput: string,
  ownerId: string,
  supabase: SupabaseServer,
): Promise<{ id: string; contact_user_id: string | null; name: string } | null> {
  const byId = await supabase
    .from("contacts")
    .select("id, contact_user_id, name")
    .eq("user_id", ownerId)
    .eq("id", contactInput)
    .maybeSingle();
  if (byId.error) throw new Error(byId.error.message);
  if (byId.data) return byId.data;

  const byLinkedUser = await supabase
    .from("contacts")
    .select("id, contact_user_id, name")
    .eq("user_id", ownerId)
    .eq("contact_user_id", contactInput)
    .maybeSingle();
  if (byLinkedUser.error) throw new Error(byLinkedUser.error.message);
  return byLinkedUser.data ?? null;
}

const TX_SEL_FULL =
  "id, sender_id, receiver_id, contact_id, amount, type, note, created_at";
const TX_SEL_LEGACY = "id, sender_id, receiver_id, amount, type, note, created_at";

function isMissingContactLedgerRpc(
  message: string,
  code?: string,
): boolean {
  return (
    /could not find the function/i.test(message) ||
    /schema cache/i.test(message) ||
    code === "PGRST202" ||
    code === "42883"
  );
}

function isMissingContactIdColumn(message: string, code?: string): boolean {
  return (
    code === "42703" ||
    (/contact_id/i.test(message) &&
      /does not exist|column/i.test(message))
  );
}

/** PostgREST: column missing or schema cache not reloaded after migration. */
function isPostgrestMissingContactIdColumn(error: {
  message?: string | null;
  code?: string | null;
}): boolean {
  const m = error.message ?? "";
  const c = error.code ?? "";
  return (
    isMissingContactIdColumn(m, c) ||
    (/contact_id/i.test(m) && /schema cache/i.test(m))
  );
}

const OFFLINE_IOU_DB_HINT =
  "Offline IOU needs database migration 013. In Supabase → SQL Editor, run the file db/013_debt_contact_scoped_transactions.sql from this repo, then run: NOTIFY pgrst, 'reload schema';";

/** Same sign convention as `get_contact_ledger_balance` in SQL. */
function computeContactLedgerBalanceFromTransactions(
  ownerId: string,
  contactRowId: string,
  cpUser: string | null,
  transactions: DebtTransactionRow[],
): number {
  let balance = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (!Number.isFinite(amt)) continue;
    const cid = t.contact_id ?? null;

    const lendMatch =
      t.type === "lend" &&
      t.sender_id === ownerId &&
      (cid === contactRowId ||
        (cid == null &&
          cpUser != null &&
          t.receiver_id != null &&
          t.receiver_id === cpUser));
    if (lendMatch) balance += amt;

    const borrowMatch =
      t.type === "borrow" &&
      t.receiver_id === ownerId &&
      (cid === contactRowId ||
        (cid == null &&
          cpUser != null &&
          t.sender_id != null &&
          t.sender_id === cpUser));
    if (borrowMatch) balance -= amt;

    const settleTheyPaid =
      t.type === "settle" &&
      t.receiver_id === ownerId &&
      (cid === contactRowId ||
        (cid == null &&
          cpUser != null &&
          t.sender_id != null &&
          t.sender_id === cpUser));
    if (settleTheyPaid) balance -= amt;

    const settleYouPaid =
      t.type === "settle" &&
      t.sender_id === ownerId &&
      (cid === contactRowId ||
        (cid == null &&
          cpUser != null &&
          t.receiver_id != null &&
          t.receiver_id === cpUser));
    if (settleYouPaid) balance += amt;
  }
  return Math.round(balance * 100) / 100;
}

async function fetchMergedTransactions(
  ownerId: string,
  contactRow: ContactRow,
  supabase: SupabaseServer,
): Promise<DebtTransactionRow[]> {
  let scopedRows: DebtTransactionRow[] = [];
  const { data: scoped, error: scopedErr } = await supabase
    .from("transactions")
    .select(TX_SEL_FULL)
    .eq("contact_id", contactRow.id)
    .order("created_at", { ascending: false });

  if (!scopedErr) {
    scopedRows = (scoped ?? []) as DebtTransactionRow[];
  } else if (
    isMissingContactIdColumn(scopedErr.message ?? "", scopedErr.code)
  ) {
    scopedRows = [];
  } else {
    throw new Error(scopedErr.message);
  }

  let legacy: DebtTransactionRow[] = [];
  if (contactRow.contact_user_id) {
    const u = contactRow.contact_user_id;
    const legacyWithContactCol = await supabase
      .from("transactions")
      .select(TX_SEL_FULL)
      .is("contact_id", null)
      .or(
        `and(sender_id.eq.${ownerId},receiver_id.eq.${u}),and(sender_id.eq.${u},receiver_id.eq.${ownerId})`,
      )
      .order("created_at", { ascending: false });

    if (!legacyWithContactCol.error) {
      legacy = (legacyWithContactCol.data ?? []).map((t) => ({
        ...(t as DebtTransactionRow),
        contact_id: (t as DebtTransactionRow).contact_id ?? null,
      }));
    } else if (
      isMissingContactIdColumn(
        legacyWithContactCol.error.message ?? "",
        legacyWithContactCol.error.code,
      )
    ) {
      const legacyNoContactCol = await supabase
        .from("transactions")
        .select(TX_SEL_LEGACY)
        .or(
          `and(sender_id.eq.${ownerId},receiver_id.eq.${u}),and(sender_id.eq.${u},receiver_id.eq.${ownerId})`,
        )
        .order("created_at", { ascending: false });
      if (legacyNoContactCol.error)
        throw new Error(legacyNoContactCol.error.message);
      legacy = (legacyNoContactCol.data ?? []).map((t) => ({
        ...(t as DebtTransactionRow),
        contact_id: null,
      }));
    } else {
      throw new Error(legacyWithContactCol.error.message);
    }
  }

  const byId = new Map<string, DebtTransactionRow>();
  for (const t of legacy) byId.set(t.id, t);
  for (const t of scopedRows) byId.set(t.id, t);
  return [...byId.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function addContact(
  formData: FormData,
): Promise<
  | { ok: true; contactId: string; emailSent?: boolean; emailReason?: string }
  | { ok: false; error: string }
> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!name) return { ok: false, error: "Name is required." };

  const supabase = await createClient();
  let contactUserId: string | null = null;
  if (email) {
    const { data: other } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (other?.id) {
      if (other.id === user.id)
        return { ok: false, error: "You cannot add yourself as a contact." };
      contactUserId = other.id;
    }
  }

  const { data: inserted, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      contact_user_id: contactUserId,
      name,
      email: email || "",
    })
    .select("id")
    .single();
  if (error || !inserted?.id) return { ok: false, error: error?.message ?? "Could not save contact." };

  let emailSent = undefined;
  let emailReason = undefined;
  if (email) {
    const emailResult = await sendContactNotificationEmail({
      to: email,
      contactName: name,
      adderName: user.name || user.email || "Someone",
    });
    emailSent = emailResult.sent;
    emailReason = emailResult.reason;
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true, contactId: inserted.id, emailSent, emailReason };
}

export type AddTransactionInput = {
  /** `contacts.id` (preferred) or linked user's id (resolved to a row). */
  contactId: string;
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
  const raw = input.contactId.trim();
  if (!raw) return { ok: false, error: "Pick a contact for the ledger." };

  const supabase = await createClient();
  const row = await resolveContactRow(raw, user.id, supabase);
  if (!row) return { ok: false, error: "Contact not found." };

  const contact_id = row.id;
  const cpUser = row.contact_user_id;

  let type: DebtTransactionType;
  let sender_id: string | null;
  let receiver_id: string | null;

  if (input.flow === "i_gave") {
    type = "lend";
    sender_id = user.id;
    receiver_id = cpUser;
  } else if (input.flow === "i_received") {
    type = "borrow";
    sender_id = cpUser;
    receiver_id = user.id;
  } else {
    type = "settle";
    if (input.settleDirection === "i_paid_them") {
      sender_id = user.id;
      receiver_id = cpUser;
    } else if (input.settleDirection === "they_paid_me") {
      sender_id = cpUser;
      receiver_id = user.id;
    } else {
      return { ok: false, error: "Choose who made the settlement payment." };
    }

    const currentBalance = await getContactLedgerBalance(user.id, contact_id);
    const maxSettle = Math.abs(currentBalance);
    if (maxSettle < 0.009) {
      return { ok: false, error: "This contact is already settled." };
    }
    if (amount > maxSettle + 0.0001) {
      return {
        ok: false,
        error: "You cannot pay more than the remaining balance",
      };
    }
  }

  const modernRow = {
    sender_id,
    receiver_id,
    contact_id,
    amount,
    type,
    note,
  };
  let { error } = await supabase.from("transactions").insert(modernRow);

  if (error && isPostgrestMissingContactIdColumn(error)) {
    if (!cpUser || sender_id == null || receiver_id == null) {
      return { ok: false, error: OFFLINE_IOU_DB_HINT };
    }
    const legacyRow = {
      sender_id,
      receiver_id,
      amount,
      type,
      note,
    };
    ({ error } = await supabase.from("transactions").insert(legacyRow));
  }

  if (error) return { ok: false, error: error.message };

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}

export type RelayTransactionInput = {
  lenderContactId: string;
  recipientContactId: string;
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
  const { lenderContactId, recipientContactId } = input;
  if (!lenderContactId || !recipientContactId)
    return { ok: false, error: "Select both people." };
  if (lenderContactId === recipientContactId)
    return { ok: false, error: "Lender and recipient must be different." };

  const supabase = await createClient();

  const lenderRow = await resolveContactRow(lenderContactId, user.id, supabase);
  if (!lenderRow)
    return { ok: false, error: "Borrow-from contact not found." };
  const recipientRow = await resolveContactRow(
    recipientContactId,
    user.id,
    supabase,
  );
  if (!recipientRow)
    return { ok: false, error: "Lend-to contact not found." };

  const modernRows = [
    {
      sender_id: lenderRow.contact_user_id,
      receiver_id: user.id,
      contact_id: lenderRow.id,
      amount,
      type: "borrow" as const,
      note,
    },
    {
      sender_id: user.id,
      receiver_id: recipientRow.contact_user_id,
      contact_id: recipientRow.id,
      amount,
      type: "lend" as const,
      note,
    },
  ];
  let { error } = await supabase.from("transactions").insert(modernRows);

  if (error && isPostgrestMissingContactIdColumn(error)) {
    if (!lenderRow.contact_user_id || !recipientRow.contact_user_id) {
      return { ok: false, error: OFFLINE_IOU_DB_HINT };
    }
    const legacyRows = [
      {
        sender_id: lenderRow.contact_user_id,
        receiver_id: user.id,
        amount,
        type: "borrow" as const,
        note,
      },
      {
        sender_id: user.id,
        receiver_id: recipientRow.contact_user_id,
        amount,
        type: "lend" as const,
        note,
      },
    ];
    ({ error } = await supabase.from("transactions").insert(legacyRows));
  }

  if (error) return { ok: false, error: error.message };

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}

export async function getTransactionsForContactRow(
  contactRowId: string,
): Promise<{
  contact: ContactRow;
  transactions: DebtTransactionRow[];
  canManage: boolean;
} | null> {
  const user = await requireUser();
  const contact = await getAccessibleContactRow(contactRowId);
  if (!contact) return null;
  const supabase = await createClient();
  const transactions = await fetchMergedTransactions(
    contact.user_id,
    contact,
    supabase,
  );
  return { contact, transactions, canManage: contact.user_id === user.id };
}

/**
 * Balance for a contact row (registered or offline).
 * Prefers RPC `get_contact_ledger_balance` (db/013). If PostgREST has not picked it up yet
 * or migration was not run, falls back to the same math in TypeScript / legacy `get_debt_balance`.
 */
export async function getContactLedgerBalance(
  ownerId: string,
  contactRowId: string,
): Promise<number> {
  const supabase = await createClient();
  const contact = await getAccessibleContactRow(contactRowId);
  if (!contact) return 0;
  const isOwnerView = contact.user_id === ownerId;
  const isCounterpartyView = contact.contact_user_id === ownerId;
  if (!isOwnerView && !isCounterpartyView) return 0;

  const canonicalOwnerId = contact.user_id;
  if (isOwnerView) {
    const { data, error } = await supabase.rpc("get_contact_ledger_balance", {
      p_owner: ownerId,
      p_contact: contactRowId,
    });
    if (!error) return Number(data ?? 0);

    const msg = error.message ?? "";
    if (!isMissingContactLedgerRpc(msg, error.code)) {
      throw new Error(msg);
    }
  }

  try {
    const txs = await fetchMergedTransactions(canonicalOwnerId, contact, supabase);
    const ownerBalance = computeContactLedgerBalanceFromTransactions(
      canonicalOwnerId,
      contact.id,
      contact.contact_user_id,
      txs,
    );
    return isOwnerView ? ownerBalance : -ownerBalance;
  } catch {
    if (contact.contact_user_id) {
      const r = await supabase.rpc("get_debt_balance", {
        p_me: canonicalOwnerId,
        p_counterparty: contact.contact_user_id,
      });
      if (!r.error) {
        const ownerBalance = Number(r.data ?? 0);
        return isOwnerView ? ownerBalance : -ownerBalance;
      }
    }
    return 0;
  }
}

export async function listContactsWithBalances(): Promise<
  (ContactRow & { balance: number; balanceLabel: string })[]
> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: ownedContacts, error: ownedError } = await supabase
    .from("contacts")
    .select("id, user_id, contact_user_id, name, email, created_at")
    .eq("user_id", user.id)
    .order("name");
  if (ownedError) throw new Error(ownedError.message);
  const { data: sharedContacts, error: sharedError } = await supabase
    .from("contacts")
    .select("id, user_id, contact_user_id, name, email, created_at")
    .eq("contact_user_id", user.id)
    .neq("user_id", user.id)
    .order("name");
  if (sharedError) throw new Error(sharedError.message);

  const rows = [...((ownedContacts ?? []) as ContactRow[]), ...((sharedContacts ?? []) as ContactRow[])];
  const out: (ContactRow & { balance: number; balanceLabel: string })[] = [];

  const unlinkedEmails = rows
    .filter((c) => !c.contact_user_id && c.email)
    .map((c) => c.email);

  const uniqueEmails = Array.from(new Set(unlinkedEmails));
  const emailToUserId = new Map<string, string>();

  if (uniqueEmails.length > 0) {
    const { data: matchedUsers, error: matchError } = await supabase
      .from("users")
      .select("id, email")
      .in("email", uniqueEmails);

    if (matchError) throw new Error(matchError.message);

    (matchedUsers ?? []).forEach((u: { id: string; email: string }) => {
      if (u.email) emailToUserId.set(u.email, u.id);
    });
  }

  for (const c of rows) {
    let contactUserId = c.contact_user_id;
    if (c.user_id === user.id && !contactUserId && c.email) {
      const matchedId = emailToUserId.get(c.email);
      if (matchedId && matchedId !== user.id) {
        contactUserId = matchedId;
        const { error: updateError } = await supabase
          .from("contacts")
          .update({ contact_user_id: matchedId })
          .eq("id", c.id);
        if (updateError) {
          console.warn(
            "Failed to auto-link contact",
            c.id,
            updateError.message,
          );
        }
      }
    }

    const bal = await getContactLedgerBalance(user.id, c.id);
    out.push({
      ...c,
      contact_user_id: contactUserId,
      balance: bal,
      balanceLabel: formatDebtBalanceLabel(bal),
    });
  }

  return out;
}

export async function getMyContactRow(
  contactRowId: string,
): Promise<ContactRow | null> {
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

export async function getAccessibleContactRow(
  contactRowId: string,
): Promise<ContactRow | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, user_id, contact_user_id, name, email, created_at")
    .eq("id", contactRowId)
    .or(`user_id.eq.${user.id},contact_user_id.eq.${user.id}`)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ContactRow | null) ?? null;
}

export async function getDebtDashboardTotals(): Promise<{
  totalYouOwe: number;
  totalOwedToYou: number;
}> {
  const user = await requireUser();
  const contacts = await listContactsWithBalances();
  let totalYouOwe = 0;
  let totalOwedToYou = 0;
  for (const c of contacts) {
    if (c.balance > 0) totalOwedToYou += c.balance;
    else if (c.balance < 0) totalYouOwe += Math.abs(c.balance);
  }
  return { totalYouOwe, totalOwedToYou };
}

export async function deleteContactTransaction(
  contactRowId: string,
  transactionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const contact = await getMyContactRow(contactRowId);
  if (!contact || contact.user_id !== user.id) {
    return { ok: false, error: "Contact not found." };
  }

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("id, contact_id, sender_id, receiver_id")
    .eq("id", transactionId)
    .maybeSingle();
  if (txError) return { ok: false, error: txError.message };
  if (!tx) return { ok: false, error: "Transaction not found." };

  const txContactId = (tx as DebtTransactionRow).contact_id ?? null;
  if (txContactId) {
    if (txContactId !== contact.id) {
      return {
        ok: false,
        error: "You can only delete transactions from this contact.",
      };
    }
  } else {
    const cpUser = contact.contact_user_id;
    if (!cpUser) {
      return {
        ok: false,
        error: "This transaction cannot be verified for this contact.",
      };
    }
    const sender = (tx as DebtTransactionRow).sender_id;
    const receiver = (tx as DebtTransactionRow).receiver_id;
    const isPairMatch =
      (sender === user.id && receiver === cpUser) ||
      (sender === cpUser && receiver === user.id);
    if (!isPairMatch) {
      return {
        ok: false,
        error: "You can only delete transactions from this contact.",
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);
  if (deleteError) return { ok: false, error: deleteError.message };

  revalidatePath(`/contacts/${contact.id}`);
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/ledger");
  return { ok: true };
}
