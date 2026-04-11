export type RiskLevel = "high" | "medium" | "low";
export type TransactionStatus = "flagged" | "safe" | "pending" | "fraud";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  location: string;
  cardLast4: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  category: string;
  description: string;
}

export interface Alert {
  id: string;
  transactionId: string;
  type: string;
  message: string;
  severity: RiskLevel;
  timestamp: string;
  read: boolean;
}

const merchants = [
  "Amazon", "Walmart", "Target", "Best Buy", "Apple Store",
  "Shell Gas", "Starbucks", "McDonald's", "Netflix", "Uber",
  "Suspicious ATM", "Unknown Vendor", "Offshore Trading Co",
  "CryptoExchange Ltd", "FastCash Services", "Luxury Goods Intl",
];

const locations = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "Lagos, Nigeria", "Moscow, Russia", "Bucharest, Romania",
  "Miami, FL", "London, UK", "São Paulo, Brazil", "Tokyo, Japan",
];

const categories = [
  "Retail", "Food & Dining", "Gas & Transport", "Entertainment",
  "ATM Withdrawal", "Wire Transfer", "Online Purchase", "Cryptocurrency",
];

export const transactions: Transaction[] = [
  { id: "TXN-001", date: "2026-04-11T09:23:00", amount: 4899.99, merchant: "Offshore Trading Co", location: "Lagos, Nigeria", cardLast4: "4532", riskScore: 95, riskLevel: "high", status: "flagged", category: "Wire Transfer", description: "Large wire transfer to offshore account" },
  { id: "TXN-002", date: "2026-04-11T08:15:00", amount: 12.50, merchant: "Starbucks", location: "New York, NY", cardLast4: "4532", riskScore: 5, riskLevel: "low", status: "safe", category: "Food & Dining", description: "Morning coffee purchase" },
  { id: "TXN-003", date: "2026-04-11T07:45:00", amount: 2340.00, merchant: "CryptoExchange Ltd", location: "Bucharest, Romania", cardLast4: "7891", riskScore: 88, riskLevel: "high", status: "flagged", category: "Cryptocurrency", description: "Cryptocurrency purchase from high-risk exchange" },
  { id: "TXN-004", date: "2026-04-11T06:30:00", amount: 89.99, merchant: "Amazon", location: "Los Angeles, CA", cardLast4: "4532", riskScore: 12, riskLevel: "low", status: "safe", category: "Online Purchase", description: "Electronics accessory purchase" },
  { id: "TXN-005", date: "2026-04-10T23:58:00", amount: 500.00, merchant: "Suspicious ATM", location: "Moscow, Russia", cardLast4: "4532", riskScore: 92, riskLevel: "high", status: "fraud", category: "ATM Withdrawal", description: "Late-night ATM withdrawal in foreign country" },
  { id: "TXN-006", date: "2026-04-10T22:10:00", amount: 156.78, merchant: "Best Buy", location: "Chicago, IL", cardLast4: "3344", riskScore: 15, riskLevel: "low", status: "safe", category: "Retail", description: "Headphones purchase" },
  { id: "TXN-007", date: "2026-04-10T20:30:00", amount: 1200.00, merchant: "FastCash Services", location: "Miami, FL", cardLast4: "7891", riskScore: 78, riskLevel: "high", status: "pending", category: "Wire Transfer", description: "Rapid cash transfer service" },
  { id: "TXN-008", date: "2026-04-10T18:45:00", amount: 45.00, merchant: "Shell Gas", location: "Houston, TX", cardLast4: "3344", riskScore: 8, riskLevel: "low", status: "safe", category: "Gas & Transport", description: "Gas station fuel purchase" },
  { id: "TXN-009", date: "2026-04-10T17:20:00", amount: 3500.00, merchant: "Luxury Goods Intl", location: "London, UK", cardLast4: "4532", riskScore: 65, riskLevel: "medium", status: "pending", category: "Retail", description: "High-value luxury purchase abroad" },
  { id: "TXN-010", date: "2026-04-10T15:00:00", amount: 15.99, merchant: "Netflix", location: "New York, NY", cardLast4: "4532", riskScore: 3, riskLevel: "low", status: "safe", category: "Entertainment", description: "Monthly subscription" },
  { id: "TXN-011", date: "2026-04-10T14:30:00", amount: 780.00, merchant: "Unknown Vendor", location: "São Paulo, Brazil", cardLast4: "7891", riskScore: 72, riskLevel: "medium", status: "flagged", category: "Online Purchase", description: "Purchase from unverified online vendor" },
  { id: "TXN-012", date: "2026-04-10T12:00:00", amount: 34.50, merchant: "McDonald's", location: "Phoenix, AZ", cardLast4: "3344", riskScore: 4, riskLevel: "low", status: "safe", category: "Food & Dining", description: "Lunch purchase" },
  { id: "TXN-013", date: "2026-04-10T10:15:00", amount: 9999.00, merchant: "Unknown Vendor", location: "Lagos, Nigeria", cardLast4: "7891", riskScore: 98, riskLevel: "high", status: "fraud", category: "Wire Transfer", description: "Maximum limit wire transfer to flagged region" },
  { id: "TXN-014", date: "2026-04-10T09:00:00", amount: 250.00, merchant: "Target", location: "Los Angeles, CA", cardLast4: "4532", riskScore: 10, riskLevel: "low", status: "safe", category: "Retail", description: "Household items purchase" },
  { id: "TXN-015", date: "2026-04-09T21:45:00", amount: 1850.00, merchant: "CryptoExchange Ltd", location: "Moscow, Russia", cardLast4: "3344", riskScore: 85, riskLevel: "high", status: "flagged", category: "Cryptocurrency", description: "Large crypto purchase from sanctioned region" },
  { id: "TXN-016", date: "2026-04-09T19:30:00", amount: 420.00, merchant: "Apple Store", location: "Tokyo, Japan", cardLast4: "4532", riskScore: 35, riskLevel: "medium", status: "safe", category: "Retail", description: "Apple accessory purchase" },
  { id: "TXN-017", date: "2026-04-09T16:00:00", amount: 67.80, merchant: "Uber", location: "New York, NY", cardLast4: "4532", riskScore: 6, riskLevel: "low", status: "safe", category: "Gas & Transport", description: "Ride service charge" },
  { id: "TXN-018", date: "2026-04-09T14:20:00", amount: 5600.00, merchant: "FastCash Services", location: "Bucharest, Romania", cardLast4: "7891", riskScore: 91, riskLevel: "high", status: "fraud", category: "Wire Transfer", description: "Large cash transfer to high-risk location" },
  { id: "TXN-019", date: "2026-04-09T11:00:00", amount: 125.00, merchant: "Walmart", location: "Houston, TX", cardLast4: "3344", riskScore: 7, riskLevel: "low", status: "safe", category: "Retail", description: "Grocery shopping" },
  { id: "TXN-020", date: "2026-04-09T08:30:00", amount: 890.00, merchant: "Unknown Vendor", location: "Miami, FL", cardLast4: "7891", riskScore: 58, riskLevel: "medium", status: "pending", category: "Online Purchase", description: "Purchase from new unverified merchant" },
];

