import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { fetchAccountBalances } from "../store/slices/balanceSlice";

const { width: W } = Dimensions.get("window");
const GREEN = "#4CAF20";
const GREEN_DARK = "#388E3C";
const GREEN_LIGHT = "#E8F5E9";
const TEXT_FAINT = "#999999";

// ─── Config for each bal_code ──────────────────────────────────────────────────
const BAL_CONFIG = {
  SHA: { icon: "certificate", color: "#7C3AED", label: "Share Capital" },
  DEP: { icon: "piggy-bank", color: "#0284C7", label: "Deposit Contribution" },
  RSK: { icon: "shield-account", color: "#D97706", label: "Benevolent Fund" },
  ORD: { icon: "bank-outline", color: GREEN, label: "Ordinary Savings" },
};

const DEFAULT_CONFIG = {
  icon: "wallet-outline",
  color: GREEN,
  label: "Account",
};

// ─── Card backgrounds — one image per card type ────────────────────────────────
// const CARD_BG = {
//   FOSA: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
//   BOSA: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
// };
const CARD_BG = {
  FOSA: require("../../assets/fosa-bg.jpg"),
  BOSA: require("../../assets/bosa-bg.jpg"),
};

// ─── Overlay colours give each card a distinct tint ───────────────────────────
const CARD_OVERLAY = {
  FOSA: "rgba(15, 60, 30, 0.72)",
  BOSA: "rgba(10, 40, 70, 0.72)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(balStr) {
  return `KES ${balStr}`;
}

