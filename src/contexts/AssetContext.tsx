import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset, Transaction, MonthlyBudget, CalendarDayData } from "../types";
import { calculateAssetProjection } from "../utils/calculations";
import { calendarCacheApi } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

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
  const { user } = useAuth();
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
          stockInvestments: [
            {
              id: "1",
              name: "月次積立",
              amount: data.monthlyStockInvestment,
              startDate: new Date().toISOString().split("T")[0],
            },
          ],
          startDate: new Date().toISOString().split("T")[0],
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
    // 資産を削除する際は、その資産に関連する取引も削除
    setTransactions((prev) =>
      prev.filter((t) => t.fromAssetId !== id && t.toAssetId !== id)
    );
  };

  // Transaction management functions
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);

    // 資産額を更新
    setAssets((prev) => {
      const updatedAssets = [...prev];

      if (transaction.type === "stock_investment") {
        // 株式投資: 選択された資産間で移動
        const fromAsset = updatedAssets.find(
          (a) => a.id === transaction.fromAssetId
        );
        const toAsset = updatedAssets.find(
          (a) => a.id === transaction.toAssetId
        );

        if (fromAsset && toAsset) {
          fromAsset.amount -= Math.abs(transaction.amount);
          toAsset.amount += Math.abs(transaction.amount);
        }
      } else if (transaction.type === "income") {
        // 収入: 選択された資産に加算
        const toAsset = updatedAssets.find(
          (a) => a.id === transaction.toAssetId
        );
        if (toAsset) {
          toAsset.amount += transaction.amount;
        }
      } else if (transaction.type === "expense") {
        // 支出: 選択された資産から減算
        const fromAsset = updatedAssets.find(
          (a) => a.id === transaction.fromAssetId
        );
        if (fromAsset) {
          fromAsset.amount += transaction.amount; // transaction.amountは負の値
        }
      }

      return updatedAssets;
    });
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...transaction } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    // 削除する取引を取得
    const transactionToDelete = transactions.find((t) => t.id === id);

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // 資産額を逆更新
    if (transactionToDelete) {
      setAssets((prev) => {
        const updatedAssets = [...prev];

        if (transactionToDelete.type === "stock_investment") {
          // 株式投資削除: 選択された資産間で逆移動
          const fromAsset = updatedAssets.find(
            (a) => a.id === transactionToDelete.fromAssetId
          );
          const toAsset = updatedAssets.find(
            (a) => a.id === transactionToDelete.toAssetId
          );

          if (fromAsset && toAsset) {
            fromAsset.amount += Math.abs(transactionToDelete.amount);
            toAsset.amount -= Math.abs(transactionToDelete.amount);
          }
        } else if (transactionToDelete.type === "income") {
          // 収入削除: 選択された資産から減算
          const toAsset = updatedAssets.find(
            (a) => a.id === transactionToDelete.toAssetId
          );
          if (toAsset) {
            toAsset.amount -= transactionToDelete.amount;
          }
        } else if (transactionToDelete.type === "expense") {
          // 支出削除: 選択された資産に加算
          const fromAsset = updatedAssets.find(
            (a) => a.id === transactionToDelete.fromAssetId
          );
          if (fromAsset) {
            fromAsset.amount -= transactionToDelete.amount; // transaction.amountは負の値なので減算
          }
        }

        return updatedAssets;
      });
    }
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

  const refreshCalendarData = async () => {
    // ユーザーの年齢を取得して100歳までの期間を計算
    try {
      const onboardingData = await AsyncStorage.getItem("onboardingData");
      if (onboardingData) {
        const userData = JSON.parse(onboardingData);
        const userAge = userData.age || 25;
        const targetAge = 100;
        const yearsToTarget = targetAge - userAge;
        console.log(
          `Calculating projection for ${yearsToTarget} years until age ${targetAge}`
        );
      }
    } catch (error) {
      console.log("Using default projection period");
    }

    const projectionData = calculateAssetProjection(
      assets,
      budgets,
      transactions
    );
    setCalendarData(projectionData);
  };

  // 100歳までの資産推移データをSupabaseに保存
  const saveCalendarDataToSupabase = async () => {
    try {
      if (!user) {
        console.log("User not authenticated, skipping calendar data save");
        return;
      }

      // ユーザーの年齢を取得
      const onboardingData = await AsyncStorage.getItem("onboardingData");
      if (!onboardingData) {
        console.log("No onboarding data found, skipping calendar data save");
        return;
      }

      // 最新の資産推移データを計算
      const projectionData = calculateAssetProjection(
        assets,
        budgets,
        transactions
      );

      console.log(
        `Calculating projection data for ${
          Object.keys(projectionData).length
        } days`
      );

      // Supabaseに保存するデータを準備
      const calendarCacheData = Object.entries(projectionData).map(
        ([date, data]) => ({
          user_id: user.id,
          date: date,
          cash_amount: data.cashAmount.toString(),
          stock_amount: data.stockAmount.toString(),
          total_amount: data.totalAssets.toString(),
        })
      );

      console.log(
        `Prepared ${calendarCacheData.length} days of calendar data for Supabase`
      );

      // バッチでSupabaseに保存
      let savedCount = 0;
      for (const cacheData of calendarCacheData) {
        try {
          await calendarCacheApi.upsertCalendarCache(cacheData);
          savedCount++;
        } catch (error) {
          console.error(`Error saving data for date ${cacheData.date}:`, error);
        }
      }

      console.log(
        `Successfully saved ${savedCount}/${calendarCacheData.length} days to Supabase`
      );
    } catch (error) {
      console.error("Error saving calendar data to Supabase:", error);
    }
  };

  // Refresh calendar data when dependencies change
  useEffect(() => {
    if (isInitialized) {
      const initializeCalendar = async () => {
        await refreshCalendarData();
        // 資産推移データをSupabaseに保存
        await saveCalendarDataToSupabase();
      };

      initializeCalendar();
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
