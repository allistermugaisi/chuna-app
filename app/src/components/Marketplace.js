import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {
  GREEN,
  GREEN_LIGHT,
  TEXT_DARK,
  TEXT_MID,
  TEXT_FAINT,
  BORDER,
  STATUS,
} from "../data/marketplaceData";

// ─── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.OPEN;
  return (
    <View style={[badge.wrap, { backgroundColor: s.bg }]}>
      <View style={[badge.dot, { backgroundColor: s.color }]} />
      <Text style={[badge.label, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: "700" },
});

// ─── Avatar initials ───────────────────────────────────────────────────────────
export function Avatar({ initials, size = 36, bgColor = GREEN }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.35 }}>
        {initials}
      </Text>
    </View>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={sh.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const sh = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  action: { fontSize: 13, fontWeight: "700", color: GREEN },
});

// ─── Bid Card (for browse list) ────────────────────────────────────────────────
export function BidCard({ bid, onPress }) {
  const timeLeft = getTimeLeft(bid.endsAt);

  return (
    <TouchableOpacity style={card.wrap} activeOpacity={0.85} onPress={onPress}>
      {/* Thumbnail */}
      <Image source={{ uri: bid.images[0] }} style={card.image} />

      {/* Status badge overlay */}
      <View style={card.badgeOverlay}>
        <StatusBadge status={bid.status} />
      </View>

      {/* Body */}
      <View style={card.body}>
        <Text style={card.title} numberOfLines={2}>
          {bid.title}
        </Text>

        <View style={card.priceRow}>
          <View>
            <Text style={card.priceLabel}>Current bid</Text>
            <Text style={card.price}>
              KES {bid.currentBid > 0 ? bid.currentBid.toLocaleString() : "—"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={card.priceLabel}>Asking price</Text>
            <Text style={card.asking}>
              KES {bid.askingPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={card.footer}>
          <View style={card.footerChip}>
            <Text style={card.footerText}>🏷 {bid.bidCount} bids</Text>
          </View>
          <View style={card.footerChip}>
            <Text style={card.footerText}>📍 {bid.location.split(",")[0]}</Text>
          </View>
          <View style={[card.footerChip, { backgroundColor: "#FEF3C7" }]}>
            <Text style={[card.footerText, { color: "#92400E" }]}>
              ⏱ {timeLeft}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  image: { width: "100%", height: 170, resizeMode: "cover" },
  badgeOverlay: { position: "absolute", top: 10, left: 10 },
  body: { padding: 14 },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceLabel: { fontSize: 11, color: TEXT_FAINT, marginBottom: 2 },
  price: { fontSize: 17, fontWeight: "800", color: GREEN },
  asking: { fontSize: 13, fontWeight: "600", color: TEXT_MID },
  footer: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  footerChip: {
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  footerText: { fontSize: 11, color: TEXT_MID, fontWeight: "500" },
});

// ─── My listing card ────────────────────────────────────────────────────────────
export function MyBidCard({ bid, onPress, onManage }) {
  const timeLeft = getTimeLeft(bid.endsAt);

  return (
    <TouchableOpacity style={myc.wrap} activeOpacity={0.88} onPress={onPress}>
      <Image source={{ uri: bid.images[0] }} style={myc.image} />
      <View style={myc.body}>
        <View style={myc.topRow}>
          <Text style={myc.title} numberOfLines={1}>
            {bid.title}
          </Text>
          <StatusBadge status={bid.status} />
        </View>

        <View style={myc.statRow}>
          <View style={myc.stat}>
            <Text style={myc.statLabel}>Current bid</Text>
            <Text style={myc.statVal}>
              {bid.currentBid > 0
                ? `KES ${bid.currentBid.toLocaleString()}`
                : "No bids yet"}
            </Text>
          </View>
          <View style={myc.stat}>
            <Text style={myc.statLabel}>Bids received</Text>
            <Text style={myc.statVal}>{bid.bidCount}</Text>
          </View>
          <View style={myc.stat}>
            <Text style={myc.statLabel}>Ends in</Text>
            <Text style={[myc.statVal, { color: "#F59E0B" }]}>{timeLeft}</Text>
          </View>
        </View>

        <TouchableOpacity style={myc.manageBtn} onPress={onManage}>
          <Text style={myc.manageTxt}>Manage listing</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const myc = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  image: { width: "100%", height: 130, resizeMode: "cover" },
  body: { padding: 14 },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  title: { fontSize: 14, fontWeight: "700", color: TEXT_DARK, flex: 1 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#F4F6F8",
    borderRadius: 10,
    padding: 10,
  },
  stat: { alignItems: "center", flex: 1 },
  statLabel: { fontSize: 10, color: TEXT_FAINT, marginBottom: 3 },
  statVal: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
  manageBtn: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  manageTxt: { color: GREEN, fontWeight: "700", fontSize: 13 },
});

// ─── Share stat card ───────────────────────────────────────────────────────────
export function ShareStatCard({ label, value, sub, accent }) {
  return (
    <View
      style={[
        ssc.wrap,
        accent && { borderLeftWidth: 3, borderLeftColor: GREEN },
      ]}
    >
      <Text style={ssc.label}>{label}</Text>
      <Text style={ssc.value}>{value}</Text>
      {sub && <Text style={ssc.sub}>{sub}</Text>}
    </View>
  );
}

const ssc = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flex: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  label: { fontSize: 11, color: TEXT_FAINT, marginBottom: 6 },
  value: { fontSize: 18, fontWeight: "800", color: TEXT_DARK },
  sub: { fontSize: 11, color: TEXT_MID, marginTop: 3 },
});

// ─── Time helper ───────────────────────────────────────────────────────────────
export function getTimeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}
