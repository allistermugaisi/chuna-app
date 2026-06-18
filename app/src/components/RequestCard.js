import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr.replace(" ", "T"));
  return d.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * RequestCard
 * Renders a single buyer offer/request received by the seller.
 *
 * Expected `request` shape from GET /marketplace/received-requests:
 * {
 *   request_ref, listing_ref, buyer_name, buyer_member_no,
 *   shares_requested, offer_price, total_offer,
 *   message, status, created_at
 * }
 *
 * (Shape inferred from API pattern — update field names to match actual response)
 */
export default function RequestCard({
  request,
  onAccept,
  onDecline,
  responding,
}) {
  const {
    request_ref,
    listing_ref,
    buyer_name = "Unknown buyer",
    buyer_member_no,
    shares_requested,
    offered_price,
    asking_price,
    message,
    created_at,
  } = request;

  const isResponding = responding;

  return (
    <View style={s.card}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={s.headerRow}>
        <View style={s.buyerRow}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>
              {buyer_name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </Text>
          </View>
          <View>
            <Text style={s.buyerName}>{buyer_name}</Text>
            {buyer_member_no && (
              <Text style={s.memberNo}>Member {buyer_member_no}</Text>
            )}
          </View>
        </View>

        <View style={s.refChip}>
          <Text style={s.refTxt}>{listing_ref}</Text>
        </View>
      </View>

      {/* ── Offer details ───────────────────────────────────────────────────── */}
      <View style={s.offerBox}>
        <View style={s.offerItem}>
          <Text style={s.offerLabel}>Shares requested</Text>
          <Text style={s.offerValue}>
            {Number(shares_requested ?? 0).toLocaleString()}
          </Text>
        </View>
        <View style={s.offerDivider} />
        <View style={s.offerItem}>
          <Text style={s.offerLabel}>Offer Price</Text>
          <Text style={[s.offerValue, { color: GREEN }]}>
            KES {Number(offered_price ?? 0).toLocaleString()}
          </Text>
        </View>
        <View style={s.offerDivider} />
        <View style={s.offerItem}>
          <Text style={s.offerLabel}>Asking Price</Text>
          <Text style={s.offerValue}>
            KES {Number(asking_price ?? 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* ── Buyer message ───────────────────────────────────────────────────── */}
      {!!message && (
        <View style={s.messageBox}>
          <Ionicons name="chatbubble-outline" size={14} color={TEXT_FAINT} />
          <Text style={s.messageTxt}>{message}</Text>
        </View>
      )}

      {/* ── Timestamp ───────────────────────────────────────────────────────── */}
      <Text style={s.time}>Received {formatDate(created_at)}</Text>

      {/* ── Action buttons ──────────────────────────────────────────────────── */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.declineBtn}
          onPress={onDecline}
          disabled={isResponding}
        >
          {isResponding ? (
            <ActivityIndicator size="small" color="#C62828" />
          ) : (
            <>
              <Ionicons name="close" size={16} color="#C62828" />
              <Text style={s.declineTxt}>Decline</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.acceptBtn}
          onPress={onAccept}
          disabled={isResponding}
        >
          {isResponding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={s.acceptTxt}>Accept offer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  buyerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  buyerName: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  memberNo: { fontSize: 11, color: TEXT_FAINT, marginTop: 1 },
  refChip: {
    backgroundColor: "#F4F6F8",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  refTxt: { fontSize: 11, color: TEXT_MID, fontWeight: "600" },

  offerBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAF8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  offerItem: { flex: 1, alignItems: "center" },
  offerLabel: {
    fontSize: 10,
    color: TEXT_FAINT,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  offerValue: { fontSize: 15, fontWeight: "800", color: TEXT_DARK },
  offerDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 4 },

  messageBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#F4F6F8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  messageTxt: {
    flex: 1,
    fontSize: 13,
    color: TEXT_MID,
    lineHeight: 18,
    fontStyle: "italic",
  },

  time: { fontSize: 11, color: TEXT_FAINT, marginBottom: 14 },

  actions: { flexDirection: "row", gap: 10 },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: "#FFF5F5",
  },
  declineTxt: { fontSize: 13, color: "#C62828", fontWeight: "600" },
  acceptBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 11,
  },
  acceptTxt: { fontSize: 13, color: "#fff", fontWeight: "700" },
});