export const alerts: Alert[] = [
  { id: "ALT-001", transactionId: "TXN-001", type: "Geo Anomaly", message: "Transaction detected in Lagos, Nigeria - unusual location for cardholder", severity: "high", timestamp: "2026-04-11T09:23:05", read: false },
  { id: "ALT-002", transactionId: "TXN-003", type: "High Value", message: "Cryptocurrency purchase of $2,340 from high-risk exchange", severity: "high", timestamp: "2026-04-11T07:45:10", read: false },
  { id: "ALT-003", transactionId: "TXN-005", type: "Velocity Check", message: "Late-night ATM withdrawal in Moscow after recent NY transaction", severity: "high", timestamp: "2026-04-10T23:58:30", read: true },
  { id: "ALT-004", transactionId: "TXN-007", type: "Pattern Match", message: "FastCash Services flagged as potential money laundering channel", severity: "high", timestamp: "2026-04-10T20:30:15", read: false },
  { id: "ALT-005", transactionId: "TXN-009", type: "High Value", message: "Luxury purchase of $3,500 in London - verify cardholder travel", severity: "medium", timestamp: "2026-04-10T17:20:05", read: true },
  { id: "ALT-006", transactionId: "TXN-011", type: "Vendor Risk", message: "Transaction with unverified vendor in São Paulo", severity: "medium", timestamp: "2026-04-10T14:30:20", read: false },
  { id: "ALT-007", transactionId: "TXN-013", type: "Amount Limit", message: "Transaction at maximum limit ($9,999) to flagged region", severity: "high", timestamp: "2026-04-10T10:15:05", read: true },
  { id: "ALT-008", transactionId: "TXN-015", type: "Sanctions", message: "Crypto exchange transaction linked to sanctioned region", severity: "high", timestamp: "2026-04-09T21:45:15", read: false },
  { id: "ALT-009", transactionId: "TXN-018", type: "Geo Anomaly", message: "Large cash transfer to Bucharest - card not reported as traveling", severity: "high", timestamp: "2026-04-09T14:20:10", read: true },
  { id: "ALT-010", transactionId: "TXN-020", type: "New Merchant", message: "First-time transaction with unverified merchant in Miami", severity: "medium", timestamp: "2026-04-09T08:30:25", read: false },
];

export const dashboardStats = {
  totalTransactions: 14832,
  fraudDetected: 127,
  pendingReview: 43,
  totalAmount: 2847563.42,
  fraudAmount: 189432.10,
  riskDistribution: { high: 127, medium: 284, low: 14421 },
  weeklyTrend: [
    { day: "Mon", transactions: 2100, fraud: 15 },
    { day: "Tue", transactions: 2340, fraud: 22 },
    { day: "Wed", transactions: 1980, fraud: 18 },
    { day: "Thu", transactions: 2560, fraud: 31 },
    { day: "Fri", transactions: 2780, fraud: 24 },
    { day: "Sat", transactions: 1650, fraud: 9 },
    { day: "Sun", transactions: 1422, fraud: 8 },
  ],
};
