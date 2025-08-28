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
import { StockInvestment } from "../types";
import { Icon, ICONS } from "../components/Icon";

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  startDate: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format (undefined = 無期限)
}

export const BudgetSettingsScreen: React.FC = () => {
  const { setBudget, getBudget } = useAssets();

  const [stockInvestments, setStockInvestments] = useState<StockInvestment[]>(
    () => {
      const currentDate = new Date();
      const today = currentDate.toISOString().split("T")[0];
      return [{ id: "1", name: "月次積立", amount: 0, startDate: today }];
    }
  );

  const [incomeCategories, setIncomeCategories] = useState<BudgetCategory[]>(
    () => {
      const currentDate = new Date();
      const today = currentDate.toISOString().split("T")[0];
      return [
        { id: "1", name: "給与", amount: 0, type: "income", startDate: today },
        { id: "2", name: "副業", amount: 0, type: "income", startDate: today },
        {
          id: "3",
          name: "その他収入",
          amount: 0,
          type: "income",
          startDate: today,
        },
      ];
    }
  );

  const [expenseCategories, setExpenseCategories] = useState<BudgetCategory[]>(
    () => {
      const currentDate = new Date();
      const today = currentDate.toISOString().split("T")[0];
      return [
        { id: "1", name: "食費", amount: 0, type: "expense", startDate: today },
        {
          id: "2",
          name: "住居費",
          amount: 0,
          type: "expense",
          startDate: today,
        },
        {
          id: "3",
          name: "光熱費",
          amount: 0,
          type: "expense",
          startDate: today,
        },
        {
          id: "4",
          name: "通信費",
          amount: 0,
          type: "expense",
          startDate: today,
        },
        {
          id: "5",
          name: "交通費",
          amount: 0,
          type: "expense",
          startDate: today,
        },
        {
          id: "6",
          name: "娯楽費",
          amount: 0,
          type: "expense",
          startDate: today,
        },
        {
          id: "7",
          name: "その他支出",
          amount: 0,
          type: "expense",
          startDate: today,
        },
      ];
    }
  );

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");
  const [newCategoryStartDate, setNewCategoryStartDate] = useState("");
  const [newCategoryEndDate, setNewCategoryEndDate] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // 株式投資管理用の状態
  const [showStockInvestmentModal, setShowStockInvestmentModal] =
    useState(false);
  const [editingStockInvestment, setEditingStockInvestment] =
    useState<StockInvestment | null>(null);
  const [newStockInvestmentName, setNewStockInvestmentName] = useState("");
  const [newStockInvestmentAmount, setNewStockInvestmentAmount] = useState("");
  const [newStockInvestmentStartDate, setNewStockInvestmentStartDate] =
    useState("");
  const [newStockInvestmentEndDate, setNewStockInvestmentEndDate] =
    useState("");
  const [isAddingNewStockInvestment, setIsAddingNewStockInvestment] =
    useState(false);

  const saveBudget = () => {
    const totalStockInvestment = stockInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );

    if (totalStockInvestment < 0) {
      Alert.alert("エラー", "負の値は入力できません");
      return;
    }

    if (totalStockInvestment > netIncome) {
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

    setBudget({
      month: currentMonth,
      income: totalIncome,
      expense: totalExpense,
      stockInvestments: stockInvestments,
      startDate: new Date().toISOString().split("T")[0],
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
    setNewCategoryStartDate(category.startDate);
    setNewCategoryEndDate(category.endDate || "");
    setIsAddingNew(false);
    setShowCategoryModal(true);
  };

  const openAddCategoryModal = (type: "income" | "expense") => {
    const currentDate = new Date();
    const today = currentDate.toISOString().split("T")[0];
    setEditingCategory({
      id: Date.now().toString(),
      name: "",
      amount: 0,
      type: type,
      startDate: today,
    });
    setNewCategoryName("");
    setNewCategoryAmount("");
    setNewCategoryStartDate(today);
    setNewCategoryEndDate("");
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
      startDate: newCategoryStartDate,
      endDate: newCategoryEndDate || undefined,
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
    setNewCategoryStartDate("");
    setNewCategoryEndDate("");
    setIsAddingNew(false);
  };

  // 株式投資管理関数
  const openAddStockInvestmentModal = () => {
    const currentDate = new Date();
    const today = currentDate.toISOString().split("T")[0];
    setEditingStockInvestment({
      id: Date.now().toString(),
      name: "",
      amount: 0,
      startDate: today,
    });
    setNewStockInvestmentName("");
    setNewStockInvestmentAmount("");
    setNewStockInvestmentStartDate(today);
    setNewStockInvestmentEndDate("");
    setIsAddingNewStockInvestment(true);
    setShowStockInvestmentModal(true);
  };

  const openStockInvestmentModal = (investment: StockInvestment) => {
    setEditingStockInvestment(investment);
    setNewStockInvestmentName(investment.name);
    setNewStockInvestmentAmount(investment.amount.toString());
    setNewStockInvestmentStartDate(investment.startDate);
    setNewStockInvestmentEndDate(investment.endDate || "");
    setIsAddingNewStockInvestment(false);
    setShowStockInvestmentModal(true);
  };

  const deleteStockInvestment = (investment: StockInvestment) => {
    Alert.alert("投資設定削除", `「${investment.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => {
          setStockInvestments((prev) =>
            prev.filter((inv) => inv.id !== investment.id)
          );
        },
      },
    ]);
  };

  const saveStockInvestment = () => {
    if (!editingStockInvestment || !newStockInvestmentName.trim()) {
      Alert.alert("エラー", "投資名を入力してください");
      return;
    }

    const amount = parseFloat(newStockInvestmentAmount) || 0;
    const updatedInvestment = {
      ...editingStockInvestment,
      name: newStockInvestmentName.trim(),
      amount: amount,
      startDate: newStockInvestmentStartDate,
      endDate: newStockInvestmentEndDate || undefined,
    };

    if (isAddingNewStockInvestment) {
      // 新規追加
      setStockInvestments((prev) => [...prev, updatedInvestment]);
    } else {
      // 編集
      setStockInvestments((prev) =>
        prev.map((inv) =>
          inv.id === editingStockInvestment.id ? updatedInvestment : inv
        )
      );
    }

    setShowStockInvestmentModal(false);
    setEditingStockInvestment(null);
    setNewStockInvestmentName("");
    setNewStockInvestmentAmount("");
    setNewStockInvestmentStartDate("");
    setNewStockInvestmentEndDate("");
    setIsAddingNewStockInvestment(false);
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

  // 期限順でソート（開始日が早い順）
  const sortCategoriesByDate = (categories: BudgetCategory[]) => {
    return [...categories].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const sortedIncomeCategories = sortCategoriesByDate(incomeCategories);
  const sortedExpenseCategories = sortCategoriesByDate(expenseCategories);

  // 収支サマリーの計算
  const netIncome = totalIncome - totalExpense;
  const totalStockInvestment = stockInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const remainingCash = netIncome - totalStockInvestment;

  return (
    <ScrollView style={styles.container}>
      {/* 株式投資額設定セクション */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <View style={styles.sectionTitleContainer}>
              <Icon name={ICONS.INVESTMENT} size={20} color="#333" />
              <Text style={styles.sectionTitle}> 株式投資額設定</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              複数の積立投資を期限付きで設定
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddStockInvestmentModal()}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {stockInvestments.map((investment) => (
          <View key={investment.id} style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryCardContent}
              onPress={() => openStockInvestmentModal(investment)}
            >
              <View style={styles.categoryCardHeader}>
                <Text style={styles.categoryCardName}>{investment.name}</Text>
                <View style={styles.categoryCardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openStockInvestmentModal(investment)}
                  >
                    <Text style={styles.actionButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteStockInvestment(investment)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.categoryCardDetails}>
                <Text style={styles.categoryCardAmount}>
                  {formatCurrency(investment.amount)}
                </Text>
                <Text style={styles.categoryCardDate}>
                  {investment.startDate} 〜 {investment.endDate || "無期限"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.categoryTotal}>
          <Text style={styles.categoryTotalLabel}>合計投資額</Text>
          <Text style={styles.categoryTotalAmount}>
            {formatCurrency(totalStockInvestment)}
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveBudget}>
          <Icon name={ICONS.SAVE} size={18} color="#fff" />
          <Text style={styles.saveButtonText}>予算を保存</Text>
        </TouchableOpacity>
      </View>

      {/* 収入カテゴリセクション */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <View style={styles.sectionTitleContainer}>
              <Icon name={ICONS.INCOME} size={20} color="#333" />
              <Text style={styles.sectionTitle}> 収入カテゴリ</Text>
            </View>
            <Text style={styles.sectionSubtitle}>収入をカテゴリ別に設定</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddCategoryModal("income")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {sortedIncomeCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryCardContent}
              onPress={() => openCategoryModal(category)}
            >
              <View style={styles.categoryCardHeader}>
                <Text style={styles.categoryCardName}>{category.name}</Text>
                <View style={styles.categoryCardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openCategoryModal(category)}
                  >
                    <Text style={styles.actionButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteCategory(category)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.categoryCardDetails}>
                <Text style={styles.categoryCardAmount}>
                  {formatCurrency(category.amount)}
                </Text>
                <Text style={styles.categoryCardDate}>
                  {category.startDate} 〜 {category.endDate || "無期限"}
                </Text>
              </View>
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
            <View style={styles.sectionTitleContainer}>
              <Icon name={ICONS.EXPENSE} size={20} color="#333" />
              <Text style={styles.sectionTitle}> 支出カテゴリ</Text>
            </View>
            <Text style={styles.sectionSubtitle}>支出をカテゴリ別に設定</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddCategoryModal("expense")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {sortedExpenseCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryCardContent}
              onPress={() => openCategoryModal(category)}
            >
              <View style={styles.categoryCardHeader}>
                <Text style={styles.categoryCardName}>{category.name}</Text>
                <View style={styles.categoryCardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openCategoryModal(category)}
                  >
                    <Text style={styles.actionButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteCategory(category)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.categoryCardDetails}>
                <Text style={styles.categoryCardAmount}>
                  {formatCurrency(category.amount)}
                </Text>
                <Text style={styles.categoryCardDate}>
                  {category.startDate} 〜 {category.endDate || "無期限"}
                </Text>
              </View>
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
          <View style={styles.sectionTitleContainer}>
            <Icon name={ICONS.SUMMARY} size={20} color="#333" />
            <Text style={styles.sectionTitle}> 月次収支サマリー</Text>
          </View>
          <Text style={styles.sectionSubtitle}>カテゴリ別予算の詳細</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Icon name={ICONS.INCOME} size={16} color="#4CAF50" />
              <Text style={styles.summaryLabel}> 収入合計</Text>
            </View>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              +{formatCurrency(totalIncome)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Icon name={ICONS.EXPENSE} size={16} color="#F44336" />
              <Text style={styles.summaryLabel}> 支出合計</Text>
            </View>
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
            <View style={styles.summaryLabelContainer}>
              <Icon name={ICONS.INVESTMENT} size={16} color="#2196F3" />
              <Text style={styles.summaryLabel}> 株式投資</Text>
            </View>
            <Text style={[styles.summaryValue, { color: "#2196F3" }]}>
              -{formatCurrency(totalStockInvestment)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Icon name={ICONS.CASH} size={16} color="#FF9800" />
              <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
                {" "}
                現金残高変化
              </Text>
            </View>
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

      {/* 株式投資設定モーダル */}
      <Modal
        visible={showStockInvestmentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStockInvestmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isAddingNewStockInvestment ? "新規追加" : "編集"} -
                株式投資設定
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowStockInvestmentModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>投資名</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newStockInvestmentName}
                  onChangeText={setNewStockInvestmentName}
                  placeholder="例: 月次積立、ボーナス投資"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>月次投資額</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newStockInvestmentAmount}
                  onChangeText={setNewStockInvestmentAmount}
                  placeholder="0"
                  keyboardType="numeric"
                />
                {newStockInvestmentAmount && (
                  <Text style={styles.modalFormattedAmount}>
                    {formatCurrency(parseFloat(newStockInvestmentAmount) || 0)}
                  </Text>
                )}
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>開始日</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newStockInvestmentStartDate}
                  onChangeText={setNewStockInvestmentStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>終了日（オプション）</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newStockInvestmentEndDate}
                  onChangeText={setNewStockInvestmentEndDate}
                  placeholder="YYYY-MM-DD（空欄で無期限）"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStockInvestmentModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveCategoryButton}
                onPress={saveStockInvestment}
              >
                <Text style={styles.saveCategoryButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>開始日</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCategoryStartDate}
                  onChangeText={setNewCategoryStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>終了日（オプション）</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newCategoryEndDate}
                  onChangeText={setNewCategoryEndDate}
                  placeholder="YYYY-MM-DD（空欄で無期限）"
                />
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
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  summaryLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  categoryDetails: {
    flex: 1,
  },
  categoryDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 12,
  },
  // 新しいカード形式のスタイル
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  categoryCardContent: {
    padding: 16,
  },
  categoryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  categoryCardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#F8F9FA",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  actionButtonText: {
    fontSize: 14,
  },
  categoryCardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  categoryCardAmount: {
    fontSize: 18,
    color: "#2196F3",
    fontWeight: "700",
  },
  categoryCardDate: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
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
