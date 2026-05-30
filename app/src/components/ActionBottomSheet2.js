import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const DRAG_CLOSE_THRESHOLD = 60;

const GREEN = "#4CAF20";

// ─── Option row ───────────────────────────────────────────────────────────────
function OptionRow({ item, isLast, onClose }) {
  return (
    <TouchableOpacity
      onPress={onClose}
      activeOpacity={0.65}
      style={[styles.optionRow, !isLast && styles.optionBorder]}
    >
      <View style={styles.optionIconWrap}>
        <Text style={{ fontSize: 26 }}>{item.icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{item.title}</Text>
          {item.badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: item.badgeColor || GREEN },
              ]}
            >
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.optionSub}>{item.subtitle}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
export default function ActionBottomSheet({ visible, action, onClose }) {
  const insets = useSafeAreaInsets();

  // Animated values — created once, never recreated
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Track drag offset separately so we don't fight Animated
  const dragY = useRef(0);
  const sheetHeight = useRef(0);

  const config = SHEET_CONFIGS[action] ?? SHEET_CONFIGS["send_mobile"];

  // ── Open / close driver ────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      // Reset drag offset whenever sheet opens
      dragY.current = 0;

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 10,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 230,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_H,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ── Dismiss helper ─────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  // ── Drag-to-dismiss on the handle ONLY ────────────────────────────────────
  // We keep PanResponder on just the 40-px handle strip so it never
  // intercepts taps on the option rows below.
  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture if it starts moving downward
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        dragY.current = 0;
      },
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          dragY.current = g.dy;
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_CLOSE_THRESHOLD || g.vy > 0.9) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 70,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
      // Key fix: hardwareAccelerated prevents JS-thread jank on Android
      hardwareAccelerated
    >
      {/* Backdrop — tapping it closes the sheet */}
      <TouchableWithoutFeedback onPress={dismiss}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet container — useNativeDriver keeps animation off JS thread */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 12 },
          { transform: [{ translateY }] },
        ]}
        onLayout={(e) => {
          sheetHeight.current = e.nativeEvent.layout.height;
        }}
      >
        {/* ── Drag handle strip (only this area has PanResponder) ── */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* ── Header ── */}
        <View style={styles.sheetHeader}>
          <TouchableOpacity
            onPress={dismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <AntDesign name="close" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>{config.title}</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* ── Options — plain ScrollView, no PanResponder conflict ── */}
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.optionsList}
          // Prevent the ScrollView from stealing the drag gesture when
          // the user pulls down from the top of the list
          scrollEnabled={config.items.length > 4}
        >
          {config.items.map((item, i) => (
            <OptionRow
              key={`${action}-${i}`}
              item={item}
              isLast={i === config.items.length - 1}
              onClose={dismiss}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 24,
  },

  // Handle
  handleArea: {
    paddingTop: 14,
    paddingBottom: 6,
    alignItems: "center",
    // Give a generous hit area so drag starts easily
    paddingHorizontal: 80,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DCDCE0",
  },

  // Header
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  backArrow: {
    fontSize: 22,
    color: "#1A1A1A",
    width: 32,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.1,
  },

  // Options
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 14,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  optionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 3,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  optionSub: {
    fontSize: 13,
    color: "#9A9AAF",
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    color: "#CCCCCC",
  },
});

