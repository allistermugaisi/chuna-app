import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ── Map API status → display style ─────────────────────────────────────────────
const STATUS_MAP = {
  active: { label: "Active", bg: "#E8F5E9", color: GREEN, dot: GREEN },
  pending: {
    label: "Pending",
    bg: "#FEF3C7",
    color: "#92400E",
    dot: "#F59E0B",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#FEE2E2",
    color: "#991B1B",
    dot: "#E53935",
  },
  completed: {
    label: "Completed",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    dot: "#2196F3",
  },
  expired: {
    label: "Expired",
    bg: "#F3F4F6",
    color: "#6B7280",
    dot: "#9CA3AF",
  },
};

function StatusPill({ status }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.active;
  return (
    <View style={[pill.wrap, { backgroundColor: cfg.bg }]}>
      <View style={[pill.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[pill.txt, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { fontSize: 11, fontWeight: "700" },
});

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt.replace(" ", "T")) - new Date();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
}

export default function ListingCard({
  listing,
  onPress,
  onCancel,
  cancelling,
}) {
  const {
    listing_ref,
    shares_offered,
    asking_price,
    total_value,
    description,
    status,
    expires_at,
    created_at,
    total_requests,
  } = listing;

  const timeLeft = daysLeft(expires_at);
  const isActive = status === "active";
  const isCancelled = status === "cancelled";

  return (
    <TouchableOpacity
      style={[s.card, isCancelled && s.cardDimmed]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <View style={s.headerRow}>
        <View style={s.refWrap}>
          <MaterialCommunityIcons
            name="certificate-outline"
            size={14}
            color={TEXT_FAINT}
          />
          <Text style={s.ref}>{listing_ref}</Text>
        </View>
        <StatusPill status={status} />
      </View>

      {/* ── Share summary ───────────────────────────────────────────────────── */}
      <View style={s.summaryRow}>
        <View style={s.summaryItem}>
          <Text style={s.summaryLabel}>Shares offered</Text>
          <Text style={s.summaryValue}>
            {Number(shares_offered).toLocaleString()}
          </Text>
        </View>

        <View style={s.summaryDivider} />

        <View style={s.summaryItem}>
          <Text style={s.summaryLabel}>Price / share</Text>
          <Text style={[s.summaryValue, { color: GREEN }]}>
            KES {Number(asking_price).toLocaleString()}
          </Text>
        </View>

        <View style={s.summaryDivider} />

        <View style={s.summaryItem}>
          <Text style={s.summaryLabel}>Total value</Text>
          <Text style={s.summaryValue}>
            KES {Number(total_value).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* ── Description ─────────────────────────────────────────────────────── */}
      {!!description && (
        <Text style={s.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* ── Footer meta ─────────────────────────────────────────────────────── */}
      <View style={s.footerRow}>
        <View style={s.metaChip}>
          <Ionicons name="people-outline" size={13} color={TEXT_FAINT} />
          <Text style={s.metaTxt}>
            {total_requests} {total_requests === 1 ? "offer" : "offers"}
          </Text>
        </View>

        <View style={s.metaChip}>
          <Ionicons name="calendar-outline" size={13} color={TEXT_FAINT} />
          <Text style={s.metaTxt}>Listed {formatDate(created_at)}</Text>
        </View>

        {timeLeft && isActive && (
          <View style={[s.metaChip, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="time-outline" size={13} color="#92400E" />
            <Text style={[s.metaTxt, { color: "#92400E" }]}>{timeLeft}</Text>
          </View>
        )}
      </View>

      {/* ── Cancel button (active only) ──────────────────────────────────────── */}
      {isActive && (
        <TouchableOpacity
          style={s.cancelBtn}
          onPress={onCancel}
          disabled={cancelling}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color="#C62828" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={16} color="#C62828" />
              <Text style={s.cancelTxt}>Cancel listing</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  cardDimmed: { opacity: 0.6 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  refWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  ref: { fontSize: 13, fontWeight: "700", color: TEXT_MID, letterSpacing: 0.3 },

  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAF8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: {
    fontSize: 10,
    color: TEXT_FAINT,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryValue: { fontSize: 15, fontWeight: "800", color: TEXT_DARK },
  summaryDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 4 },

  description: {
    fontSize: 13,
    color: TEXT_MID,
    lineHeight: 19,
    marginBottom: 12,
  },

  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  metaTxt: { fontSize: 11, color: TEXT_FAINT, fontWeight: "500" },

  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: "#FFF5F5",
  },
  cancelTxt: { fontSize: 13, color: "#C62828", fontWeight: "600" },
});
