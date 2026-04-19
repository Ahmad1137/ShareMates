export type DebtTransactionType = "lend" | "borrow" | "settle";

export type ContactRow = {
  id: string;
  user_id: string;
  contact_user_id: string | null;
  name: string;
  email: string;
  created_at: string;
};

export type DebtTransactionRow = {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  contact_id: string | null;
  amount: string;
  type: DebtTransactionType;
  note: string;
  created_at: string;
};

export type ContactWithBalance = ContactRow & {
  balance: number;
  balanceLabel: string;
};
