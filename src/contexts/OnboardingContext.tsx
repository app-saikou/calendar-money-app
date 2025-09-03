import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { OnboardingData } from "../types";
import { usersApi } from "../lib/supabaseClient";

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  onboardingData: OnboardingData | null;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  setOnOnboardingCompleted: (callback: () => void) => void; // オンボーディング完了後のコールバックを設定する関数
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [onOnboardingCompletedCallback, setOnOnboardingCompletedCallback] =
    useState<(() => void) | null>(null);

  // コールバックを設定する関数
  const setOnOnboardingCompleted = (callback: () => void) => {
    setOnOnboardingCompletedCallback(() => callback);
  };

  // ユーザーが変更されたときにオンボーディング状態を読み込み
  useEffect(() => {
    const loadOnboardingState = async () => {
      // 認証状態の初期化が完了するまで待つ
      if (authLoading) {
        console.log("認証状態の初期化中、待機中...");
        return;
      }

      if (!user) {
        console.log("ユーザーが認証されていません");
        setIsOnboardingCompleted(false);
        setOnboardingData(null);
        setIsLoading(false);
        return;
      }

      // user.idが有効なUUIDかチェック
      if (!user.id || user.id === "temp-user-id" || user.id.length < 10) {
        console.log(
          "無効なユーザーID、オンボーディング状態の読み込みをスキップ:",
          user.id
        );
        setIsOnboardingCompleted(false);
        setOnboardingData(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("オンボーディング状態を読み込み中、ユーザーID:", user.id);

        const { data, error } = await supabase
          .from("users")
          .select(
            "is_onboarding_completed, name, age, birth_date, target_age, target_amount"
          )
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("オンボーディング状態の読み込みに失敗:", error);
          setIsOnboardingCompleted(false);
        } else if (data) {
          setIsOnboardingCompleted(data.is_onboarding_completed || false);

          // オンボーディングデータを復元
          if (data.is_onboarding_completed && data.name) {
            const restoredData: OnboardingData = {
              name: data.name,
              age: data.age || 0,
              birthDate: data.birth_date || "",
              cashAmount: 0, // データベースから取得する必要がある
              stockAmount: 0, // データベースから取得する必要がある
              stockAnnualReturn: 0.05, // デフォルト値
              monthlyIncome: 0, // データベースから取得する必要がある
              monthlyExpense: 0, // データベースから取得する必要がある
              monthlyStockInvestment: 0, // データベースから取得する必要がある
              targetAge: data.target_age || 65,
              targetAmount: data.target_amount
                ? parseInt(data.target_amount)
                : 50000000,
            };
            setOnboardingData(restoredData);
          }
        }
      } catch (error) {
        console.error("オンボーディング状態の読み込みに失敗:", error);
        setIsOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingState();
  }, [user, authLoading]);

  const completeOnboarding = async (data: OnboardingData) => {
    console.log("OnboardingContext.completeOnboarding called with data:", data);

    if (!user) {
      console.error("ユーザーがログインしていません");
      return;
    }

    // user.idが有効なUUIDかチェック
    if (!user.id || user.id === "temp-user-id" || user.id.length < 10) {
      console.error(
        "無効なユーザーID、オンボーディング完了をスキップ:",
        user.id
      );
      return;
    }

    try {
      console.log("Calling usersApi.completeOnboarding for user:", user.id);

      // usersApi.completeOnboardingを使用して、onboarding_completed_dateも設定
      const result = await usersApi.completeOnboarding(user.id, {
        name: data.name,
        age: data.age,
        birth_date: data.birthDate,
        target_age: data.targetAge,
        target_amount: data.targetAmount,
      });

      console.log("usersApi.completeOnboarding result:", result);

      setIsOnboardingCompleted(true);
      setOnboardingData(data);

      console.log(
        "オンボーディング完了: onboarding_completed_dateが設定されました"
      );

      // オンボーディング完了後のコールバックを実行
      if (onOnboardingCompletedCallback) {
        console.log("Executing onboarding completion callback...");
        onOnboardingCompletedCallback();
      } else {
        console.log("No onboarding completion callback set");
      }
    } catch (error) {
      console.error("オンボーディング完了の保存に失敗:", error);
    }
  };

  const resetOnboarding = async () => {
    if (!user) {
      console.error("ユーザーがログインしていません");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_onboarding_completed: false,
        })
        .eq("id", user.id);

      if (error) {
        console.error("オンボーディング状態のリセットに失敗:", error);
        return;
      }

      setIsOnboardingCompleted(false);
      setOnboardingData(null);
    } catch (error) {
      console.error("オンボーディング状態のリセットに失敗:", error);
    }
  };

  if (isLoading) {
    return null; // またはローディングコンポーネント
  }

  const value: OnboardingContextType = {
    isOnboardingCompleted,
    onboardingData,
    completeOnboarding,
    resetOnboarding,
    setOnOnboardingCompleted, // コールバック設定関数
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
