export type OrderType = "Dine In" | "Take Away" | "Delivery";
export type OrderStatus = "Running" | "Settled" | "Voided";
export type PaymentMethod = "Cash" | "Card" | "Transfer" | "Unpaid";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface OrderSummaryRecord {
  id: string;
  orderNumber: number;
  time: string; // e.g. "07, Saturday 05:03 PM"
  rawTimestamp: string;
  orderType: OrderType;
  roomTable: string; // e.g. "Dine In - T 2", "Take Away", "Delivery", "Dine In - T 1"
  customer: string; // e.g. "Abdullah", "geodevinstitute", ""
  customerPhone?: string;
  customerAddress?: string;
  waiter: string; // e.g. "Admin"
  status: OrderStatus;
  netAmount: number; // e.g. 11500.00
  tax: number;
  subtotal: number;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  voidReason?: string;
  kotPrintedCount: number;
  receiptPrintedCount: number;
}

export type OrderSummaryFilterTab = "All" | "Running" | "Settled" | "Voided";