// ─── Per-action sheet content ─────────────────────────────────────────────────
const SHEET_CONFIGS = {
  send_mobile: {
    title: "Send to Mobile",
    items: [
      {
        icon: "📲",
        title: "Send to Mobile",
        subtitle: "Send money to Airtel Money, T-Kash & M-Pesa",
        badge: null,
      },
      {
        icon: "♾️",
        title: "Vooma",
        subtitle: "Send money to a VOOMA account",
        badge: "Free Transfer",
        badgeColor: "#29B6D1",
      },
    ],
  },
  send_bank: {
    title: "Send to Bank",
    items: [
      {
        icon: "🏦",
        title: "Send to KCB Account",
        subtitle: "Transfer within KCB instantly",
        badge: null,
      },
      {
        icon: "🔀",
        title: "Send to Other Bank",
        subtitle: "Transfer via RTGS or EFT",
        badge: null,
      },
      {
        icon: "🌍",
        title: "International Transfer",
        subtitle: "Send money abroad via SWIFT",
        badge: null,
      },
    ],
  },
  pay: {
    title: "Pay",
    items: [
      {
        icon: "🧾",
        title: "Pay Bill",
        subtitle: "KPLC, Nairobi Water, DSTV & more",
        badge: null,
      },
      {
        icon: "🛒",
        title: "Pay to Merchant",
        subtitle: "Pay at any partnered merchant",
        badge: null,
      },
      {
        icon: "⬛",
        title: "Scan & Pay (QR)",
        subtitle: "Scan a QR code to pay instantly",
        badge: "Fast",
        badgeColor: GREEN,
      },
    ],
  },
  deposit: {
    title: "Deposit & Withdraw",
    items: [
      {
        icon: "⬇️",
        title: "Deposit Cash",
        subtitle: "Deposit at any agent or branch",
        badge: null,
      },
      {
        icon: "⬆️",
        title: "Withdraw Cash",
        subtitle: "Withdraw at ATM or agent",
        badge: null,
      },
    ],
  },
  save: {
    title: "Save",
    items: [
      {
        icon: "🏦",
        title: "Fixed Deposit",
        subtitle: "Lock savings at higher rates",
        badge: "Up to 12% p.a.",
        badgeColor: GREEN,
      },
      {
        icon: "🪙",
        title: "Goal Savings",
        subtitle: "Save towards a specific goal",
        badge: null,
      },
      {
        icon: "📅",
        title: "Chama / Group Saving",
        subtitle: "Save together as a group",
        badge: null,
      },
    ],
  },
  loans: {
    title: "Loans",
    items: [
      {
        icon: "⚡",
        title: "Mobile Loan",
        subtitle: "Instant loan disbursed to M-Pesa",
        badge: "Instant",
        badgeColor: "#F57C00",
      },
      {
        icon: "🏠",
        title: "Mortgage",
        subtitle: "Finance your dream home",
        badge: null,
      },
      {
        icon: "🚗",
        title: "Asset Finance",
        subtitle: "Finance vehicles and equipment",
        badge: null,
      },
    ],
  },
  invest: {
    title: "Invest",
    items: [
      {
        icon: "📈",
        title: "Unit Trust Funds",
        subtitle: "Invest in money market & equity funds",
        badge: null,
      },
      {
        icon: "🏛️",
        title: "Government Bonds",
        subtitle: "Buy treasury bills and bonds",
        badge: null,
      },
    ],
  },
  more: {
    title: "More Services",
    items: [
      {
        icon: "🛡️",
        title: "Insurance",
        subtitle: "Motor, personal accident & more",
        badge: null,
      },
      {
        icon: "💱",
        title: "Forex Exchange",
        subtitle: "Buy and sell foreign currency",
        badge: null,
      },
      {
        icon: "🎁",
        title: "Rewards",
        subtitle: "Redeem your loyalty points",
        badge: null,
      },
    ],
  },
  vooma: {
    title: "Pay to VOOMA",
    items: [
      {
        icon: "♾️",
        title: "VOOMA Wallet",
        subtitle: "Send money to a VOOMA wallet",
        badge: "Free Transfer",
        badgeColor: "#29B6D1",
      },
    ],
  },
  airtime: {
    title: "Buy Airtime",
    items: [
      {
        icon: "📱",
        title: "Buy for Myself",
        subtitle: "Top up your own line instantly",
        badge: null,
      },
      {
        icon: "🎁",
        title: "Buy for Others",
        subtitle: "Send airtime to another number",
        badge: null,
      },
    ],
  },
  bills: {
    title: "My Bills",
    items: [
      {
        icon: "⚡",
        title: "Electricity (KPLC)",
        subtitle: "Pay your electricity bill",
        badge: null,
      },
      {
        icon: "💧",
        title: "Water",
        subtitle: "Nairobi Water & other counties",
        badge: null,
      },
      {
        icon: "📡",
        title: "TV / Internet",
        subtitle: "DSTV, Zuku, Safaricom Home",
        badge: null,
      },
    ],
  },
  scan_qr: {
    title: "Scan QR",
    items: [
      {
        icon: "📷",
        title: "Scan to Pay",
        subtitle: "Scan a merchant QR code to pay",
        badge: null,
      },
      {
        icon: "⬛",
        title: "My QR Code",
        subtitle: "Show your QR code to receive money",
        badge: null,
      },
    ],
  },
};
