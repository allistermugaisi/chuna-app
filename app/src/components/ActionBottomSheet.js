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
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.45;
const DRAG_CLOSE_THRESHOLD = 80;

const GREEN = "#4CAF20";

// ─── Per-action sheet content configuration ───────────────────────────────────
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
        subtitle: "Pay at any KCB partnered merchant",
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
        subtitle: "Deposit cash at any KCB agent or branch",
        badge: null,
      },
      {
        icon: "⬆️",
        title: "Withdraw Cash",
        subtitle: "Withdraw at ATM or KCB agent",
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
        subtitle: "Lock savings for a fixed period at higher rates",
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
        title: "KCB M-Pesa Loan",
        subtitle: "Instant mobile loan disbursed to M-Pesa",
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
        subtitle: "Redeem your KCB loyalty points",
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

// ─── Individual option row ────────────────────────────────────────────────────
function OptionRow({ item, isLast }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.optionRow,
          !isLast && styles.optionBorder,
          { transform: [{ scale }] },
        ]}
      >
        {/* Icon bubble */}
        <View style={styles.optionIconWrap}>
          <Text style={{ fontSize: 26 }}>{item.icon}</Text>
        </View>

        {/* Text */}
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

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────────
export default function ActionBottomSheet({ visible, action, onClose }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const config = SHEET_CONFIGS[action] || SHEET_CONFIGS["send_mobile"];

  // Open / close animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_H,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, g) => g.dy > 0,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_CLOSE_THRESHOLD || g.vy > 0.8) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible && translateY._value >= SHEET_H) return null;

  return (
    <Modal
      transparent
      visible={visible || true}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Blurred / dimmed backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 16, transform: [{ translateY }] },
        ]}
      >
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>{config.title}</Text>
        </View>

        {/* Options list */}
        {/* <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {config.items.map((item, i) => (
            <OptionRow
              key={i}
              item={item}
              isLast={i === config.items.length - 1}
            />
          ))}
        </ScrollView> */}
        <FlatList
          data={config.items}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item, index }) => (
            <OptionRow item={item} isLast={index === config.items.length - 1} />
          )}
        />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: SHEET_H,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handleArea: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DEDEDE",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
    marginBottom: 6,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  backArrow: {
    fontSize: 22,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },

  // Option row
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
    backgroundColor: "#F5F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
    flexWrap: "wrap",
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
    fontWeight: "300",
  },
});
