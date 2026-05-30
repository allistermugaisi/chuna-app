import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// ─── Sample user data — replace with real data from your API/state ───────────
const USER = {
  fullName: "Allister Mugaisi Atsenga",
  initials: "AA",
  lastSeen: "Last seen at 11:41 pm | Wednesday 27",
  email: "allistermugaisi@gmail.com",
  phone: "+254 790 516 067",
  physicalAddress: "Kekky, Kekia",
  postalAddress: "Kenrb, NA, Kenai",
  kraPin: "A013699430E",
  nationalId: "38196173",
  occupation: null, // null renders as "(Occupation not available)"
};

const SUPPORT = {
  email: "chunasacco@uonbi.ac.ke",
  phones: ["+254 705 951 672"],
};

// ─── Individual row item ──────────────────────────────────────────────────────
function InfoRow({ label, value, isLast }) {
  const isEmpty = !value;
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[styles.rowValue, isEmpty && styles.rowValueEmpty]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value ?? `(${label} not available)`}
      </Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Subtle fade-up animation on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fields = [
    { label: "Email Address", value: USER.email },
    { label: "Phone Number", value: USER.phone },
    { label: "Physical Address", value: USER.physicalAddress },
    { label: "Postal Address", value: USER.postalAddress },
    { label: "KRA Pin", value: USER.kraPin },
    { label: "National ID No.", value: USER.nationalId },
    { label: "Occupation", value: USER.occupation },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Header gradient ───────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#00703C", "#2E8B57"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER.initials}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name + last seen */}
        <Text style={styles.name}>{USER.fullName}</Text>
        <Text style={styles.lastSeen}>{USER.lastSeen}</Text>
      </LinearGradient>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.body,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Info card */}
          <View style={styles.card}>
            {fields.map((f, i) => (
              <InfoRow
                key={f.label}
                label={f.label}
                value={f.value}
                isLast={i === fields.length - 1}
              />
            ))}
          </View>

          {/* Support footer */}
          <View style={styles.support}>
            <Text style={styles.supportText}>For support issues contact</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${SUPPORT.email}`)}
            >
              <Text style={styles.supportText}>
                {SUPPORT.email} <Text style={styles.supportOr}>or</Text>
              </Text>
            </TouchableOpacity>
            {SUPPORT.phones.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() =>
                  Linking.openURL(`tel:${p.replace(/[^+\d]/g, "")}`)
                }
              >
                <Text style={styles.supportPhone}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },

  // Header
  header: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backBtn: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarOuter: {
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: "rgba(200,210,230,0.30)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#C8D5E8",
    letterSpacing: 1,
  },
  addBtn: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2ABFAB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  lastSeen: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    letterSpacing: 0.1,
  },

  // Body
  body: {
    flex: 1,
    marginTop: -1, // overlap to hide gradient seam
  },
  scroll: {
    paddingTop: 28,
    paddingHorizontal: 16,
  },

  // Info card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E6",
  },
  rowLabel: {
    fontSize: 14,
    color: "#9A9AAF",
    fontWeight: "400",
    flexShrink: 0,
    minWidth: 110,
  },
  rowValue: {
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },
  rowValueEmpty: {
    color: "#ABABBC",
    fontWeight: "400",
    fontStyle: "italic",
  },

  // Support footer
  support: {
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 2,
  },
  supportText: {
    fontSize: 13,
    color: "#9A9AAF",
    textAlign: "center",
    lineHeight: 20,
  },
  supportOr: {
    fontSize: 13,
    color: "#9A9AAF",
  },
  supportPhone: {
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
});
