import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

interface AssetCalculationLoadingProps {
  visible: boolean;
}

export const AssetCalculationLoading: React.FC<
  AssetCalculationLoadingProps
> = ({ visible }) => {
  console.log("AssetCalculationLoading: visible =", visible);
  console.log("AssetCalculationLoading: visible type =", typeof visible);

  if (!visible) {
    console.log("AssetCalculationLoading: returning null (not visible)");
    return null;
  }

  console.log("AssetCalculationLoading: rendering loading component");

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.title}>資産推移予測を計算中</Text>
        <Text style={styles.message}>
          あなたが100歳になるまでの資産推移を計算しています
        </Text>
        <Text style={styles.time}>約8秒で完了します</Text>
        <Text style={styles.warning}>
          ⚠️ 計算中はアプリを閉じないでください
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    minWidth: 280,
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 15,
  },
  warning: {
    fontSize: 12,
    color: "#FF6B6B",
    textAlign: "center",
    fontWeight: "600",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
});
