// Asset types
export interface Asset {
  id: string;
  name: string;
  type: "cash" | "stock";
  amount: number;
  annualReturn?: number; // 年利 (株式の場合のみ)
}

// Transaction types
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD format
  amount: number; // 正の値: 収入、負の値: 支出
  description: string;
  type: "income" | "expense" | "stock_investment";
  assetId?: string;
}

// Budget types
export interface MonthlyBudget {
  id: string;
  month: string; // YYYY-MM format
  income: number;
  expense: number;
  stockInvestment: number; // 毎月の株式積立額
}

// Calendar day data
export interface CalendarDayData {
  date: string; // YYYY-MM-DD format
  totalAssets: number;
  cashAmount: number;
  stockAmount: number;
  isToday: boolean;
  isPrediction: boolean; // 未来の予測データかどうか
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  AssetManagement: undefined;
  BudgetSettings: undefined;
  TransactionHistory: undefined;
};

// Settings
export interface AppSettings {
  defaultStockAnnualReturn: number; // デフォルト年利
  displayCurrency: string;
}
