import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";

import { useAssets } from "../contexts/AssetContext";
import { formatCurrency } from "../utils/calculations";

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
}

export const BudgetSettingsScreen: React.FC = () => {
  const { setBudget, getBudget } = useAssets();

  const [stockInvestment, setStockInvestment] = useState(() => {
    // 現在月の予算を取得（固定予算として使用）
    const currentDate = new Date();
    const currentMonth =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0");
    const existingBudget = getBudget(currentMonth);
    return existingBudget?.stockInvestment?.toString() || "";
  });

  const [incomeCategories, setIncomeCategories] = useState<BudgetCategory[]>([
    { id: "1", name: "給与", amount: 0, type: "income" },
    { id: "2", name: "副業", amount: 0, type: "income" },
    { id: "3", name: "その他収入", amount: 0, type: "income" },
  ]);

  const [expenseCategories, setExpenseCategories] = useState<BudgetCategory[]>([
    { id: "1", name: "食費", amount: 0, type: "expense" },
    { id: "2", name: "住居費", amount: 0, type: "expense" },
    { id: "3", name: "光熱費", amount: 0, type: "expense" },
    { id: "4", name: "通信費", amount: 0, type: "expense" },
    { id: "5", name: "交通費", amount: 0, type: "expense" },
    { id: "6", name: "娯楽費", amount: 0, type: "expense" },
    { id: "7", name: "その他支出", amount: 0, type: "expense" },
  ]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const saveBudget = () => {
    const stockInvestmentAmount = parseFloat(stockInvestment) || 0;

    if (stockInvestmentAmount < 0) {
      Alert.alert("エラー", "負の値は入力できません");
      return;
    }

    if (stockInvestmentAmount > netIncome) {
      Alert.alert(
        "警告",
        "株式投資額が収支差額を超えています。続行しますか？",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "続行",
            onPress: () => {
              performSave();
            },
          },
        ]
      );
    } else {
      performSave();
    }
  };

  const performSave = () => {
    // 現在月に固定予算として保存
    const currentDate = new Date();
    const currentMonth =
      currentDate.getFullYear() +
      "-" +
      String(currentDate.getMonth() + 1).padStart(2, "0");

    setBudget(currentMonth, {
      income: totalIncome,
      expense: totalExpense,
      stockInvestment: parseFloat(stockInvestment) || 0,
    });

    Alert.alert("成功", "カテゴリ予算が保存されました");
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount) || 0;
    return formatCurrency(num);
  };

  // カテゴリ管理関数
  const openCategoryModal = (category: BudgetCategory) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryAmount(category.amount.toString());
    setIsAddingNew(false);
    setShowCategoryModal(true);
  };

  const openAddCategoryModal = (type: "income" | "expense") => {
    setEditingCategory({
      id: Date.now().toString(),
      name: "",
      amount: 0,
      type: type,
    });
    setNewCategoryName("");
    setNewCategoryAmount("");
    setIsAddingNew(true);
    setShowCategoryModal(true);
  };

  const deleteCategory = (category: BudgetCategory) => {
    Alert.alert("カテゴリ削除", `「${category.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          if (category.type === "income") {
            setIncomeCategories((prev) =>
              prev.filter((cat) => cat.id !== category.id)
            );
          } else {
            setExpenseCategories((prev) =>
              prev.filter((cat) => cat.id !== category.id)
            );
          }
        },
      },
    ]);
  };

  const saveCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert("エラー", "カテゴリ名を入力してください");
      return;
    }

    const amount = parseFloat(newCategoryAmount) || 0;
    const updatedCategory = {
      ...editingCategory,
      name: newCategoryName.trim(),
      amount: amount,
    };

    if (isAddingNew) {
      // 新規追加
      if (editingCategory.type === "income") {
        setIncomeCategories((prev) => [...prev, updatedCategory]);
      } else {
        setExpenseCategories((prev) => [...prev, updatedCategory]);
      }
    } else {
      // 編集
      if (editingCategory.type === "income") {
        setIncomeCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? updatedCategory : cat
          )
        );
      } else {
        setExpenseCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? updatedCategory : cat
          )
        );
      }
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    setNewCategoryName("");
    setNewCategoryAmount("");
    setIsAddingNew(false);
  };

  // カテゴリ合計の計算
  const totalIncome = incomeCategories.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );
  const totalExpense = expenseCategories.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );

  // 収支サマリーの計算
  const netIncome = totalIncome - totalExpense;
  const remainingCash = netIncome - (parseFloat(stockInvestment) || 0);

  return (
    <ScrollView style={styles.container}>
      {/* 株式投資額設定セクション */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📊 株式投資額設定</Text>
        <Text style={styles.sectionSubtitle}>毎月の積立投資額を設定</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📈 月次株式投資額</Text>
          <TextInput
            style={styles.input}
            value={stockInvestment}
            onChangeText={setStockInvestment}
            placeholder="例: 50000"
            keyboardType="numeric"
          />
          {stockInvestment && (
            <Text style={styles.formattedAmount}>
              {formatAmount(stockInvestment)}
            </Text>
          )}
          <Text style={styles.helperText}>毎月積立投資する金額（任意）</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveBudget}>
          <Text style={styles.saveButtonIcon}>💾</Text>
          <Text style={styles.saveButtonText}>予算を保存</Text>
        </TouchableOpacity>
      </View>

      {/* 収入カテゴリセクション */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>📈 収入カテゴリ</Text>
            <Text style={styles.sectionSubtitle}>収入をカテゴリ別に設定</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddCategoryModal("income")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {incomeCategories.map((category) => (
          <View key={category.id} style={styles.categoryItemContainer}>
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => openCategoryModal(category)}
            >
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.amount)}
                </Text>
              </View>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteCategory(category)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.categoryTotal}>
          <Text style={styles.categoryTotalLabel}>合計収入</Text>
          <Text style={styles.categoryTotalAmount}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
      </View>

      {/* 支出カテゴリセクション */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>📉 支出カテゴリ</Text>
            <Text style={styles.sectionSubtitle}>支出をカテゴリ別に設定</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddCategoryModal("expense")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {expenseCategories.map((category) => (
          <View key={category.id} style={styles.categoryItemContainer}>
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => openCategoryModal(category)}
            >
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.amount)}
                </Text>
              </View>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteCategory(category)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.categoryTotal}>
          <Text style={styles.categoryTotalLabel}>合計支出</Text>
          <Text style={styles.categoryTotalAmount}>
            {formatCurrency(totalExpense)}
          </Text>
        </View>
      </View>

      {/* 収支サマリーセクション */}
      {(totalIncome > 0 || totalExpense > 0) && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📋 月次収支サマリー</Text>
          <Text style={styles.sectionSubtitle}>カテゴリ別予算の詳細</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📈 収入合計</Text>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              +{formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📉 支出合計</Text>
            <Text style={[styles.summaryValue, { color: "#F44336" }]}>
              -{formatCurrency(totalExpense)}
            </Text>
          </View>

          <View style={styles.divider} />

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
              -{formatCurrency(parseFloat(stockInvestment) || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
              💰 現金残高変化
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color: remainingCash >= 0 ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                },
              ]}
            >
              {remainingCash >= 0 ? "+" : ""}
              {formatCurrency(remainingCash)}
            </Text>
          </View>
        </View>
      )}

      {/* カテゴリ編集モーダル */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingNew ? "新規追加" : "編集"} -
                {editingCategory?.type === "income" ? "収入" : "支出"}カテゴリ
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>カテゴリ名</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="カテゴリ名を入力"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>金額</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCategoryAmount}
                  onChangeText={setNewCategoryAmount}
                  placeholder="0"
                  keyboardType="numeric"
                />
                {newCategoryAmount && (
                  <Text style={styles.modalFormattedAmount}>
                    {formatCurrency(parseFloat(newCategoryAmount) || 0)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveCategoryButton}
                onPress={saveCategory}
              >
                <Text style={styles.saveCategoryButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  formattedAmount: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 4,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 12,
  },
  // カテゴリ関連のスタイル
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  categoryItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 12,
  },
  categoryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginTop: 12,
  },
  categoryTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryTotalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#F8F9FA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  modalContent: {
    padding: 20,
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  modalFormattedAmount: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 4,
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    backgroundColor: "#F8F9FA",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveCategoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    alignItems: "center",
  },
  saveCategoryButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
