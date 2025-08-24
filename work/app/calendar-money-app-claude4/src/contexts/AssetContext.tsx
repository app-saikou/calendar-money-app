import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [calendarData, setCalendarData] = useState<
    Record<string, CalendarDayData>
  >({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化処理
  useEffect(() => {
    initializeFromOnboarding();
  }, []);

  const initializeFromOnboarding = async () => {
    try {
      const onboardingData = await AsyncStorage.getItem("onboardingData");
      if (onboardingData) {
        const data = JSON.parse(onboardingData);

        // 資産の初期化
        const initialAssets: Asset[] = [
          {
            id: "1",
            name: "現金・預金",
            type: "cash",
            amount: data.cashAmount,
          },
          {
            id: "2",
            name: "株式・投資信託",
            type: "stock",
            amount: data.stockAmount,
            annualReturn: data.stockAnnualReturn,
          },
        ];
        setAssets(initialAssets);

        // 予算の初期化
        const currentDate = new Date();
        const currentMonth =
          currentDate.getFullYear() +
          "-" +
          String(currentDate.getMonth() + 1).padStart(2, "0");

        const initialBudget: MonthlyBudget = {
          id: "1",
          month: currentMonth,
          income: data.monthlyIncome,
          expense: data.monthlyExpense,
          stockInvestment: data.monthlyStockInvestment,
        };
        setBudgets([initialBudget]);
      } else {
        // デフォルト値
        setAssets([
          {
            id: "1",
            name: "現金",
            type: "cash",
            amount: 1000000,
          },
          {
            id: "2",
            name: "株式",
            type: "stock",
            amount: 500000,
            annualReturn: 0.05,
          },
        ]);
      }
    } catch (error) {
      console.log("Error initializing from onboarding:", error);
    } finally {
      setIsInitialized(true);
    }
  };

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
    if (isInitialized) {
      refreshCalendarData();
    }
  }, [assets, budgets, transactions, isInitialized]);

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
