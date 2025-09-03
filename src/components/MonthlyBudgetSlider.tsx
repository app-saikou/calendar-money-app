import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { formatCurrency } from "../utils/calculations";

interface MonthlyBudgetSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  type: "income" | "expense" | "investment";
}

const monthlyIncomeSteps = [
  { value: 0, label: "0円" },
  { value: 100000, label: "10万円" },
  { value: 200000, label: "20万円" },
  { value: 300000, label: "30万円" },
  { value: 400000, label: "40万円" },
  { value: 500000, label: "50万円" },
  { value: 700000, label: "70万円" },
  { value: 1000000, label: "100万円" },
  { value: 1500000, label: "150万円" },
  { value: 2000000, label: "200万円" },
  { value: 3000000, label: "300万円" },
  { value: 5000000, label: "500万円" },
];

const monthlyExpenseSteps = [
  { value: 0, label: "0円" },
  { value: 50000, label: "5万円" },
  { value: 100000, label: "10万円" },
  { value: 150000, label: "15万円" },
  { value: 200000, label: "20万円" },
  { value: 300000, label: "30万円" },
  { value: 400000, label: "40万円" },
  { value: 500000, label: "50万円" },
  { value: 700000, label: "70万円" },
  { value: 1000000, label: "100万円" },
  { value: 1500000, label: "150万円" },
  { value: 2000000, label: "200万円" },
];

const monthlyInvestmentSteps = [
  { value: 0, label: "0円" },
  { value: 10000, label: "1万円" },
  { value: 20000, label: "2万円" },
  { value: 30000, label: "3万円" },
  { value: 50000, label: "5万円" },
  { value: 70000, label: "7万円" },
  { value: 100000, label: "10万円" },
  { value: 150000, label: "15万円" },
  { value: 200000, label: "20万円" },
  { value: 300000, label: "30万円" },
  { value: 500000, label: "50万円" },
  { value: 1000000, label: "100万円" },
];

export const MonthlyBudgetSlider: React.FC<MonthlyBudgetSliderProps> = ({
  value,
  onValueChange,
  type,
}) => {
  const getSteps = () => {
    switch (type) {
      case "income":
        return monthlyIncomeSteps;
      case "expense":
        return monthlyExpenseSteps;
      case "investment":
        return monthlyInvestmentSteps;
      default:
        return monthlyIncomeSteps;
    }
  };

  const steps = getSteps();

  // 現在の値に最も近いステップのインデックスを取得
  const getCurrentStepIndex = () => {
    const closestStep = steps.reduce((prev, curr) => {
      return Math.abs(curr.value - value) < Math.abs(prev.value - value)
        ? curr
        : prev;
    });
    return steps.findIndex((step) => step.value === closestStep.value);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <View style={styles.container}>
      {/* 現在の値を表示 */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{formatCurrency(value)}</Text>
      </View>

      {/* スライダー */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={steps.length - 1}
        step={1}
        value={currentStepIndex}
        onValueChange={(index) => {
          const stepIndex = Math.round(index);
          const newValue = steps[stepIndex].value;
          onValueChange(newValue);
        }}
        minimumTrackTintColor="#2196F3"
        maximumTrackTintColor="#E0E0E0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  valueContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 16,
  },
});
