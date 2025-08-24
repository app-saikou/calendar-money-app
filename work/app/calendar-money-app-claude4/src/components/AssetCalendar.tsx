import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

type MarkedDates = {
  [key: string]: {
    marked?: boolean;
    dotColor?: string;
    selectedColor?: string;
    selected?: boolean;
    customStyles?: {
      container?: object;
      text?: object;
    };
  };
};
import { useAssets } from "../contexts/AssetContext";
import { formatCurrency } from "../utils/calculations";

interface AssetCalendarProps {
  onDayPress?: (date: string) => void;
}

export const AssetCalendar: React.FC<AssetCalendarProps> = ({ onDayPress }) => {
  const { calendarData } = useAssets();
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    onDayPress?.(day.dateString);
  };

  // カレンダーのマーキングデータを生成
  const markedDates: MarkedDates = {};

  Object.keys(calendarData).forEach((date) => {
    const dayData = calendarData[date];
    let dotColor = "#4CAF50"; // 緑（増加）

    // 前日との比較で色を決定
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateString = prevDate.toISOString().split("T")[0];
    const prevDayData = calendarData[prevDateString];

    if (prevDayData && dayData.totalAssets < prevDayData.totalAssets) {
      dotColor = "#F44336"; // 赤（減少）
    }

    if (dayData.isToday) {
      dotColor = "#2196F3"; // 青（今日）
    }

    markedDates[date] = {
      marked: true,
      dotColor,
      selectedColor: selectedDate === date ? "#E3F2FD" : undefined,
      selected: selectedDate === date,
    };
  });

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        monthFormat={"yyyy年 M月"}
        dayComponent={({ date, state }) => {
          if (!date) return <View style={styles.customDayContainer} />;

          const dayData = calendarData[date.dateString];
          const isSelected = selectedDate === date.dateString;
          const isToday = dayData?.isToday;
          const isPrediction = dayData?.isPrediction;
          const isDisabled = state === "disabled";

          return (
            <TouchableOpacity
              style={[
                styles.customDayContainer,
                isSelected && styles.selectedCustomDay,
                isToday && styles.todayCustomContainer,
                isDisabled && styles.disabledDay,
              ]}
              onPress={() => !isDisabled && date && handleDayPress(date)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.customDayText,
                  isSelected && styles.selectedCustomDayText,
                  isToday && styles.todayCustomText,
                  isPrediction && styles.predictionCustomText,
                  isDisabled && styles.disabledDayText,
                ]}
              >
                {date.day}
              </Text>
              {dayData && !isDisabled && (
                <Text
                  style={[
                    styles.customAssetText,
                    isSelected && styles.selectedCustomAssetText,
                    isPrediction && styles.predictionCustomAssetText,
                  ]}
                >
                  {formatCurrency(dayData.totalAssets)}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          arrowColor: "#2196F3",
          disabledArrowColor: "#d9e1e8",
          monthTextColor: "#333",
          indicatorColor: "#2196F3",
          textDayFontFamily: "System",
          textMonthFontFamily: "System",
          textDayHeaderFontFamily: "System",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "300",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      {selectedDate && calendarData[selectedDate] && (
        <View style={styles.dayDetail}>
          <Text style={styles.detailTitle}>
            {new Date(selectedDate).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {calendarData[selectedDate].isPrediction && " (予測)"}
          </Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>総資産:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(calendarData[selectedDate].totalAssets)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>現金:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(calendarData[selectedDate].cashAmount)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>株式:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(calendarData[selectedDate].stockAmount)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  calendar: {
    paddingBottom: 10,
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    minHeight: 60,
    borderRadius: 8,
    marginHorizontal: 1,
  },
  selectedDay: {
    backgroundColor: "#E3F2FD",
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  selectedDayText: {
    color: "#1976D2",
    fontWeight: "bold",
  },
  todayText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  predictionText: {
    color: "#666",
  },
  assetText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  selectedAssetText: {
    color: "#1976D2",
    fontWeight: "500",
  },
  predictionAssetText: {
    fontStyle: "italic",
    color: "#999",
  },
  // カスタム日付コンポーネント用のスタイル
  customDayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 32,
    paddingVertical: 2,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  selectedCustomDay: {
    backgroundColor: "#E3F2FD",
  },
  todayCustomContainer: {
    borderWidth: 2,
    borderColor: "#2196F3",
    backgroundColor: "#F3F8FF",
  },
  disabledDay: {
    opacity: 0.3,
  },
  customDayText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 1,
  },
  selectedCustomDayText: {
    color: "#1976D2",
    fontWeight: "bold",
  },
  todayCustomText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  predictionCustomText: {
    color: "#666",
  },
  disabledDayText: {
    color: "#ccc",
  },
  customAssetText: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    lineHeight: 8,
  },
  selectedCustomAssetText: {
    color: "#1976D2",
    fontWeight: "500",
  },
  predictionCustomAssetText: {
    fontStyle: "italic",
    color: "#999",
  },
  dayDetail: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
