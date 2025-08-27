import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface SettingsScreenProps {
  navigation?: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const settingsItems = [
    {
      id: "account",
      title: "👤 アカウント設定",
      subtitle: "ユーザー情報・ログアウト",
      onPress: () => navigation?.navigate("AccountSettings"),
    },
    {
      id: "budget",
      title: "💰 予算設定",
      subtitle: "月次収支・投資額の設定",
      onPress: () => navigation?.navigate("BudgetSettings"),
    },
    {
      id: "target",
      title: "🎯 目標設定",
      subtitle: "目標年齢・目標資産額の設定",
      onPress: () => navigation?.navigate("TargetSettings"),
    },
    {
      id: "notifications",
      title: "🔔 通知設定",
      subtitle: "プッシュ通知・アラート",
      onPress: () => {
        // 将来実装予定
      },
      disabled: true,
    },
    {
      id: "theme",
      title: "🎨 テーマ設定",
      subtitle: "ダークモード・色設定",
      onPress: () => {
        // 将来実装予定
      },
      disabled: true,
    },
    {
      id: "data",
      title: "📊 データ管理",
      subtitle: "エクスポート・インポート",
      onPress: () => {
        // 将来実装予定
      },
      disabled: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.menuContainer}>
        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}
            onPress={item.onPress}
            disabled={item.disabled}
          >
            <View style={styles.menuItemContent}>
              <Text
                style={[
                  styles.menuItemTitle,
                  item.disabled && styles.menuItemTitleDisabled,
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  item.disabled && styles.menuItemSubtitleDisabled,
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
            <View style={styles.menuItemArrow}>
              <Text
                style={[
                  styles.arrowText,
                  item.disabled && styles.arrowTextDisabled,
                ]}
              >
                {item.disabled ? "🚧" : "›"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>資産管理アプリ v1.0</Text>
        <Text style={styles.versionSubtext}>将来の資産をシンプルに管理</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  menuContainer: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuItemTitleDisabled: {
    color: "#999",
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  menuItemSubtitleDisabled: {
    color: "#999",
  },
  menuItemArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: "#2196F3",
    fontWeight: "bold",
  },
  arrowTextDisabled: {
    color: "#999",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "400",
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 10,
    color: "#bbb",
    fontWeight: "400",
  },
});
