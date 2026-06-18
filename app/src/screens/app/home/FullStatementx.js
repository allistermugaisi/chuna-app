import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  fetchFullStatement,
  clearStatementError,
} from "../../../store/slices/statementSlice";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";
const CR_GREEN = "#2E7D32";
const DR_RED = "#C62828";

// ─── Date helpers ───
function toISO(dateStr = "") {
  // "30 Apr 2026" → "2026-04-30"
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${months[parts[1]] ?? "01"}-${parts[0].padStart(2, "0")}`;
}

function monthLabel(dateStr = "") {
  // "30 Apr 2026" → "April 2026"
  try {
    const iso = toISO(dateStr);
    return new Date(iso).toLocaleDateString("en-KE", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 6);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

// ─── Group stm_list into SectionList sections by month ────────────────────────
function groupByMonth(transactions = []) {
  const map = new Map();
  const list = Array.isArray(transactions) ? transactions : []; // ← add this
  list.forEach((tx) => {
    // ← use list
    const key = monthLabel(tx.transaction_date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(tx);
  });
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

// ─── Icon resolver (same logic as MiniStatement) ─────────────────────────────
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
  if (d.includes("w/t"))
    return {
      icon: "minus-circle-outline",
      color: "#FEE2E2",
      iconColor: DR_RED,
    };
  if (d.includes("net payout"))
    return { icon: "send", color: "#EFF6FF", iconColor: "#0284C7" };
  if (d.includes("mpesa"))
    return { icon: "cellphone", color: "#DCFCE7", iconColor: GREEN };
  return transType === "CR"
    ? { icon: "arrow-bottom-left", color: "#E8F5E9", iconColor: CR_GREEN }
    : { icon: "arrow-top-right", color: "#FEE2E2", iconColor: DR_RED };
}

function shortDesc(description = "") {
  return description
    .replace(/\s*-\s*\d{4,}/g, "")
    .replace(/\s*-\s*LN\w+/g, "")
    .trim();
}

// ─── Date range pill ──────────────────────────────────────────────────────────
function DatePill({ label, value, onPress }) {
  return (
    <TouchableOpacity style={dp.wrap} onPress={onPress} activeOpacity={0.8}>
      <Feather name="calendar" size={13} color={GREEN} />
      <View>
        <Text style={dp.label}>{label}</Text>
        <Text style={dp.value}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={13} color={TEXT_FAINT} />
    </TouchableOpacity>
  );
}
const dp = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: TEXT_FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
});

// ─── Summary strip ────────────────────────────────────────────────────────────
function SummaryStrip({ transactions }) {
  let credits = 0,
    debits = 0;
  const list = Array.isArray(transactions) ? transactions : []; // ← add this
  list.forEach((tx) => {
    // ← use list
    const n = parseFloat((tx.amount ?? "0").replace(/,/g, ""));
    if (tx.trans_type === "CR") credits += n;
    else debits += n;
  });
  const fmt = (n) =>
    `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <View style={ss.wrap}>
      <View style={ss.item}>
        <View style={[ss.dot, { backgroundColor: CR_GREEN }]} />
        <View>
          <Text style={ss.label}>Total credits</Text>
          <Text style={[ss.value, { color: CR_GREEN }]}>{fmt(credits)}</Text>
        </View>
      </View>
      <View style={ss.divider} />
      <View style={ss.item}>
        <View style={[ss.dot, { backgroundColor: DR_RED }]} />
        <View>
          <Text style={ss.label}>Total debits</Text>
          <Text style={[ss.value, { color: DR_RED }]}>{fmt(debits)}</Text>
        </View>
      </View>
      <View style={ss.divider} />
      <View style={ss.item}>
        <View style={[ss.dot, { backgroundColor: TEXT_FAINT }]} />
        <View>
          <Text style={ss.label}>Transactions</Text>
          <Text style={ss.value}>{transactions?.length}</Text>
        </View>
      </View>
    </View>
  );
}
const ss = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  item: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  label: { fontSize: 10, color: TEXT_FAINT, marginBottom: 3 },
  value: { fontSize: 12, fontWeight: "700", color: TEXT_DARK },
  divider: { width: 1, backgroundColor: BORDER, marginHorizontal: 4 },
});

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxRow({ item }) {
  const { icon, color, iconColor } = resolveIcon(
    item.description,
    item.trans_type,
  );
  const isCR = item.trans_type === "CR";
  return (
    <View style={r.row}>
      <View style={[r.iconWrap, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={17} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={r.title} numberOfLines={1}>
          {shortDesc(item.description)}
        </Text>
        <View style={r.meta}>
          <Text style={r.date}>{item.transaction_date}</Text>
          <Text style={r.doc}>#{item.document_no}</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[r.amount, { color: isCR ? CR_GREEN : DR_RED }]}>
          {isCR ? "+" : "−"} {item.amount}
        </Text>
        <View
          style={[r.badge, { backgroundColor: isCR ? GREEN_LIGHT : "#FEE2E2" }]}
        >
          <Text style={[r.badgeTxt, { color: isCR ? CR_GREEN : DR_RED }]}>
            {isCR ? "CR" : "DR"}
          </Text>
        </View>
      </View>
    </View>
  );
}
const r = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#fff",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginBottom: 3 },
  meta: { flexDirection: "row", gap: 8 },
  date: { fontSize: 11, color: TEXT_FAINT },
  doc: { fontSize: 11, color: TEXT_FAINT },
  amount: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  badge: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 10, fontWeight: "800" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function FullStatementScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { fullStatement, loadingFull, error } = useSelector((s) => s.statement);

  const range = defaultDateRange();
  const [dateFrom, setDateFrom] = useState(range.from);
  const [dateTo, setDateTo] = useState(range.to);

  const load = useCallback(() => {
    dispatch(fetchFullStatement({ date_from: dateFrom, date_to: dateTo }));
  }, [dispatch, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, []);

  const sections = groupByMonth(fullStatement);

  return (
    <View style={[fs.container]}>
      {/* Date filter row */}
      <View style={fs.filterRow}>
        <DatePill
          label="From"
          value={dateFrom}
          onPress={() => {
            /* DatePicker hook-in */
          }}
        />
        <Ionicons name="arrow-forward" size={16} color={TEXT_FAINT} />
        <DatePill
          label="To"
          value={dateTo}
          onPress={() => {
            /* DatePicker hook-in */
          }}
        />
        <TouchableOpacity style={fs.applyBtn} onPress={load}>
          <Text style={fs.applyTxt}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      {!loadingFull && fullStatement.length > 0 && (
        <SummaryStrip transactions={fullStatement} />
      )}

      {/* Loading */}
      {loadingFull && (
        <View style={fs.centerWrap}>
          <ActivityIndicator color={GREEN} size="large" />
          <Text style={fs.loadingTxt}>Loading statement…</Text>
        </View>
      )}

      {/* Error */}
      {!loadingFull && !!error && (
        <View style={fs.centerWrap}>
          <Ionicons name="warning-outline" size={32} color="#C62828" />
          <Text style={fs.errorTxt}>{error}</Text>
          <TouchableOpacity style={fs.retryBtn} onPress={load}>
            <Text style={fs.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty */}
      {!loadingFull && !error && sections.length === 0 && (
        <View style={fs.centerWrap}>
          <MaterialCommunityIcons
            name="file-search-outline"
            size={48}
            color={TEXT_FAINT}
          />
          <Text style={fs.emptyTitle}>No transactions found</Text>
          <Text style={fs.emptySub}>Try adjusting the date range</Text>
        </View>
      )}

      {/* Grouped list */}
      {!loadingFull && sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item, idx) => `${item.document_no}-${idx}`}
          renderItem={({ item, index, section }) => (
            <>
              <TxRow item={item} />
              {index < section.data.length - 1 && (
                <View style={fs.rowDivider} />
              )}
            </>
          )}
          renderSectionHeader={({ section }) => (
            <View style={fs.sectionHeader}>
              <Text style={fs.sectionTitle}>{section.title}</Text>
              <Text style={fs.sectionCount}>
                {section?.data?.length} transactions
              </Text>
            </View>
          )}
          renderSectionFooter={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          stickySectionHeadersEnabled
        />
      )}
    </View>
  );
}

const fs = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  applyBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  applyTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
  sectionCount: { fontSize: 11, color: TEXT_FAINT },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: 66,
  },

  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingTxt: { fontSize: 14, color: TEXT_FAINT, marginTop: 8 },
  errorTxt: {
    fontSize: 14,
    color: DR_RED,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  emptySub: { fontSize: 13, color: TEXT_FAINT },
});
