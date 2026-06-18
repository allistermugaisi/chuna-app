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
import {
  Entypo,
  Feather,
  AntDesign,
  FontAwesome,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_H } = Dimensions.get("window");
const DRAG_CLOSE_THRESHOLD = 60;

const GREEN = "#4CAF20";

// ─── Option row ───────────────────────────────────────────────────────────────
function OptionRow({ item, isLast, onClose }) {
  const navigation = useNavigation();

  const handleAction = () => {
    navigation.navigate(`${item.navigation}`);
    onClose();
  };
  return (
    <TouchableOpacity
      onPress={handleAction}
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
        icon: <Entypo name="arrow-bold-right" size={24} color="black" />,
        title: "Send to Mobile",
        subtitle: "Send money to Airtel Money, T-Kash & M-Pesa",
        badge: null,
        navigation: "WithdrawScreen",
      },
    ],
  },
  send_bank: {
    title: "Money Transfer",
    items: [
      {
        icon: <FontAwesome name="bank" size={24} color="black" />,
        title: "My Account",
        subtitle: "Move funds between your Chuna accounts",
        badge: null,
        navigation: "",
      },
      {
        icon: <FontAwesome name="send-o" size={24} color="black" />,
        title: "Other Accounts",
        subtitle: "Send funds to another Chuna member",
        badge: null,
        navigation: "",
      },
    ],
  },
  deposit: {
    title: "Deposit to Chuna",
    items: [
      {
        icon: <FontAwesome6 name="money-bills" size={24} color="black" />,
        title: "Deposit via Mobile Money",
        subtitle: "Fund your account securely via mobile money",
        badge: "",
        badgeColor: "#29B6D1",
        navigation: "DepositScreen",
      },
    ],
  },
  standing_order: {
    title: "Standing Orders",
    items: [
      {
        icon: <Entypo name="arrow-down" size={24} color="black" />,
        title: "Internal Standing Order",
        subtitle: "Set up recurring transfers to your own accounts",
        badge: null,
        navigation: "",
      },
      {
        icon: <Entypo name="arrow-up" size={24} color="black" />,
        title: "External Standing Order",
        subtitle: "Set up recurring transfers to other accounts",
        badge: null,
        navigation: "",
      },
    ],
  },
  save: {
    title: "Save",
    items: [
      {
        icon: "🏦",
        title: "C-Zawadi Account",
        subtitle: "Lock savings at higher rates",
        badge: "zawadi points",
        badgeColor: GREEN,
        navigation: "",
      },
    ],
  },
  loans: {
    title: "Loans",
    items: [
      {
        icon: "⚡",
        title: "Pending Approval Loans",
        subtitle: "Get quick access to loans awaiting approval",
        badge: "Instant",
        badgeColor: "#F57C00",
        navigation: "",
      },
      {
        icon: "🏠",
        title: "Running Loans",
        subtitle: "View and manage your active loans",
        badge: null,
        navigation: "",
      },
      {
        icon: "🚗",
        title: "Apply Loans",
        subtitle: "Explore and apply for new loan products",
        badge: null,
        navigation: "",
      },
    ],
  },
  invest: {
    title: "Marketplace",
    items: [
      {
        icon: <Feather name="plus" size={24} color="black" />,
        title: "Create Bid",
        subtitle: "Create a bid to sell ",
        badge: null,
        navigation: "CreateListing",
      },
      {
        icon: <FontAwesome name="line-chart" size={24} color="black" />,
        title: "Market",
        subtitle: "Browse available bids to invest in",
        badge: null,
        navigation: "Marketplace",
      },
      {
        icon: <Feather name="pie-chart" size={24} color="black" />,
        title: "My Shares",
        subtitle: "View your investment portfolio and returns",
        badge: null,
        navigation: "SellerDashboard",
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
        navigation: "",
      },
      {
        icon: "💱",
        title: "Forex Exchange",
        subtitle: "Buy and sell foreign currency",
        badge: null,
        navigation: "",
      },
      {
        icon: "🎁",
        title: "Rewards",
        subtitle: "Redeem your loyalty points",
        badge: null,
        navigation: "",
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
        navigation: "",
      },
    ],
  },
  account_balance: {
    title: "Account Balance",
    items: [
      // {
      //   icon: "👨‍👩‍👧",
      //   title: "View Next of Kin",
      //   subtitle: "See your registered next of kin details",
      //   badge: null,
      //   navigation: "",
      // },
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
        navigation: "",
      },
      {
        icon: "🎁",
        title: "Buy for Others",
        subtitle: "Send airtime to another number",
        badge: null,
        navigation: "",
      },
    ],
  },
  my_account: {
    title: "My Account",
    items: [
      {
        icon: <Feather name="user" size={24} color="black" />,
        title: "Profile",
        subtitle: "Manage your account details and settings",
        badge: null,
        navigation: "",
      },
    ],
  },
  reports: {
    title: "Reports",
    items: [
      {
        icon: (
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={24}
            color="black"
          />
        ),
        title: "Mini Statement",
        subtitle: "See your latest account activity at a glance",
        navigation: "",
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="file-document-multiple-outline"
            size={24}
            color="black"
          />
        ),
        title: "Full Statement",
        subtitle: "Download or review your complete financial history",
        navigation: "",
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="bank-transfer"
            size={24}
            color="black"
          />
        ),
        title: "Loan Statement",
        subtitle: "Monitor loan disbursements, repayments, and balances",
        navigation: "",
      },
      {
        icon: (
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={24}
            color="black"
          />
        ),
        title: "Repayment Schedule",
        subtitle: "Stay on track with your upcoming loan payments",
        navigation: "",
      },
    ],
  },
};
