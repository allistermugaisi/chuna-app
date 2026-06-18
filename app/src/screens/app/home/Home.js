import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Animated,
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Entypo,
  Feather,
  Ionicons,
  AntDesign,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { getValueFor } from "../../../utils/secureStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionBottomSheet from "../../../components/ActionBottomSheet";
import { Toast } from "../../../components/Toast";

const { width } = Dimensions.get("window");
const GREEN = "#4CAF20";
const GREEN_DARK = "#388E3C";

// ─── Helpers ───
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ─── Quick action button ───
function QuickAction({ icon, label, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
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
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
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

// ─── Shortcut icon ───
function Shortcut({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.shortcutWrap}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.shortcutIcon}>
        <Text style={{ fontSize: 30 }}>{icon}</Text>
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Service tile ───
function ServiceTile({ label, icon, emoji, dark, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tile, dark && styles.tileDark]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <Text style={styles.tileLabel}>{label}</Text>

      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color="#fff"
          style={styles.tileIcon}
        />
      ) : (
        <Text style={styles.tileEmoji}>{emoji}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Transaction row ───
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

// ─── Static data (outside component — no re-creation on render) ───
const QUICK_ACTIONS = [
  {
    icon: <FontAwesome name="send-o" size={24} color="white" />,
    label: "Withdraw",
    key: "send_mobile",
  },
  {
    icon: <Entypo name="arrow-down" size={24} color="white" />,
    label: "Deposit",
    key: "deposit",
  },
  {
    icon: <FontAwesome6 name="money-bill-transfer" size={24} color="white" />,
    label: "Money Transfer",
    key: "send_bank",
  },
  {
    icon: <FontAwesome6 name="money-bill-1-wave" size={24} color="white" />,
    label: "Standing Order",
    key: "standing_order",
  },
];

const SHORTCUTS = [
  {
    icon: <Feather name="user" size={30} color="black" />,
    label: "My Account",
    key: "bills",
  },
  {
    icon: <Entypo name="open-book" size={30} color="black" />,
    label: "Reports",
    key: "scan_qr",
  },
  {
    icon: <MaterialIcons name="my-library-books" size={30} color="black" />,
    label: "Next of Kin",
    key: "next_of_kin",
  },
];

const TRANSACTIONS = [
  {
    icon: "↗",
    title: "Send to M-Pesa",
    subtitle: "28 May 2026",
    amount: "- KES 1,000.00",
    status: "Successful",
    color: "#FFEBEE",
  },
  {
    icon: "↙",
    title: "Received from Chuna",
    subtitle: "27 May 2026",
    amount: "+ KES 5,500.00",
    status: "Successful",
    color: "#E8F5E9",
  },
  {
    icon: "↑",
    title: "Bill Payment",
    subtitle: "26 May 2026",
    amount: "- KES 2,200.00",
    status: "Successful",
    color: "#FFF8E1",
  },
];

// ─── Home screen ───
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(true);

  // ── Bottom sheet state ───
  // Keep action in a ref so updating it doesn't re-render the FlatList
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetAction, setSheetAction] = useState("send_mobile");

  useEffect(() => {
    (async () => {
      const data = await getValueFor("user");

      if (data) {
        const user = JSON.parse(data);
        // console.log("Current USER:", user);
        Toast.show({
          type: "success",
          title: "Login Successful",
          message: `Welcome back to Chuna Sacco`,
        });
      }
    })();
  }, []);

  const openSheet = useCallback((action) => {
    setSheetAction(action);
    // Use a short timeout so the press animation completes before the
    // Modal mounts — this eliminates the JS-thread spike that caused freezing
    setTimeout(() => setSheetVisible(true), 50);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // ── FlatList header (memoised so it doesn't rebuild on sheet state changes) ──
  // We pass only balanceVisible into the header so only balance toggles cause
  // a re-render of the header content.
  const renderHeader = useCallback(
    () => (
      <>
        {/* Balance card */}
        <View style={styles.cardWrap}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            }}
            style={styles.cardBg}
          />
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>
            <Text style={styles.balanceLabel}>Balance ( 1149967128 )</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmount}>
                KES {balanceVisible ? "30,768.01" : "•••••••••••"}
              </Text>
              <TouchableOpacity
                onPress={() => setBalanceVisible((v) => !v)}
                style={{ marginLeft: 10 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ fontSize: 20, color: "#fff" }}>
                  {balanceVisible ? (
                    <AntDesign name="eye" size={24} color="white" />
                  ) : (
                    <AntDesign name="eye-invisible" size={24} color="white" />
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.loanLimit}>
              Mobile Loan Limit: KES 44,800.00
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

        {/* Promo banner */}
        <View style={styles.promoBanner}>
          <MaterialIcons name="campaign" size={24} color="black" />
          <Text style={styles.promoText}>
            From savings to loans, insurance to digital banking, we provide the
            tools you need to thrive financially across Kenya.
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

        {/* Services grid */}
        <View style={styles.servicesGrid}>
          <View style={styles.promoTile}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dqnkqwhqh/image/upload/v1772783049/slider/dcuxfos8xec5qokkw5xs.jpg",
              }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.promoTileOverlay} />
            <Text style={styles.promoTileText}>Chuna Sacco Society LTD</Text>
          </View>

          <View style={styles.tilesCol}>
            <View style={styles.tilesRow}>
              <ServiceTile
                label="Loans"
                icon="cash-check"
                onPress={() => openSheet("loans")}
              />
              <ServiceTile
                label="C-Zawadi"
                icon="gift"
                onPress={() => openSheet("save")}
              />
            </View>
            <View style={styles.tilesRow}>
              <ServiceTile
                label="Marketplace"
                icon="shopping"
                onPress={() => openSheet("invest")}
              />
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.txSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mini Statement</Text>
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
    ),
    [balanceVisible, openSheet],
  );

  return (
    // React.Fragment keeps the Modal outside every View that has
    // PanResponder or touch handlers — prevents gesture conflicts
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="default" />

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.avatarPlaceholder}>
              <FontAwesome5 name="user-circle" size={24} color="#555" />
            </View>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.greetingName}>ALLISTER</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color="black" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable content */}
        <FlatList
          data={[]} // empty — all content is in the header
          keyExtractor={() => ""}
          renderItem={null}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          // These two props stop FlatList swallowing the Modal's backdrop tap
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        />
      </View>

      {/*
        ↑ Sheet lives OUTSIDE the FlatList's View entirely.
        This is the key fix — no shared responder tree with the list.
      */}
      <ActionBottomSheet
        visible={sheetVisible}
        action={sheetAction}
        onClose={closeSheet}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },

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
  greetingText: { fontSize: 12, color: "#777" },
  greetingName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 0.5,
  },
  topBarRight: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 6 },
  notifDot: {
    position: "absolute",
    top: 5,
    right: 5,
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
  balanceAmount: { fontSize: 20, fontWeight: "800", color: "#fff" },
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

  // Promo
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  promoText: { flex: 1, fontSize: 13, color: "#444", lineHeight: 19 },

  // Section
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  editBtn: { color: GREEN, fontWeight: "700", fontSize: 14 },

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

  // Services
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
  tileLabel: { color: "#fff", fontWeight: "700", fontSize: 12 },
  tileEmoji: { fontSize: 26, alignSelf: "flex-end" },

  // Transactions
  txSection: { marginTop: 16, marginHorizontal: 16 },
  txCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
});
