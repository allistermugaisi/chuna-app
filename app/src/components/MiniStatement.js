import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { fetchMiniStatement } from "../store/slices/statementSlice";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";
const CR_GREEN = "#2E7D32";
const DR_RED = "#C62828";

// ─── Icon + colour per transaction keyword ───
function resolveIcon(description = "", transType = "") {
  const d = description.toLowerCase();

  if (d.includes("deposit contribution"))
    return { icon: "arrow-down-circle", color: "#E8F5E9", iconColor: CR_GREEN };
  if (d.includes("principal repayment"))
    return { icon: "bank-transfer", color: "#EFF6FF", iconColor: "#1D4ED8" };
  if (d.includes("interest paid"))
    return { icon: "percent", color: "#F0FDF4", iconColor: "#16A34A" };
  if (d.includes("int due"))
    return { icon: "calendar-clock", color: "#FEF3C7", iconColor: "#D97706" };
  if (d.includes("dividend"))
    return { icon: "cash-multiple", color: "#F5F3FF", iconColor: "#7C3AED" };
  if (d.includes("benevolent"))
    return { icon: "shield-check", color: "#FFF7ED", iconColor: "#EA580C" };
  if (d.includes("excise"))
    return { icon: "receipt", color: "#FEE2E2", iconColor: DR_RED };
  if (d.includes("w/t") || d.includes("withholding"))
    return {
      icon: "minus-circle-outline",
      color: "#FEE2E2",
      iconColor: DR_RED,
    };
  if (d.includes("net payout"))
    return { icon: "send", color: "#EFF6FF", iconColor: "#0284C7" };
  if (d.includes("mpesa") || d.includes("m-pesa"))
    return { icon: "cellphone", color: "#DCFCE7", iconColor: GREEN };

  // Fallback by trans_type
  return transType === "CR"
    ? { icon: "arrow-bottom-left", color: "#E8F5E9", iconColor: CR_GREEN }
    : { icon: "arrow-top-right", color: "#FEE2E2", iconColor: DR_RED };
}

// ─── Clean up description for display ───
function shortDesc(description = "") {
  // Remove the member number suffix " - 13488" and similar patterns
  return description
    .replace(/\s*-\s*\d{4,}/g, "") // removes "- 13488"
    .replace(/\s*-\s*LN\w+/g, "") // removes "- LN08718"
    .trim();
}

// ─── Single transaction row ───
function TxRow({ item }) {
  const { icon, color, iconColor } = resolveIcon(
    item.description,
    item.trans_type,
  );
  const isCR = item.trans_type === "CR";

  return (
    <View style={s.row}>
      {/* Icon */}
      <View style={[s.iconWrap, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
      </View>

      {/* Description + date */}
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle} numberOfLines={1}>
          {shortDesc(item.description)}
        </Text>
        <View style={s.rowMeta}>
          <Text style={s.rowDate}>{item.transaction_date}</Text>
          <Text style={s.rowDoc} numberOfLines={1}>
            #{item.document_no}
          </Text>
        </View>
      </View>

      {/* Amount + type */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[s.rowAmount, { color: isCR ? CR_GREEN : DR_RED }]}>
          {isCR ? "+" : "-"} KES {item.amount}
        </Text>
        <View
          style={[
            s.typeBadge,
            { backgroundColor: isCR ? GREEN_LIGHT : "#FEE2E2" },
          ]}
        >
          <Text style={[s.typeTxt, { color: isCR ? CR_GREEN : DR_RED }]}>
            {isCR ? "Credit" : "Debit"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Skeleton row ────
function SkeletonRow() {
  return (
    <View style={[s.row, { opacity: 0.4 }]}>
      <View style={[s.iconWrap, { backgroundColor: "#E0E0E0" }]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            height: 12,
            width: "65%",
            backgroundColor: "#E0E0E0",
            borderRadius: 6,
          }}
        />
        <View
          style={{
            height: 10,
            width: "40%",
            backgroundColor: "#E8E8E8",
            borderRadius: 6,
          }}
        />
      </View>
      <View style={{ gap: 6, alignItems: "flex-end" }}>
        <View
          style={{
            height: 12,
            width: 72,
            backgroundColor: "#E0E0E0",
            borderRadius: 6,
          }}
        />
        <View
          style={{
            height: 16,
            width: 44,
            backgroundColor: "#E8E8E8",
            borderRadius: 8,
          }}
        />
      </View>
    </View>
  );
}

// ─── Main MiniStatement component ────
// Drop-in replacement for the static txSection block in HomeScreen.
// Props:
//   navigation  — passed from HomeScreen so "View All" can navigate
//   limit       — how many rows to show (default 5)
export default function MiniStatement({
  navigation,
  limit = 5,
  header = true,
}) {
  const dispatch = useDispatch();
  const { miniStatement, loadingMini, error } = useSelector((s) => s.statement);

  useEffect(() => {
    dispatch(fetchMiniStatement());
  }, []);

  const handleViewAll = useCallback(() => {
    navigation.navigate("MiniStatement");
  }, [navigation]);

  const handleFullViewAll = useCallback(() => {
    navigation.navigate("FullStatement");
  }, [navigation]);

  const preview = miniStatement.slice(0, limit);

  return (
    <View style={s.section}>
      {/* Header */}
      {header && (
        <View style={s.header}>
          <View style={s.headerLeft}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={18}
              color={GREEN}
            />
            <Text style={s.sectionTitle}>Mini Statement</Text>
          </View>
          <TouchableOpacity onPress={handleViewAll} style={s.viewAllBtn}>
            <Text style={s.viewAllTxt}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color={GREEN} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={s.card}>
        {loadingMini ? (
          // Skeleton
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <SkeletonRow key={i} />)
        ) : error ? (
          // Error
          <View style={s.errorWrap}>
            <Ionicons name="warning-outline" size={20} color="#C62828" />
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity
              onPress={() => dispatch(fetchMiniStatement())}
              style={s.retryBtn}
            >
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : preview.length === 0 ? (
          // Empty
          <View style={s.emptyWrap}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={36}
              color={TEXT_FAINT}
            />
            <Text style={s.emptyTxt}>No transactions found</Text>
          </View>
        ) : (
          // Rows
          preview.map((item, i) => (
            <View key={`${item.document_no}-${i}`}>
              <TxRow item={item} />
              {i < preview.length - 1 && <View style={s.divider} />}
            </View>
          ))
        )}

        {/* Footer — only when data loaded */}
        {!loadingMini && header === true && preview.length > 0 && (
          <TouchableOpacity style={s.footer} onPress={handleFullViewAll}>
            <Text style={s.footerTxt}>See full statement</Text>
            <Ionicons name="arrow-forward" size={14} color={GREEN} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginTop: 16, marginHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  viewAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewAllTxt: { color: GREEN, fontWeight: "700", fontSize: 13 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  // Row
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowDate: { fontSize: 11, color: TEXT_FAINT },
  rowDoc: { fontSize: 11, color: TEXT_FAINT },
  rowAmount: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  typeBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  typeTxt: { fontSize: 10, fontWeight: "700" },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: 66,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerTxt: { fontSize: 13, color: GREEN, fontWeight: "600" },

  // Error
  errorWrap: { alignItems: "center", paddingVertical: 28, gap: 8 },
  errorTxt: { fontSize: 13, color: "#C62828", textAlign: "center" },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Empty
  emptyWrap: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTxt: { fontSize: 13, color: TEXT_FAINT },
});
