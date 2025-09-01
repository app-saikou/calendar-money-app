import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "#333",
  style,
}) => {
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

// アイコンカラーパレット
export const ICON_COLORS = {
  primary: "#2196F3", // メインアクション（青）
  success: "#4CAF50", // 成功・収入（緑）
  warning: "#FF9800", // 警告（オレンジ）
  danger: "#F44336", // 削除・支出（赤）
  neutral: "#757575", // 中性的なアイコン（グレー）
  secondary: "#9E9E9E", // サブアクション（薄いグレー）
} as const;

// アイコンサイズ
export const ICON_SIZES = {
  small: 16, // 小さなアイコン
  medium: 20, // 標準サイズ
  large: 24, // 大きなアイコン
  xlarge: 32, // 特大アイコン
} as const;

// よく使うアイコンの定数
export const ICONS = {
  // 資産・お金関連
  MONEY: "wallet" as const,
  STOCK: "trending-up" as const,
  CASH: "cash" as const,
  INVESTMENT: "analytics" as const,

  // 収支関連
  INCOME: "trending-up" as const,
  EXPENSE: "trending-down" as const,
  TRANSACTION: "add-circle" as const,
  BUDGET: "calculator" as const,

  // 設定・管理
  SETTINGS: "settings" as const,
  USER: "person" as const,
  TARGET: "flag" as const,
  NOTIFICATION: "notifications" as const,
  THEME: "color-palette" as const,
  DATA: "document-text" as const,
  LOGOUT: "log-out" as const,

  // アクション
  EDIT: "create" as const,
  DELETE: "trash" as const,
  SAVE: "save" as const,
  ADD: "add" as const,
  CLOSE: "close" as const,

  // その他
  HOME: "home" as const,
  CHART: "bar-chart" as const,
  SUMMARY: "list" as const,
  HELP: "help-circle" as const,
  CALENDAR: "calendar" as const,
} as const;

// 絵文字からアイコンへのマッピング
export const EMOJI_TO_ICON_MAP = {
  "💰": { name: ICONS.MONEY, color: ICON_COLORS.success },
  "📈": { name: ICONS.INCOME, color: ICON_COLORS.success },
  "📉": { name: ICONS.EXPENSE, color: ICON_COLORS.danger },
  "💵": { name: ICONS.CASH, color: ICON_COLORS.success },
  "📊": { name: ICONS.INVESTMENT, color: ICON_COLORS.primary },
  "📋": { name: ICONS.SUMMARY, color: ICON_COLORS.neutral },
  "➕": { name: ICONS.ADD, color: ICON_COLORS.primary },
  "✏️": { name: ICONS.EDIT, color: ICON_COLORS.primary },
  "🗑️": { name: ICONS.DELETE, color: ICON_COLORS.danger },
  "✅": { name: ICONS.SAVE, color: ICON_COLORS.success },
  "❌": { name: ICONS.CLOSE, color: ICON_COLORS.danger },
  "🎯": { name: ICONS.TARGET, color: ICON_COLORS.warning },
  "📅": { name: ICONS.CALENDAR, color: ICON_COLORS.neutral },
  "⚙️": { name: ICONS.SETTINGS, color: ICON_COLORS.neutral },
} as const;

// 絵文字をアイコンに変換するヘルパー関数
export const EmojiIcon: React.FC<{
  emoji: keyof typeof EMOJI_TO_ICON_MAP;
  size?: number;
  style?: any;
}> = ({ emoji, size = ICON_SIZES.medium, style }) => {
  const iconConfig = EMOJI_TO_ICON_MAP[emoji];
  if (!iconConfig) {
    console.warn(`Unknown emoji: ${emoji}`);
    return null;
  }

  return (
    <Icon
      name={iconConfig.name}
      size={size}
      color={iconConfig.color}
      style={style}
    />
  );
};
