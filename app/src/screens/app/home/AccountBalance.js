import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { fetchAccountBalances } from "../../../store/slices/balanceSlice";

const { width: W } = Dimensions.get("window");

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ─── Per bal_code config ───────────────────────────────────────────────────────
const BAL_CONFIG = {
  SHA: {
    icon: "certificate",
    color: "#7C3AED",
    bg: "#F5F3FF",
    label: "Share Capital",
  },
  DEP: {
    icon: "piggy-bank",
    color: "#0284C7",
    bg: "#EFF6FF",
    label: "Deposit Contribution",
  },
  RSK: {
    icon: "shield-account",
    color: "#D97706",
    bg: "#FFF7ED",
    label: "Benevolent Fund",
  },
  ORD: {
    icon: "bank-outline",
    color: GREEN,
    bg: GREEN_LIGHT,
    label: "Ordinary Savings",
  },
};
const DEFAULT_CFG = {
  icon: "wallet-outline",
  color: GREEN,
  bg: GREEN_LIGHT,
  label: "Account",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseBal(str = "0") {
  return parseFloat(str.replace(/,/g, "")) || 0;
}

function fmtBal(n) {
  return n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function totalOf(accounts = []) {
  return accounts.reduce((acc, a) => acc + parseBal(a.balances), 0);
}

// ─── Animated number that counts up on mount ──────────────────────────────────
function CountUp({ value, visible, style }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState("0.00");

  useEffect(() => {
    if (!visible) {
      setDisplay("••••••");
      return;
    }
    animVal.setValue(0);
    const listener = animVal.addListener(({ value: v }) => {
      setDisplay(fmtBal(v));
    });
    Animated.timing(animVal, {
      toValue: value,
      duration: 900,
      useNativeDriver: false,
    }).start();
    return () => animVal.removeListener(listener);
  }, [value, visible]);

  return <Text style={style}>{visible ? display : "••••••••"}</Text>;
}

// ─── Source badge ──────────────────────────────────────────────────────────────
function SourceBadge({ source }) {
  const isFosa = source === "FOSA";
  return (
    <View
      style={[sb.wrap, { backgroundColor: isFosa ? "#EFF6FF" : "#F5F3FF" }]}
    >
      <Text style={[sb.txt, { color: isFosa ? "#0284C7" : "#7C3AED" }]}>
        {source}
      </Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  txt: { fontSize: 10, fontWeight: "800" },
});

// ─── Single balance row card ───────────────────────────────────────────────────
function BalanceRow({ item, visible, index }) {
  const cfg = BAL_CONFIG[item.bal_code] ?? DEFAULT_CFG;
  const slideIn = useRef(new Animated.Value(30)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(slideIn, {
        toValue: 0,
        friction: 8,
        tension: 60,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[br.card, { opacity: fade, transform: [{ translateY: slideIn }] }]}
    >
      {/* Icon */}
      <View style={[br.iconWrap, { backgroundColor: cfg.bg }]}>
        <MaterialCommunityIcons name={cfg.icon} size={22} color={cfg.color} />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={br.nameRow}>
          <Text style={br.name} numberOfLines={1}>
            {item.account_name}
          </Text>
          <SourceBadge source={item.source} />
        </View>
        {item.account_no && <Text style={br.accountNo}>{item.account_no}</Text>}
        {item.account_status && (
          <View style={br.statusRow}>
            <View
              style={[
                br.statusDot,
                {
                  backgroundColor:
                    item.account_status?.toLowerCase() === "active"
                      ? GREEN
                      : "#E53935",
                },
              ]}
            />
            <Text style={br.statusTxt}>{item.account_status}</Text>
          </View>
        )}
      </View>

      {/* Balance */}
      <View style={{ alignItems: "flex-end" }}>
        <Text style={br.balLabel}>Balance</Text>
        <Text style={[br.bal, { color: cfg.color }]}>
          {visible ? `KES ${item.balances}` : "••••••"}
        </Text>
      </View>
    </Animated.View>
  );
}
const br = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
    flexWrap: "wrap",
  },
  name: { fontSize: 13, fontWeight: "700", color: TEXT_DARK, flexShrink: 1 },
  accountNo: { fontSize: 11, color: TEXT_FAINT, marginBottom: 3 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 11, color: TEXT_FAINT },
  balLabel: {
    fontSize: 10,
    color: TEXT_FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  bal: { fontSize: 14, fontWeight: "800" },
});

// ─── Section header with total ─────────────────────────────────────────────────
function SectionHeader({ title, total, icon, color, visible }) {
  return (
    <View style={sh.wrap}>
      <View style={[sh.iconWrap, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sh.title}>{title}</Text>
        <Text style={[sh.total, { color }]}>
          {visible ? `Total: KES ${fmtBal(total)}` : "Total: ••••••"}
        </Text>
      </View>
    </View>
  );
}
const sh = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    marginTop: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "800", color: TEXT_DARK },
  total: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});

