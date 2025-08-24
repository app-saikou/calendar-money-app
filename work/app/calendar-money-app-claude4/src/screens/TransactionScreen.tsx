import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";

import { useAssets } from "../contexts/AssetContext";
import { Transaction } from "../types";
import { formatCurrency } from "../utils/calculations";

export const TransactionScreen: React.FC = () => {
  const { addTransaction, transactions, deleteTransaction } = useAssets();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "income" as "income" | "expense" | "stock_investment",
    date: new Date().toISOString().split("T")[0],
  });

  const [showHistory, setShowHistory] = useState(false);

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      type: "income",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const saveTransaction = () => {
    if (!formData.amount || !formData.description) {
      Alert.alert("エラー", "金額と説明を入力してください");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("エラー", "有効な金額を入力してください");
      return;
    }

    // 支出と株式投資の場合は負の値にする
    const finalAmount = formData.type === "income" ? amount : -amount;

    addTransaction({
      amount: finalAmount,
      description: formData.description,
      type: formData.type,
      date: formData.date,
    });

    Alert.alert("成功", "取引を記録しました");
    resetForm();
  };

  const confirmDeleteTransaction = (transaction: Transaction) => {
    Alert.alert("削除確認", `「${transaction.description}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => deleteTransaction(transaction.id),
      },
    ]);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return { icon: "📈", color: "#4CAF50" };
      case "expense":
        return { icon: "📉", color: "#F44336" };
      case "stock_investment":
        return { icon: "📊", color: "#2196F3" };
      default:
        return { icon: "💰", color: "#666" };
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "income":
        return "収入";
      case "expense":
        return "支出";
      case "stock_investment":
        return "株式投資";
      default:
        return "不明";
    }
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type);
    const typeText = getTransactionTypeText(item.type);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionMain}>
          <View style={styles.transactionLeft}>
            <View
              style={[
                styles.transactionIcon,
                { backgroundColor: icon.color + "20" },
              ]}
            >
              <Text style={[styles.transactionIconText, { color: icon.color }]}>
                {icon.icon}
              </Text>
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>
                {item.description}
              </Text>
              <Text style={styles.transactionMeta}>
                {new Date(item.date).toLocaleDateString("ja-JP")} • {typeText}
              </Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.amount >= 0 ? "#4CAF50" : "#F44336" },
              ]}
            >
              {item.amount >= 0 ? "+" : ""}
              {formatCurrency(Math.abs(item.amount))}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeleteTransaction(item)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>収支記録</Text>
        <Text style={styles.subtitle}>
          収入、支出、株式投資を記録して資産推移を正確に追跡します
        </Text>

        {/* 取引入力フォーム */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>新しい取引を記録</Text>

          {/* 取引タイプ選択 */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "income" && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: "income" })}
            >
              <Text
                style={[
                  styles.typeButtonIcon,
                  { color: formData.type === "income" ? "#fff" : "#4CAF50" },
                ]}
              >
                📈
              </Text>
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "income" && styles.typeButtonTextActive,
                ]}
              >
                収入
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "expense" && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: "expense" })}
            >
              <Text
                style={[
                  styles.typeButtonIcon,
                  { color: formData.type === "expense" ? "#fff" : "#F44336" },
                ]}
              >
                📉
              </Text>
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "expense" && styles.typeButtonTextActive,
                ]}
              >
                支出
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "stock_investment" && styles.typeButtonActive,
              ]}
              onPress={() =>
                setFormData({ ...formData, type: "stock_investment" })
              }
            >
              <Text
                style={[
                  styles.typeButtonIcon,
                  {
                    color:
                      formData.type === "stock_investment" ? "#fff" : "#2196F3",
                  },
                ]}
              >
                📊
              </Text>
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "stock_investment" &&
                    styles.typeButtonTextActive,
                ]}
              >
                株式投資
              </Text>
            </TouchableOpacity>
          </View>

          {/* 金額入力 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>金額</Text>
            <TextInput
              style={styles.input}
              value={formData.amount}
              onChangeText={(text) =>
                setFormData({ ...formData, amount: text })
              }
              placeholder="金額を入力"
              keyboardType="numeric"
            />
            {formData.amount && (
              <Text style={styles.formattedAmount}>
                {formatCurrency(parseFloat(formData.amount))}
              </Text>
            )}
          </View>

          {/* 説明入力 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>説明</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="取引の説明を入力"
            />
          </View>

          {/* 日付入力 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>日付</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
            <Text style={styles.saveButtonIcon}>➕</Text>
            <Text style={styles.saveButtonText}>取引を記録</Text>
          </TouchableOpacity>
        </View>

        {/* 取引履歴 */}
        <View style={styles.historySection}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>
              取引履歴 ({transactions.length}件)
            </Text>
            <Text style={styles.historyToggleIcon}>
              {showHistory ? "▼" : "▶"}
            </Text>
          </TouchableOpacity>

          {showHistory && (
            <View style={styles.historyList}>
              {sortedTransactions.length === 0 ? (
                <Text style={styles.emptyText}>取引履歴がありません</Text>
              ) : (
                <FlatList
                  data={sortedTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}
        </View>
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
  formSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  typeButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
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
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  historySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 20,
  },
  transactionItem: {
    marginBottom: 12,
  },
  transactionMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  transactionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 12,
    color: "#666",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  transactionIconText: {
    fontSize: 20,
  },
  typeButtonIcon: {
    fontSize: 20,
  },
  saveButtonIcon: {
    fontSize: 20,
  },
  deleteIcon: {
    fontSize: 16,
  },
  historyToggleIcon: {
    fontSize: 16,
  },
});
