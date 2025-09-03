import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

interface AnnualReturnSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const annualReturnSteps = [
  { value: 0, label: "0%" },
  { value: 1, label: "1%" },
  { value: 2, label: "2%" },
  { value: 3, label: "3%" },
  { value: 4, label: "4%" },
  { value: 5, label: "5%" },
  { value: 6, label: "6%" },
  { value: 7, label: "7%" },
  { value: 8, label: "8%" },
  { value: 9, label: "9%" },
  { value: 10, label: "10%" },
  { value: 12, label: "12%" },
  { value: 15, label: "15%" },
  { value: 20, label: "20%" },
];

export const AnnualReturnSlider: React.FC<AnnualReturnSliderProps> = ({
  value,
  onValueChange,
}) => {
  // 現在の値に最も近いステップのインデックスを取得
  const getCurrentStepIndex = () => {
    const closestStep = annualReturnSteps.reduce((prev, curr) => {
      return Math.abs(curr.value - value) < Math.abs(prev.value - value)
        ? curr
        : prev;
    });
    return annualReturnSteps.findIndex(
      (step) => step.value === closestStep.value
    );
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <View style={styles.container}>
      {/* 現在の値を表示 */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}%</Text>
      </View>

      {/* スライダー */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={annualReturnSteps.length - 1}
        step={1}
        value={currentStepIndex}
        onValueChange={(index) => {
          const stepIndex = Math.round(index);
          const newValue = annualReturnSteps[stepIndex].value;
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
