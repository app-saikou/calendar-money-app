import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";

import { AssetProvider } from "./src/contexts/AssetContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { SettingsProvider } from "./src/contexts/SettingsContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AssetManagementScreen } from "./src/screens/AssetManagementScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { AccountSettingsScreen } from "./src/screens/AccountSettingsScreen";
import { BudgetSettingsScreen } from "./src/screens/BudgetSettingsScreen";
import { TargetSettingsScreen } from "./src/screens/TargetSettingsScreen";
import { TransactionScreen } from "./src/screens/TransactionScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";

const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();

// 設定関連のスタックナビゲーター
const SettingsStackScreen: React.FC = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: "設定",
        }}
      />
      <SettingsStack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          title: "アカウント設定",
        }}
      />
      <SettingsStack.Screen
        name="BudgetSettings"
        component={BudgetSettingsScreen}
        options={{
          title: "予算設定",
        }}
      />
      <SettingsStack.Screen
        name="TargetSettings"
        component={TargetSettingsScreen}
        options={{
          title: "目標設定",
        }}
      />
    </SettingsStack.Navigator>
  );
};

// メインアプリコンポーネント（認証状態に基づいて表示を切り替え）
const MainApp: React.FC = () => {
  const { user, isLoading, login, completeOnboarding } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  // 未ログインの場合
  if (!user) {
    return (
      <AuthScreen
        onLogin={async (userId) => {
          await login(userId, "temp@example.com");
        }}
      />
    );
  }

  // オンボーディング未完了の場合
  if (!user.isOnboardingCompleted) {
    return (
      <OnboardingScreen
        onComplete={async (data) => {
          await completeOnboarding(data);
        }}
      />
    );
  }

  // メインアプリ
  return (
    <SettingsProvider>
      <AssetProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let icon: string;

                if (route.name === "Home") {
                  icon = focused ? "🏠" : "🏠";
                } else if (route.name === "Assets") {
                  icon = focused ? "💰" : "💰";
                } else if (route.name === "Settings") {
                  icon = focused ? "⚙️" : "⚙️";
                } else if (route.name === "Transaction") {
                  icon = focused ? "📝" : "📝";
                } else {
                  icon = "❓";
                }

                return (
                  <Text style={{ fontSize: size, color: color }}>{icon}</Text>
                );
              },
              tabBarActiveTintColor: "#2196F3",
              tabBarInactiveTintColor: "gray",
              tabBarStyle: {
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#e0e0e0",
                height: 90,
                paddingBottom: 20,
                paddingTop: 10,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "500",
              },
              headerStyle: {
                backgroundColor: "#2196F3",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            })}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "ホーム",
              }}
            />
            <Tab.Screen
              name="Transaction"
              component={TransactionScreen}
              options={{
                title: "収支記録",
              }}
            />
            <Tab.Screen
              name="Assets"
              component={AssetManagementScreen}
              options={{
                title: "資産管理",
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsStackScreen}
              options={{
                title: "設定",
                headerShown: false,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </AssetProvider>
    </SettingsProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
