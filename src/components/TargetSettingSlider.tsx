import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { formatCurrency } from "../utils/calculations";

interface TargetSettingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  type: "age" | "amount";
}

const targetAgeSteps = [
  { value: 30, label: "30歳" },
  { value: 35, label: "35歳" },
  { value: 40, label: "40歳" },
  { value: 45, label: "45歳" },
  { value: 50, label: "50歳" },
  { value: 55, label: "55歳" },
  { value: 60, label: "60歳" },
  { value: 65, label: "65歳" },
  { value: 70, label: "70歳" },
  { value: 75, label: "75歳" },
  { value: 80, label: "80歳" },
  { value: 85, label: "85歳" },
  { value: 90, label: "90歳" },
  { value: 95, label: "95歳" },
  { value: 100, label: "100歳" },
];

const targetAmountSteps = [
  { value: 10000000, label: "1000万円" },
  { value: 20000000, label: "2000万円" },
  { value: 30000000, label: "3000万円" },
  { value: 40000000, label: "4000万円" },
  { value: 50000000, label: "5000万円" },
  { value: 60000000, label: "6000万円" },
  { value: 70000000, label: "7000万円" },
  { value: 80000000, label: "8000万円" },
  { value: 90000000, label: "9000万円" },
  { value: 100000000, label: "1億円" },
  { value: 200000000, label: "2億円" },
  { value: 300000000, label: "3億円" },
  { value: 500000000, label: "5億円" },
  { value: 700000000, label: "7億円" },
  { value: 1000000000, label: "10億円" },
];

export const TargetSettingSlider: React.FC<TargetSettingSliderProps> = ({
  value,
  onValueChange,
  type,
}) => {
  const getSteps = () => {
    switch (type) {
      case "age":
        return targetAgeSteps;
      case "amount":
        return targetAmountSteps;
      default:
        return targetAgeSteps;
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
        <Text style={styles.value}>
          {type === "age" ? `${value}歳` : formatCurrency(value)}
        </Text>
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
