import React, { createContext, useContext, useState, useEffect } from "react";
import { Asset, Transaction, MonthlyBudget, CalendarDayData } from "../types";
import {
  calculateAssetProjection,
  formatCurrency,
} from "../utils/calculations";

interface AssetContextType {
  assets: Asset[];
  transactions: Transaction[];
  budgets: MonthlyBudget[];
  calendarData: Record<string, CalendarDayData>;

  // Asset management
  addAsset: (asset: Omit<Asset, "id">) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  // Transaction management
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budget management
  setBudget: (budget: Omit<MonthlyBudget, "id">) => void;
  getBudget: (month: string) => MonthlyBudget | undefined;

  // Calculations
  getTotalAssets: () => number;
  getCashAmount: () => number;
  getStockAmount: () => number;
  refreshCalendarData: () => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAssets must be used within an AssetProvider");
  }
  return context;
};

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      name: "現金",
      type: "cash",
      amount: 1000000, // 100万円
    },
    {
      id: "2",
      name: "株式",
      type: "stock",
      amount: 500000, // 50万円
      annualReturn: 0.05, // 5%
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [calendarData, setCalendarData] = useState<
    Record<string, CalendarDayData>
  >({});

  // Asset management functions
  const addAsset = (asset: Omit<Asset, "id">) => {
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString(),
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  const updateAsset = (id: string, asset: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...asset } : a))
    );
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.assetId !== id));
  };

  // Transaction management functions
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...transaction } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Budget management functions
  const setBudget = (budget: Omit<MonthlyBudget, "id">) => {
    const existingBudget = budgets.find((b) => b.month === budget.month);
    if (existingBudget) {
      setBudgets((prev) =>
        prev.map((b) => (b.month === budget.month ? { ...b, ...budget } : b))
      );
    } else {
      const newBudget: MonthlyBudget = {
        ...budget,
        id: Date.now().toString(),
      };
      setBudgets((prev) => [...prev, newBudget]);
    }
  };

  const getBudget = (month: string): MonthlyBudget | undefined => {
    return budgets.find((b) => b.month === month);
  };

  // Calculation functions
  const getTotalAssets = (): number => {
    return assets.reduce((total, asset) => total + asset.amount, 0);
  };

  const getCashAmount = (): number => {
    return assets
      .filter((asset) => asset.type === "cash")
      .reduce((total, asset) => total + asset.amount, 0);
  };

  const getStockAmount = (): number => {
    return assets
      .filter((asset) => asset.type === "stock")
      .reduce((total, asset) => total + asset.amount, 0);
  };

  const refreshCalendarData = () => {
    const projectionData = calculateAssetProjection(
      assets,
      budgets,
      transactions
    );
    setCalendarData(projectionData);
  };

  // Refresh calendar data when dependencies change
  useEffect(() => {
    refreshCalendarData();
  }, [assets, budgets, transactions]);

  const value: AssetContextType = {
    assets,
    transactions,
    budgets,
    calendarData,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    getBudget,
    getTotalAssets,
    getCashAmount,
    getStockAmount,
    refreshCalendarData,
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
};
