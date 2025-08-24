import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AssetCalendar } from "../components/AssetCalendar";

export const HomeScreen: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const hasSeenTooltip = await AsyncStorage.getItem(
        "hasSeenCalendarTooltip"
      );
      if (hasSeenTooltip === "true") {
        setShowTooltip(false);
      }
    } catch (error) {
      console.log("Error checking first time:", error);
    }
  };

  const hideTooltip = async () => {
    try {
      await AsyncStorage.setItem("hasSeenCalendarTooltip", "true");
      setShowTooltip(false);
    } catch (error) {
      console.log("Error hiding tooltip:", error);
    }
  };

  const handleDayPress = (_date: string) => {
    // 日付がタップされた時の処理（必要に応じて実装）
  };

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>資産管理</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </Text>
      </View>

      {/* 余白 */}
      <View style={styles.spacer} />

      {/* カレンダー */}
      <View style={styles.calendarContainer}>
        {showTooltip && (
          <TouchableOpacity
            style={styles.tooltipContainer}
            onPress={hideTooltip}
          >
            <Text style={styles.tooltipText}>
              💡 日付をタップして詳細を確認できます
            </Text>
            <Text style={styles.tooltipClose}>✕</Text>
          </TouchableOpacity>
        )}
        <AssetCalendar onDayPress={handleDayPress} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    padding: 20,
    paddingTop: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#E3F2FD",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  mainAssetSection: {
    marginBottom: 16,
  },
  totalAssetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalAssetLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  periodSelector: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  periodText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  totalAssetAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  changePercent: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  assetBreakdown: {
    flexDirection: "row",
    gap: 8,
  },
  assetCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  assetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  assetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  assetIconText: {
    fontSize: 16,
  },
  assetType: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  assetAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  assetPercentage: {
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
    marginBottom: 4,
    overflow: "hidden",
  },
  percentageBar: {
    height: "100%",
    borderRadius: 2,
  },
  percentageText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  breakdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  breakdownToggleText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  breakdownToggleIcon: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },

  calendarContainer: {
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  calendarSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  spacer: {
    height: 20,
  },
  tooltipContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  tooltipText: {
    flex: 1,
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  tooltipClose: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
