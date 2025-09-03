import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { formatCurrency } from "../utils/calculations";

interface AssetAmountSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
}

const initialAssetSteps = [
  { value: 0, label: "0円" },
  { value: 10000, label: "1万円" },
  { value: 50000, label: "5万円" },
  { value: 100000, label: "10万円" },
  { value: 200000, label: "20万円" },
  { value: 500000, label: "50万円" },
  { value: 1000000, label: "100万円" },
  { value: 2000000, label: "200万円" },
  { value: 5000000, label: "500万円" },
  { value: 10000000, label: "1000万円" },
  { value: 20000000, label: "2000万円" },
  { value: 50000000, label: "5000万円" },
  { value: 100000000, label: "1億円" },
];

export const AssetAmountSlider: React.FC<AssetAmountSliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = initialAssetSteps.length - 1,
}) => {
  // 現在の値に最も近いステップのインデックスを取得
  const getCurrentStepIndex = () => {
    const closestStep = initialAssetSteps.reduce((prev, curr) => {
      return Math.abs(curr.value - value) < Math.abs(prev.value - value)
        ? curr
        : prev;
    });
    return initialAssetSteps.findIndex(
      (step) => step.value === closestStep.value
    );
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
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={currentStepIndex}
        onValueChange={(index) => {
          const stepIndex = Math.round(index);
          const newValue = initialAssetSteps[stepIndex].value;
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
