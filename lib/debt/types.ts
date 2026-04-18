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
  sender_id: string;
  receiver_id: string;
  amount: string;
  type: DebtTransactionType;
  note: string;
  created_at: string;
};

export type ContactWithBalance = ContactRow & {
  balance: number | null;
  balanceLabel: string;
};
