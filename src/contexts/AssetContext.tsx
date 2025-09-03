import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset, Transaction, MonthlyBudget, CalendarDayData } from "../types";
import { calculateAssetProjection } from "../utils/calculations";
import {
  calendarCacheApi,
  assetsApi,
  transactionsApi,
  usersApi,
} from "../lib/supabaseClient";
import {
  transformSupabaseAssetToAsset,
  transformAssetToSupabaseAsset,
  transformSupabaseTransactionToTransaction,
  transformTransactionToSupabaseTransaction,
} from "../utils/dataTransform";
import { useAuth } from "../contexts/AuthContext";
import { Tables } from "../lib/supabase";

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
  handleOnboardingCompleted: () => Promise<void>; // オンボーディング完了後のコールバック
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
    if (user) {
      loadDataFromSupabase();
    } else {
      initializeFromOnboarding();
    }
  }, [user]);

  // Supabaseからデータを読み込み
  const loadDataFromSupabase = async () => {
    if (!user) return;

    try {
      console.log("Loading data from Supabase...");

      // 資産データを読み込み
      const supabaseAssets: Tables<"assets">[] = await assetsApi.getAssets(
        user.id
      );
      let transformedAssets: Asset[] = supabaseAssets.map(
        transformSupabaseAssetToAsset
      );

      // 資産データが存在しない場合は初期データを作成
      if (transformedAssets.length === 0) {
        console.log("No assets found, creating initial assets...");
        await createInitialAssets();
        // 作成後に再読み込み
        const newSupabaseAssets: Tables<"assets">[] = await assetsApi.getAssets(
          user.id
        );
        transformedAssets = newSupabaseAssets.map(
          transformSupabaseAssetToAsset
        );
      }

      setAssets(transformedAssets);
      console.log(`Loaded ${transformedAssets.length} assets from Supabase`);

      // 取引データを読み込み
      const supabaseTransactions: Tables<"transactions">[] =
        await transactionsApi.getTransactions(user.id);
      const transformedTransactions: Transaction[] = supabaseTransactions.map(
        transformSupabaseTransactionToTransaction
      );
      setTransactions(transformedTransactions);
      console.log(
        `Loaded ${transformedTransactions.length} transactions from Supabase`
      );

      // 予算データは既にBudgetSettingsScreenで管理されているので、ここでは初期化のみ
      await initializeBudgetFromOnboarding();

      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      // エラーの場合はオンボーディングデータから初期化
      await initializeFromOnboarding();
    }
  };

  // 初期資産データを作成
  const createInitialAssets = async () => {
    if (!user) return;

    try {
      const onboardingData = await AsyncStorage.getItem("onboardingData");
      if (onboardingData) {
        const data = JSON.parse(onboardingData);

        // 初期資産を作成
        const initialAssets = [
          {
            name: "現金・預金",
            type: "cash" as const,
            amount: data.cashAmount,
          },
          {
            name: "株式・投資信託",
            type: "stock" as const,
            amount: data.stockAmount,
            annualReturn: data.stockAnnualReturn,
          },
        ];

        // Supabaseに保存
        for (const asset of initialAssets) {
          const supabaseAsset = transformAssetToSupabaseAsset(asset, user.id);
          await assetsApi.createAsset(supabaseAsset);
        }

        console.log("Initial assets created successfully");
      }
    } catch (error) {
      console.error("Error creating initial assets:", error);
      throw error;
    }
  };

  // オンボーディングデータから予算を初期化
  const initializeBudgetFromOnboarding = async () => {
    try {
      const onboardingData = await AsyncStorage.getItem("onboardingData");
      if (onboardingData) {
        const data = JSON.parse(onboardingData);

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
      }
    } catch (error) {
      console.log("Error initializing budget from onboarding:", error);
    }
  };

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
  const addAsset = async (asset: Omit<Asset, "id">) => {
    if (!user) {
      console.error("User not authenticated, cannot add asset");
      return;
    }

    try {
      // Supabaseに保存
      const supabaseAsset = transformAssetToSupabaseAsset(asset, user.id);
      const savedAsset = await assetsApi.createAsset(supabaseAsset);

      // ローカル状態を更新
      const newAsset = transformSupabaseAssetToAsset(savedAsset);
      setAssets((prev) => [...prev, newAsset]);

      console.log("Asset added successfully:", newAsset);
    } catch (error) {
      console.error("Error adding asset:", error);
      throw error;
    }
  };

  const updateAsset = async (id: string, asset: Partial<Asset>) => {
    if (!user) {
      console.error("User not authenticated, cannot update asset");
      return;
    }

    try {
      // Supabaseを更新
      const updates = {
        name: asset.name,
        type: asset.type,
        amount: asset.amount?.toString(),
        annual_return: asset.annualReturn?.toString(),
      };

      const savedAsset = await assetsApi.updateAsset(id, updates);

      // ローカル状態を更新
      const updatedAsset = transformSupabaseAssetToAsset(savedAsset);
      setAssets((prev) => prev.map((a) => (a.id === id ? updatedAsset : a)));

      console.log("Asset updated successfully:", updatedAsset);
    } catch (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    if (!user) {
      console.error("User not authenticated, cannot delete asset");
      return;
    }

    try {
      // Supabaseから削除
      await assetsApi.deleteAsset(id);

      // ローカル状態を更新
      setAssets((prev) => prev.filter((a) => a.id !== id));

      // 資産を削除する際は、その資産に関連する取引も削除
      setTransactions((prev) =>
        prev.filter((t) => t.fromAssetId !== id && t.toAssetId !== id)
      );

      console.log("Asset deleted successfully:", id);
    } catch (error) {
      console.error("Error deleting asset:", error);
      throw error;
    }
  };

  // Transaction management functions
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) {
      console.error("User not authenticated, cannot add transaction");
      return;
    }

    try {
      // Supabaseに保存
      const supabaseTransaction = transformTransactionToSupabaseTransaction(
        transaction,
        user.id
      );
      const savedTransaction = await transactionsApi.createTransaction(
        supabaseTransaction
      );

      // ローカル状態を更新
      const newTransaction =
        transformSupabaseTransactionToTransaction(savedTransaction);
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

      console.log("Transaction added successfully:", newTransaction);
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  const updateTransaction = async (
    id: string,
    transaction: Partial<Transaction>
  ) => {
    if (!user) {
      console.error("User not authenticated, cannot update transaction");
      return;
    }

    try {
      // Supabaseを更新
      const updates = {
        date: transaction.date,
        amount: transaction.amount?.toString(),
        description: transaction.description,
        type: transaction.type,
        from_asset_id: transaction.fromAssetId,
        to_asset_id: transaction.toAssetId,
      };

      const savedTransaction = await transactionsApi.updateTransaction(
        id,
        updates
      );

      // ローカル状態を更新
      const updatedTransaction =
        transformSupabaseTransactionToTransaction(savedTransaction);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      );

      console.log("Transaction updated successfully:", updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) {
      console.error("User not authenticated, cannot delete transaction");
      return;
    }

    try {
      // 削除する取引を取得
      const transactionToDelete = transactions.find((t) => t.id === id);

      // Supabaseから削除
      await transactionsApi.deleteTransaction(id);

      // ローカル状態を更新
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

      console.log("Transaction deleted successfully:", id);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
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

  // 資産推移データを再計算
  const refreshCalendarData = async () => {
    try {
      if (!user) {
        console.log("User not authenticated, cannot refresh calendar data");
        return;
      }

      console.log("Starting calendar data refresh for user:", user.id);

      // ユーザーのオンボーディング完了日を取得
      const userData = await usersApi.getUser(user.id);
      console.log("User data retrieved:", userData);

      const onboardingDate = (userData as any).onboarding_completed_date;
      console.log("Onboarding completion date:", onboardingDate);

      if (!onboardingDate) {
        console.log(
          "No onboarding completion date found, cannot calculate projection"
        );
        return;
      }

      console.log("Calculating asset projection from:", onboardingDate);
      console.log("Assets count:", assets.length);
      console.log("Budgets count:", budgets.length);
      console.log("Transactions count:", transactions.length);

      // ユーザーの生年月日を取得
      const userBirthDate = (userData as any).birth_date || "1995-03-28"; // デフォルト生年月日
      console.log("User birth date for projection calculation:", userBirthDate);

      const projectionData = calculateAssetProjection(
        assets,
        budgets,
        transactions,
        onboardingDate, // オンボーディング完了日
        userBirthDate // ユーザーの生年月日
      );

      console.log(
        "Projection data calculated, days:",
        Object.keys(projectionData).length
      );
      setCalendarData(projectionData);
    } catch (error) {
      console.error("Error refreshing calendar data:", error);
    }
  };

  // 100歳までの資産推移データをSupabaseに保存
  const saveCalendarDataToSupabase = async () => {
    try {
      if (!user) {
        console.log("User not authenticated, skipping calendar data save");
        return;
      }

      // ユーザーのオンボーディング完了日を取得
      const userData = await usersApi.getUser(user.id);
      const onboardingDate = (userData as any).onboarding_completed_date;

      if (!onboardingDate) {
        console.log(
          "No onboarding completion date found, skipping calendar data save"
        );
        return;
      }

      // 最新の資産推移データを計算
      const userBirthDate = (userData as any).birth_date || "1995-03-28"; // デフォルト生年月日
      console.log("User birth date for projection calculation:", userBirthDate);

      const projectionData = calculateAssetProjection(
        assets,
        budgets,
        transactions,
        onboardingDate, // オンボーディング完了日
        userBirthDate // ユーザーの生年月日
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

  // オンボーディング完了後の処理
  const handleOnboardingCompleted = async () => {
    console.log(
      "AssetContext: Onboarding completed, refreshing calendar data..."
    );
    await refreshCalendarData();
    await saveCalendarDataToSupabase();
  };

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
    handleOnboardingCompleted, // オンボーディング完了後のコールバック
  };

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
};
