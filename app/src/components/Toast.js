import React, {
  useRef,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  Animated,
  Platform,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");

// ─── Brand colors ─────────────────────────────────────────────────────────────
const C = {
  primary: "#E8614A",
  secondary: "#1E4A58",
  mint: "#7ECBA0",
  pink: "#E87BB0",
  white: "#FFFFFF",
  dark: "#1A1A2E",
};

// ─── Toast type config ────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  success: {
    icon: "checkmark-circle",
    iconColor: "#fff",
    bg: ["#7ECBA0", "#3DAA82"], // mint green
    accent: "#3DAA82",
    label: "Success",
  },
  error: {
    icon: "alert-circle",
    iconColor: "#fff",
    bg: ["#E8614A", "#C0255A"], // coral → rose
    accent: "#C0255A",
    label: "Error",
  },
  warning: {
    icon: "warning",
    iconColor: "#fff",
    bg: ["#F0907A", "#E8614A"], // peach → coral
    accent: "#E8614A",
    label: "Warning",
  },
  info: {
    icon: "information-circle",
    iconColor: "#fff",
    bg: ["#1E4A58", "#2A6070"], // dark teal
    accent: "#2A6070",
    label: "Info",
  },
};

// ─── Singleton ref (for imperative usage without context) ───
let _toastRef = null;

export const Toast = {
  show: (options) => _toastRef?.show(options),
  hide: () => _toastRef?.hide(),
};

// ─── ToastProvider — place once at app root, above everything ───
//
// Usage in App.js:
//   import { ToastProvider } from "./components/Toast";
//   export default function App() {
//     return (
//       <SafeAreaProvider>
//         <NavigationContainer>
//           <RootNavigator />
//         </NavigationContainer>
//         <ToastProvider />   {/* ← must be LAST so it renders on top */}
//       </SafeAreaProvider>
//     );
//   }
//
// Then anywhere in your app:
//   import { Toast } from "./components/Toast";
//   Toast.show({ type: "success", title: "Verified!", message: "Welcome back 🎉" });
//   Toast.show({ type: "error",   title: "Oops!",     message: "Wrong OTP code."  });
//   Toast.hide();
// ─────────────────────────────────────────────────────────────────────────────

export function ToastProvider() {
  return (
    <ToastContainer
      ref={(ref) => {
        _toastRef = ref;
      }}
    />
  );
}

// ─── Internal container (manages queue + animation) ───────────────────────────
const ToastContainer = forwardRef((_, ref) => {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const progress = useRef(new Animated.Value(1)).current;

  const stateRef = useRef({
    visible: false,
    type: "success",
    title: "",
    message: "",
    duration: 3500,
  });

  const [, forceRender] = React.useReducer((x) => x + 1, 0);
  const timerRef = useRef(null);

  // ── Show ──
  const show = useCallback(
    ({ type = "success", title = "", message = "", duration = 3500 }) => {
      // Clear any existing timer
      clearTimeout(timerRef.current);

      // If already visible, snap out then back in
      if (stateRef.current.visible) {
        Animated.timing(translateY, {
          toValue: -120,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          stateRef.current = { visible: true, type, title, message, duration };
          forceRender();
          animateIn(duration);
        });
      } else {
        stateRef.current = { visible: true, type, title, message, duration };
        forceRender();
        animateIn(duration);
      }
    },
    [],
  );

  // ── Hide ──
  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    animateOut();
  }, []);

  useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

  const animateIn = (duration) => {
    progress.setValue(1);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar drains over duration
    Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => animateOut(), duration);
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.88,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      stateRef.current = { ...stateRef.current, visible: false };
      forceRender();
    });
  };

  const { type, title, message } = stateRef.current;
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.success;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.outerWrap,
        {
          top: insets.top + 12,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      {/* Card */}
      <View style={styles.card}>
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: config.accent }]} />

        {/* Icon bubble */}
        <View style={[styles.iconBubble, { backgroundColor: config.accent }]}>
          <Ionicons name={config.icon} size={22} color={config.iconColor} />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          {title ? (
            <Text style={styles.toastTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {message ? (
            <Text style={styles.toastMessage} numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </View>

        {/* Close button */}
        <TouchableOpacity
          onPress={hide}
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="#AAAAAA" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: config.accent,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </Animated.View>
  );
});

// ─── Styles ───
const styles = StyleSheet.create({
  outerWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingRight: 14,
    gap: 12,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
    marginLeft: 0,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textWrap: { flex: 1, gap: 2 },
  toastTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    lineHeight: 20,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: "400",
    color: "#666680",
    lineHeight: 18,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5F5F8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  progressBar: {
    height: 3,
    backgroundColor: "#E8614A",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});
