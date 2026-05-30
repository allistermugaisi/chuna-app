import React, { useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Image,
//   Animated,
//   Dimensions,
//   Platform,
// } from "react-native";
import {
  View,
  Text,
  Image,
  FlatList,
  Platform,
  Animated,
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionBottomSheet from "../../../components/ActionBottomSheet";

const { width } = Dimensions.get("window");

// ─── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ─── Quick action button on the balance card ──────────────────────────────────
function QuickAction({ icon, label, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onPress && onPress();
  };
  return (
    <TouchableOpacity
      onPress={press}
      activeOpacity={0.85}
      style={styles.qaWrap}
    >
      <Animated.View style={[styles.qaBtn, { transform: [{ scale }] }]}>
        <Text style={styles.qaIcon}>{icon}</Text>
      </Animated.View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── "What would you like to do" shortcut icon ───────────────────────────────
function Shortcut({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.shortcutWrap}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.shortcutIcon}>
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Green service tile ───────────────────────────────────────────────────────
function ServiceTile({ label, emoji, dark, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tile, dark && styles.tileDark]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileEmoji}>{emoji}</Text>
    </TouchableOpacity>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxRow({ icon, title, subtitle, amount, status, color }) {
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: color }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle}>{title}</Text>
        <Text style={styles.txSub}>{subtitle}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.txAmount}>{amount}</Text>
        <Text
          style={[
            styles.txStatus,
            { color: status === "Successful" ? "#2E7D32" : "#C62828" },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetAction, setSheetAction] = useState(null);

  const openSheet = useCallback((action) => {
    setSheetAction(action);
    setSheetVisible(true);
  }, []);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.avatarPlaceholder}>
              {/* <Text style={styles.avatarPlaceholderIcon}>📷</Text> */}
              <FontAwesome5 name="user-circle" size={24} color="black" />
            </View>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.greetingName}>ALLISTER</Text>
            </View>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { position: "relative" }]}
            >
              <Ionicons name="notifications-outline" size={24} color="black" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={[{ id: "home" }]}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {/* ── Balance card ─────────────────────────────────────────────── */}
              <View style={styles.cardWrap}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
                  }}
                  style={styles.cardBg}
                />
                <View style={styles.cardOverlay} />
                <View style={styles.cardContent}>
                  <Text style={styles.balanceLabel}>
                    Balance ( 1259947378 )
                  </Text>

                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceAmount}>
                      KES {balanceVisible ? "30,768.01" : "••••••"}
                    </Text>

                    <TouchableOpacity
                      onPress={() => setBalanceVisible((v) => !v)}
                      style={{ marginLeft: 10 }}
                    >
                      <Text style={{ fontSize: 20, color: "#fff" }}>
                        {balanceVisible ? "👁" : "🙈"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.loanLimit}>
                    KCB Mobile Loan Limit: KES 44,800.00
                  </Text>

                  <View style={styles.quickActions}>
                    {QUICK_ACTIONS.map((qa) => (
                      <QuickAction
                        key={qa.key}
                        icon={qa.icon}
                        label={qa.label}
                        onPress={() => openSheet(qa.key)}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Promo Banner */}
              <View style={styles.promoBanner}>
                <Text style={{ fontSize: 20 }}>📣</Text>
                <Text style={styles.promoText}>
                  Protect what matters! Buy Motor, Personal Accident, or Last
                  Expense cover instantly. Tap{" "}
                  <Text style={{ fontWeight: "700" }}>'Insurance'</Text> to get
                  started.
                </Text>
              </View>

              {/* Shortcuts */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    What would you like to do today?
                  </Text>

                  <TouchableOpacity>
                    <Text style={styles.editBtn}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.shortcutsGrid}>
                  {SHORTCUTS.map((s) => (
                    <Shortcut
                      key={s.key}
                      icon={s.icon}
                      label={s.label}
                      onPress={() => openSheet(s.key)}
                    />
                  ))}
                </View>
              </View>

              {/* Services Grid */}
              <View style={styles.servicesGrid}>
                <View style={styles.promoTile}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
                    }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />

                  <View style={styles.promoTileOverlay} />

                  <Text style={styles.promoTileText}>
                    Save big on groceries with Chuna...
                  </Text>

                  <Text style={styles.promoTileArrow}>›</Text>
                </View>

                <View style={styles.tilesCol}>
                  <View style={styles.tilesRow}>
                    <ServiceTile
                      label="Save"
                      emoji="🪙"
                      onPress={() => openSheet("save")}
                    />
                    <ServiceTile
                      label="Loans"
                      emoji="💵"
                      onPress={() => openSheet("loans")}
                    />
                  </View>

                  <View style={styles.tilesRow}>
                    <ServiceTile
                      label="Invest"
                      emoji="🌱"
                      onPress={() => openSheet("invest")}
                    />
                    <ServiceTile
                      label="More"
                      emoji="🔄"
                      dark
                      onPress={() => openSheet("more")}
                    />
                  </View>
                </View>
              </View>

              {/* Transactions */}
              <View style={styles.txSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Recent Mobile Transactions
                  </Text>

                  <TouchableOpacity>
                    <Text style={styles.editBtn}>View All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.txCard}>
                  {TRANSACTIONS.map((tx, i) => (
                    <TxRow key={i} {...tx} />
                  ))}
                </View>
              </View>
            </>
          }
        />

        {/* ── Bottom navigation bar ─────────────────────────────────────────── */}
        {/* <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 6 }]}>
        {[
          { icon: "🏠", label: "Home", active: true },
          { icon: "🔁", label: "Transact", active: false },
          { icon: null, label: "Explore", active: false, fab: true },
          { icon: "👤", label: "Account", active: false },
          { icon: "🎧", label: "Help", active: false },
        ].map((tab) =>
          tab.fab ? (
            <TouchableOpacity
              key={tab.label}
              style={styles.fabTab}
              activeOpacity={0.85}
            >
              <View style={styles.fab}>
                <Text style={{ fontSize: 22 }}>🔍</Text>
              </View>
              <Text style={styles.fabLabel}>{tab.label}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={tab.label}
              style={styles.navTab}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22 }}>{tab.icon}</Text>
              <Text
                style={[styles.navLabel, tab.active && styles.navLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </View> */}

        {/* ── Action bottom sheet ───────────────────────────────────────────── */}
      </View>
      <ActionBottomSheet
        visible={sheetVisible}
        action={sheetAction}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