function totalBosa(bosaBalances) {
  const sum = bosaBalances.reduce((acc, b) => {
    const n = parseFloat((b.balances ?? "0").replace(/,/g, ""));
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
  return sum.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Single BOSA sub-row inside the card ──────────────────────────────────────
function BosaRow({ item, visible }) {
  const cfg = BAL_CONFIG[item.bal_code] ?? DEFAULT_CONFIG;
  return (
    <View style={s.bosaRow}>
      <View style={[s.bosaIconWrap, { backgroundColor: cfg.color + "30" }]}>
        <MaterialCommunityIcons name={cfg.icon} size={14} color="#fff" />
      </View>
      <Text style={s.bosaLabel} numberOfLines={1}>
        {item.account_name}
      </Text>
      <Text style={s.bosaBalance}>
        {visible ? fmt(item.balances) : "••••••"}
      </Text>
    </View>
  );
}

// ─── FOSA card ────────────────────────────────────────────────────────────────
function FosaCard({
  accounts,
  visible,
  onToggle,
  quickActions,
  onAction,
  memberNo,
}) {
  const fosa = accounts[0]; // typically one FOSA account
  if (!fosa) return null;

  return (
    <View style={s.card}>
      <Image source={CARD_BG.FOSA} style={s.cardBg} />
      <View style={[s.cardOverlay, { backgroundColor: CARD_OVERLAY.FOSA }]} />
      <View style={s.cardContent}>
        {/* Top row */}
        <View style={s.cardTopRow}>
          <View>
            <Text style={s.sourceTag}>ORD</Text>
            <Text style={s.memberLabel}>{fosa.account_no ?? memberNo}</Text>
          </View>
          <View style={s.statusChip}>
            <View
              style={[
                s.statusDot,
                {
                  backgroundColor:
                    fosa.account_status?.toLowerCase() === "active"
                      ? "#4ade80"
                      : "#f87171",
                },
              ]}
            />
            <Text style={s.statusTxt}>{fosa.account_status ?? "Active"}</Text>
          </View>
        </View>

        {/* Balance */}
        <View style={s.balRow}>
          <View>
            <Text style={s.balLabel}>Available balance</Text>
            <Text style={s.balAmount}>
              {visible ? fmt(fosa.balances) : "••••••••••••"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onToggle}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AntDesign
              name={visible ? "eye" : "eye-invisible"}
              size={22}
              color="rgba(255,255,255,0.85)"
            />
          </TouchableOpacity>
        </View>

        {/* Account name */}
        <Text style={s.accountName}>{fosa.account_name}</Text>

        {/* Quick actions */}
        <View style={s.qaRow}>
          {quickActions.map((qa) => (
            <TouchableOpacity
              key={qa.key}
              style={s.qaBtn}
              onPress={() => onAction(qa.key)}
              activeOpacity={0.8}
            >
              <View style={s.qaIconWrap}>{qa.icon}</View>
              <Text style={s.qaLabel}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── BOSA card ────────────────────────────────────────────────────────────────
function BosaCard({ accounts, visible, onToggle, memberNo }) {
  return (
    <View style={s.card}>
      <Image source={CARD_BG.BOSA} style={s.cardBg} />
      <View style={[s.cardOverlay, { backgroundColor: CARD_OVERLAY.BOSA }]} />
      <View style={s.cardContent}>
        {/* Top row */}
        <View style={s.cardTopRow}>
          <View>
            <Text style={s.sourceTag}>BOSA</Text>
            <Text style={s.memberLabel}>Member {memberNo}</Text>
          </View>
          <TouchableOpacity
            onPress={onToggle}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AntDesign
              name={visible ? "eye" : "eye-invisible"}
              size={22}
              color="rgba(255,255,255,0.85)"
            />
          </TouchableOpacity>
        </View>

        {/* Total */}
        <View style={{ marginBottom: 14 }}>
          <Text style={s.balLabel}>Total BOSA balance</Text>
          <Text style={s.balAmount}>
            {visible ? `KES ${totalBosa(accounts)}` : "••••••••••••"}
          </Text>
        </View>

        {/* Sub-accounts */}
        <View style={s.bosaList}>
          {accounts.map((item, i) => (
            <BosaRow key={item.bal_code ?? i} item={item} visible={visible} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Dot pagination indicator ──────────────────────────────────────────────────
function Dots({ count, active }) {
  return (
    <View style={s.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[s.dot, i === active && s.dotActive]} />
      ))}
    </View>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[s.card, s.skeleton, { opacity }]}>
      <View style={s.skeletonTop} />
      <View style={s.skeletonMid} />
      <View style={s.skeletonBot} />
    </Animated.View>
  );
}

// ─── Main BalanceCard ─────────────────────────────────────────────────────────
export default function BalanceCard({ quickActions = [], onAction }) {
  const dispatch = useDispatch();
  const { member, bosaBalances, fosaBalances, loading, error } = useSelector(
    (state) => state.balance,
  );

  const [visible, setVisible] = useState(true);
  const [activeCard, setActiveCard] = useState(0);
  const flatRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAccountBalances());
  }, []);

  const onScroll = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (W - 32));
    setActiveCard(idx);
  }, []);

  // Build card array: FOSA first (it has the quick actions), then BOSA
  const cards = [
    fosaBalances.length > 0 && (
      <FosaCard
        key="fosa"
        accounts={fosaBalances}
        visible={visible}
        onToggle={() => setVisible((v) => !v)}
        quickActions={quickActions}
        onAction={onAction}
        memberNo={member?.member_no}
      />
    ),
    bosaBalances.length > 0 && (
      <BosaCard
        key="bosa"
        accounts={bosaBalances}
        visible={visible}
        onToggle={() => setVisible((v) => !v)}
        memberNo={member?.member_no}
      />
    ),
  ].filter(Boolean);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.wrapper}>
        <SkeletonCard />
        <Dots count={2} active={0} />
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={[s.card, s.errorCard]}>
        <Ionicons name="warning-outline" size={24} color="#C62828" />
        <Text style={s.errorTxt}>{error}</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => dispatch(fetchAccountBalances())}
        >
          <Text style={s.retryTxt}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cards.length === 0) return null;

  return (
    <View style={s.wrapper}>
      {/* Member greeting */}
      {member?.name && (
        <Text style={s.memberGreeting} numberOfLines={1}>
          {member.name.trim().split(" ")[0]}'s accounts
        </Text>
      )}

      {/* Swipeable cards */}
      <FlatList
        ref={flatRef}
        data={cards}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <View style={{ width: W - 32 }}>{item}</View>}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={W - 32}
        snapToAlignment="start"
      />

      {/* Pagination dots */}
      {cards.length > 1 && <Dots count={cards.length} active={activeCard} />}

      {/* Swipe hint on first render */}
      {cards.length > 1 && activeCard === 0 && (
        <View style={s.swipeHint}>
          <Ionicons
            name="swap-horizontal-outline"
            size={13}
            color={TEXT_FAINT}
          />
          <Text style={s.swipeHintTxt}>Swipe to see BOSA accounts</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 14 },
  memberGreeting: {
    fontSize: 12,
    color: TEXT_FAINT,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 2,
  },

  // Card shell
  card: { borderRadius: 18, overflow: "hidden", height: 240, marginBottom: 10 },
  cardBg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  cardOverlay: { ...StyleSheet.absoluteFillObject },
  cardContent: { flex: 1, padding: 18, justifyContent: "space-between" },

  // Card top
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sourceTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  memberLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },

  // Status chip
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 11, color: "#fff", fontWeight: "600" },

  // Balance
  balRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  balAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  accountName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    fontStyle: "italic",
    marginTop: -6,
  },

  // Quick actions
  qaRow: { flexDirection: "row", justifyContent: "space-between" },
  qaBtn: { alignItems: "center", flex: 1 },
  qaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  qaLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
  },

  // BOSA sub-rows
  bosaList: { gap: 6 },
  bosaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bosaIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bosaLabel: {
    flex: 1,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  bosaBalance: { fontSize: 12, color: "#fff", fontWeight: "700" },

  // Dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dotActive: { width: 18, backgroundColor: GREEN },

  // Swipe hint
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  swipeHintTxt: { fontSize: 11, color: TEXT_FAINT },

  // Skeleton
  skeleton: {
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  skeletonTop: {
    height: 16,
    width: "50%",
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  skeletonMid: {
    height: 28,
    width: "70%",
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  skeletonBot: {
    height: 12,
    width: "40%",
    borderRadius: 8,
    backgroundColor: "#ccc",
  },

  // Error
  errorCard: {
    height: 120,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorTxt: { fontSize: 13, color: "#C62828", textAlign: "center" },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