// ─── Summary hero card ────────────────────────────────────────────────────────
function HeroCard({ member, allBalances, visible, onToggle }) {
  const grandTotal = totalOf(allBalances);

  return (
    <View style={hc.card}>
      {/* Member info */}
      <View style={hc.topRow}>
        <View style={hc.avatar}>
          <Text style={hc.avatarTxt}>
            {(member?.name ?? "?")
              .trim()
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={hc.name} numberOfLines={1}>
            {member?.name ?? "—"}
          </Text>
          <Text style={hc.meta}>
            Member {member?.member_no} · {member?.mobile_no}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={22}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>
      </View>

      {/* Grand total */}
      <View style={hc.totalSection}>
        <Text style={hc.totalLabel}>Total portfolio value</Text>
        <CountUp value={grandTotal} visible={visible} style={hc.totalAmt} />
        <Text style={hc.totalCurrency}>Kenyan Shillings</Text>
      </View>

      {/* Mini breakdown */}
      <View style={hc.breakdown}>
        <View style={hc.breakItem}>
          <View style={[hc.breakDot, { backgroundColor: "#7C3AED" }]} />
          <Text style={hc.breakLbl}>BOSA</Text>
        </View>
        <View style={hc.breakItem}>
          <View style={[hc.breakDot, { backgroundColor: GREEN }]} />
          <Text style={hc.breakLbl}>FOSA</Text>
        </View>
        <Text style={hc.breakCount}>{allBalances.length} accounts</Text>
      </View>
    </View>
  );
}
const hc = StyleSheet.create({
  card: {
    backgroundColor: GREEN_DARK,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
  name: { fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 3 },
  meta: { fontSize: 11, color: "rgba(255,255,255,0.65)" },
  totalSection: { marginBottom: 20 },
  totalLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  totalAmt: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  totalCurrency: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 },
  breakdown: { flexDirection: "row", alignItems: "center", gap: 14 },
  breakItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  breakDot: { width: 8, height: 8, borderRadius: 4 },
  breakLbl: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  breakCount: {
    marginLeft: "auto",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[sk.card, { opacity: anim }]}>
      <View style={sk.icon} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={sk.line} />
        <View style={[sk.line, { width: "50%" }]} />
      </View>
      <View style={sk.bal} />
    </Animated.View>
  );
}
const sk = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  icon: { width: 46, height: 46, borderRadius: 13, backgroundColor: "#D0D0D0" },
  line: {
    height: 12,
    width: "70%",
    backgroundColor: "#D0D0D0",
    borderRadius: 6,
  },
  bal: { width: 72, height: 20, backgroundColor: "#D0D0D0", borderRadius: 6 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AccountBalancesScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { member, allBalances, bosaBalances, fosaBalances, loading, error } =
    useSelector((s) => s.balance);

  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "bosa" | "fosa"

  useEffect(() => {
    dispatch(fetchAccountBalances());
  }, []);

  const onRefresh = useCallback(
    () => dispatch(fetchAccountBalances()),
    [dispatch],
  );

  // ── Tab data ──────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "all", label: "All", count: allBalances.length },
    { key: "bosa", label: "BOSA", count: bosaBalances.length },
    { key: "fosa", label: "FOSA", count: fosaBalances.length },
  ];

  const displayList =
    activeTab === "all"
      ? allBalances
      : activeTab === "bosa"
        ? bosaBalances
        : fosaBalances;

  const bosaTotal = totalOf(bosaBalances);
  const fosaTotal = totalOf(fosaBalances);

  return (
    <View style={[s.container]}>
      {/* Nav */}
      <View style={s.navBar}>
        <Text style={s.navTitle}>Account Balances</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <Feather name="refresh-cw" size={17} color={TEXT_DARK} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={GREEN}
          />
        }
      >
        {/* ── Hero card ──────────────────────────────────────────────────────── */}
        {loading && !member ? (
          <View
            style={[hc.card, { backgroundColor: "#E0E0E0", height: 200 }]}
          />
        ) : (
          <HeroCard
            member={member}
            allBalances={allBalances}
            visible={visible}
            onToggle={() => setVisible((v) => !v)}
          />
        )}

        {/* ── BOSA + FOSA summary strip ────────────────────────────────────── */}
        {!loading && allBalances.length > 0 && (
          <View style={s.stripRow}>
            <View style={[s.strip, { borderLeftColor: "#7C3AED" }]}>
              <Text style={s.stripLabel}>BOSA total</Text>
              <Text style={[s.stripAmt, { color: "#7C3AED" }]}>
                {visible ? `KES ${fmtBal(bosaTotal)}` : "••••••"}
              </Text>
            </View>
            <View style={[s.strip, { borderLeftColor: GREEN }]}>
              <Text style={s.stripLabel}>FOSA total</Text>
              <Text style={[s.stripAmt, { color: GREEN }]}>
                {visible ? `KES ${fmtBal(fosaTotal)}` : "••••••"}
              </Text>
            </View>
          </View>
        )}

        {/* ── Tab bar ──────────────────────────────────────────────────────── */}
        <View style={s.tabBar}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.tab, activeTab === t.key && s.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[s.tabTxt, activeTab === t.key && s.tabTxtActive]}>
                {t.label}
              </Text>
              <View
                style={[s.tabBadge, activeTab === t.key && s.tabBadgeActive]}
              >
                <Text
                  style={[
                    s.tabBadgeTxt,
                    activeTab === t.key && { color: GREEN },
                  ]}
                >
                  {t.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {!!error && (
          <View style={s.errorCard}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color="#C62828"
            />
            <Text style={s.errorTxt}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={onRefresh}>
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Loading skeletons ─────────────────────────────────────────────── */}
        {loading &&
          !allBalances.length &&
          [0, 1, 2, 3].map((i) => <Skeleton key={i} />)}

        {/* ── Sectioned list ───────────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {/* BOSA section — only on "all" tab */}
            {activeTab === "all" && bosaBalances.length > 0 && (
              <>
                <SectionHeader
                  title="BOSA Accounts"
                  icon="safe"
                  color="#7C3AED"
                  total={bosaTotal}
                  visible={visible}
                />
                {bosaBalances.map((item, i) => (
                  <BalanceRow
                    key={item.bal_code ?? i}
                    item={item}
                    visible={visible}
                    index={i}
                  />
                ))}
              </>
            )}

            {/* FOSA section — only on "all" tab */}
            {activeTab === "all" && fosaBalances.length > 0 && (
              <>
                <SectionHeader
                  title="FOSA Accounts"
                  icon="bank-outline"
                  color={GREEN}
                  total={fosaTotal}
                  visible={visible}
                />
                {fosaBalances.map((item, i) => (
                  <BalanceRow
                    key={item.account_no ?? item.bal_code ?? i}
                    item={item}
                    visible={visible}
                    index={bosaBalances.length + i}
                  />
                ))}
              </>
            )}

            {/* Filtered single tab */}
            {activeTab !== "all" &&
              displayList.map((item, i) => (
                <BalanceRow
                  key={item.account_no ?? item.bal_code ?? i}
                  item={item}
                  visible={visible}
                  index={i}
                />
              ))}

            {/* Empty state */}
            {displayList.length === 0 && (
              <View style={s.emptyWrap}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={48}
                  color={TEXT_FAINT}
                />
                <Text style={s.emptyTitle}>No accounts found</Text>
                <Text style={s.emptySub}>Pull down to refresh</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: TEXT_DARK },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  // BOSA / FOSA summary strip
  stripRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  strip: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  stripLabel: {
    fontSize: 11,
    color: TEXT_FAINT,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  stripAmt: { fontSize: 14, fontWeight: "800" },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabActive: { backgroundColor: GREEN_LIGHT },
  tabTxt: { fontSize: 13, fontWeight: "600", color: TEXT_FAINT },
  tabTxtActive: { color: GREEN },
  tabBadge: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabBadgeActive: { backgroundColor: GREEN_LIGHT },
  tabBadgeTxt: { fontSize: 11, fontWeight: "700", color: TEXT_FAINT },

  // Error
  errorCard: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 14,
  },
  errorTxt: { fontSize: 13, color: "#C62828", textAlign: "center" },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Empty
  emptyWrap: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  emptySub: { fontSize: 13, color: TEXT_FAINT },
});