const QUICK_ACTIONS = [
  { icon: "↗", label: "Send to\nMobile", key: "send_mobile" },
  { icon: "⇄", label: "Send to\nBank", key: "send_bank" },
  { icon: "↑", label: "Pay", key: "pay" },
  { icon: "↓", label: "Deposit &\nWithdraw", key: "deposit" },
];

const SHORTCUTS = [
  { icon: "♾️", label: "Pay to VOOMA", key: "vooma" },
  { icon: "📱", label: "Airtime", key: "airtime" },
  { icon: "📋", label: "My Bills", key: "bills" },
  { icon: "⬛", label: "Scan QR", key: "scan_qr" },
];

const TRANSACTIONS = [
  {
    icon: "↗",
    title: "Send to M-Pesa",
    subtitle: "28 May 2026",
    amount: "- KES 1,000.00",
    status: "Successful",
    color: "#FFEBEE",
    iconColor: "#C62828",
  },
  {
    icon: "↙",
    title: "Received from KCB",
    subtitle: "27 May 2026",
    amount: "+ KES 5,500.00",
    status: "Successful",
    color: "#E8F5E9",
    iconColor: "#2E7D32",
  },
  {
    icon: "↑",
    title: "Bill Payment",
    subtitle: "26 May 2026",
    amount: "- KES 2,200.00",
    status: "Successful",
    color: "#FFF8E1",
    iconColor: "#F57F17",
  },
];

const GREEN = "#4CAF20";
const GREEN_DARK = "#388E3C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F4F6F8",
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderIcon: { fontSize: 20 },
  greetingText: { fontSize: 12, color: "#777", fontWeight: "400" },
  greetingName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 0.5,
  },
  topBarRight: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 6, position: "relative" },
  notifDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E53935",
    borderWidth: 1.5,
    borderColor: "#F4F6F8",
  },

  // Balance card
  cardWrap: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: "hidden",
    height: 240,
    marginBottom: 14,
  },
  cardBg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  cardContent: { flex: 1, padding: 18, justifyContent: "space-between" },
  balanceLabel: { color: "rgba(255,255,255,0.82)", fontSize: 13 },
  balanceRow: { flexDirection: "row", alignItems: "center" },
  balanceAmount: { fontSize: 30, fontWeight: "800", color: "#fff" },
  loanLimit: { color: "rgba(255,255,255,0.78)", fontSize: 13 },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  qaWrap: { alignItems: "center", flex: 1 },
  qaBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  qaIcon: { fontSize: 22, color: "#fff", fontWeight: "700" },
  qaLabel: {
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 14,
  },

  // Promo banner
  promoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  promoText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 19 },

  // Section
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  editBtn: { color: GREEN, fontWeight: "700", fontSize: 14 },

  // Shortcuts
  shortcutsGrid: { flexDirection: "row", justifyContent: "space-between" },
  shortcutWrap: { alignItems: "center", flex: 1 },
  shortcutIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  shortcutLabel: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },

  // Services grid
  servicesGrid: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 14,
    height: 200,
  },
  promoTile: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 12,
  },
  promoTileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  promoTileText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    zIndex: 1,
    lineHeight: 18,
  },
  promoTileArrow: { color: "#fff", fontSize: 22, zIndex: 1, marginTop: 4 },
  tilesCol: { flex: 1, gap: 10 },
  tilesRow: { flex: 1, flexDirection: "row", gap: 10 },
  tile: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 14,
    padding: 12,
    justifyContent: "space-between",
  },
  tileDark: { backgroundColor: GREEN_DARK },
  tileLabel: { color: "#fff", fontWeight: "700", fontSize: 13 },
  tileEmoji: { fontSize: 26, alignSelf: "flex-end" },

  // Transactions
  txSection: { marginHorizontal: 16 },
  txCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  txSub: { fontSize: 12, color: "#999", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  txStatus: { fontSize: 12, fontWeight: "500", marginTop: 2 },

  // Bottom nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  navTab: { flex: 1, alignItems: "center", gap: 3 },
  navLabel: { fontSize: 11, color: "#999", fontWeight: "500" },
  navLabelActive: { color: GREEN, fontWeight: "700" },
  fabTab: { flex: 1, alignItems: "center", marginTop: -28 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 4,
    borderWidth: 3,
    borderColor: "#fff",
  },
  fabLabel: { fontSize: 11, color: "#999", fontWeight: "500" },
});
