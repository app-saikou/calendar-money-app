import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Icon, ICONS, ICON_COLORS, ICON_SIZES } from "../components/Icon";
import { useAssets } from "../contexts/AssetContext";
import { formatCurrency } from "../utils/calculations";

export const BudgetSettingsScreen: React.FC = () => {
  const { setBudget, getBudget } = useAssets();

  const [formData, setFormData] = useState(() => {
    // 現在月の予算を取得（固定予算として使用）
    const currentDate = new Date();
    const currentMonth =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0");
    const existingBudget = getBudget(currentMonth);
    return {
      income: existingBudget?.income?.toString() || "",
      expense: existingBudget?.expense?.toString() || "",
      stockInvestments:
        existingBudget?.stockInvestments?.[0]?.amount?.toString() || "",
    };
  });

  const saveBudget = () => {
    const income = parseFloat(formData.income) || 0;
    const expense = parseFloat(formData.expense) || 0;
    const stockInvestments = parseFloat(formData.stockInvestments) || 0;

    if (income < 0 || expense < 0 || stockInvestments < 0) {
      Alert.alert("エラー", "負の値は入力できません");
      return;
    }

    if (stockInvestments > income - expense) {
      Alert.alert(
        "警告",
        "株式投資額が収支差額を超えています。続行しますか？",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "続行",
            onPress: () => {
              // 固定予算として保存（現在月のキーを使用）
              const currentDate = new Date();
              const currentMonth =
                currentDate.getFullYear() +
                "-" +
                String(currentDate.getMonth() + 1).padStart(2, "0");
              setBudget({
                month: currentMonth,
                income,
                expense,
                stockInvestments: [
                  {
                    id: "1",
                    name: "月次積立",
                    amount: stockInvestments,
                    startDate: new Date().toISOString().split("T")[0],
                  },
                ],
                startDate: new Date().toISOString().split("T")[0],
              });
              Alert.alert("成功", "固定予算を保存しました");
            },
          },
        ]
      );
      return;
    }

    // 固定予算として保存（現在月のキーを使用）
    const currentDate = new Date();
    const currentMonth =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0");
    setBudget({
      month: currentMonth,
      income,
      expense,
      stockInvestments: [
        {
          id: "1",
          name: "月次積立",
          amount: stockInvestments,
          startDate: new Date().toISOString().split("T")[0],
        },
      ],
      startDate: new Date().toISOString().split("T")[0],
    });

    Alert.alert("成功", "固定予算を保存しました");
  };

  const netIncome =
    (parseFloat(formData.income) || 0) - (parseFloat(formData.expense) || 0);
  const remainingCash =
    netIncome - (parseFloat(formData.stockInvestments) || 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>固定予算設定</Text>
        <Text style={styles.subtitle}>
          毎月の収支と投資予算を固定で設定して、将来の資産推移を予測します
        </Text>

        {/* 収入設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name={ICONS.INCOME}
              size={ICON_SIZES.medium}
              color={ICON_COLORS.success}
            />
            <Text style={styles.sectionTitle}>月収入</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.income}
            onChangeText={(text) => setFormData({ ...formData, income: text })}
            placeholder="月の収入を入力"
            keyboardType="numeric"
          />
          {formData.income && (
            <Text style={styles.formattedAmount}>
              {formatCurrency(parseFloat(formData.income))}
            </Text>
          )}
        </View>

        {/* 支出設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name={ICONS.EXPENSE}
              size={ICON_SIZES.medium}
              color={ICON_COLORS.danger}
            />
            <Text style={styles.sectionTitle}>月支出</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.expense}
            onChangeText={(text) => setFormData({ ...formData, expense: text })}
            placeholder="月の支出を入力"
            keyboardType="numeric"
          />
          {formData.expense && (
            <Text style={styles.formattedAmount}>
              {formatCurrency(parseFloat(formData.expense))}
            </Text>
          )}
        </View>

        {/* 株式投資設定 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name={ICONS.STOCK}
              size={ICON_SIZES.medium}
              color={ICON_COLORS.primary}
            />
            <Text style={styles.sectionTitle}>月次株式投資額</Text>
          </View>
          <Text style={styles.sectionDescription}>
            毎月積立投資する株式の金額を設定します
          </Text>
          <TextInput
            style={styles.input}
            value={formData.stockInvestments}
            onChangeText={(text) =>
              setFormData({ ...formData, stockInvestments: text })
            }
            placeholder="月の株式投資額を入力"
            keyboardType="numeric"
          />
          {formData.stockInvestments && (
            <Text style={styles.formattedAmount}>
              {formatCurrency(parseFloat(formData.stockInvestments))}
            </Text>
          )}
        </View>

        {/* 計算結果 */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>📋 月次収支サマリー</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📈 収入</Text>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              +{formatCurrency(parseFloat(formData.income) || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📉 支出</Text>
            <Text style={[styles.summaryValue, { color: "#F44336" }]}>
              -{formatCurrency(parseFloat(formData.expense) || 0)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>💵 純収入</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: netIncome >= 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              {netIncome >= 0 ? "+" : ""}
              {formatCurrency(netIncome)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📊 株式投資</Text>
            <Text style={[styles.summaryValue, { color: "#2196F3" }]}>
              -{formatCurrency(parseFloat(formData.stockInvestments) || 0)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
              💰 現金残高変動
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  fontWeight: "bold",
                  color: remainingCash >= 0 ? "#4CAF50" : "#F44336",
                },
              ]}
            >
              {remainingCash >= 0 ? "+" : ""}
              {formatCurrency(remainingCash)}
            </Text>
          </View>
        </View>

        {/* 保存ボタン */}
        <TouchableOpacity style={styles.saveButton} onPress={saveBudget}>
          <Text style={styles.saveButtonIcon}>✅</Text>
          <Text style={styles.saveButtonText}>予算を保存</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  monthSelector: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  monthButtonActive: {
    backgroundColor: "#2196F3",
  },
  monthButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  monthButtonTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  formattedAmount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  summarySection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  saveButtonIcon: {
    fontSize: 20,
  },
});
