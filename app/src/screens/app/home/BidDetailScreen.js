import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import {
  GREEN,
  GREEN_DARK,
  GREEN_LIGHT,
  BG,
  TEXT_DARK,
  TEXT_MID,
  TEXT_FAINT,
  BORDER,
  GOLD,
} from "../../../data/marketplaceData";
import {
  StatusBadge,
  Avatar,
  getTimeLeft,
} from "../../../components/Marketplace";

const { width } = Dimensions.get("window");

// ─── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesome
          key={i}
          name={
            i <= Math.floor(rating)
              ? "star"
              : i - rating < 1
                ? "star-half-o"
                : "star-o"
          }
          size={11}
          color={GOLD}
        />
      ))}
      <Text style={{ fontSize: 11, color: TEXT_MID, marginLeft: 3 }}>
        {rating}
      </Text>
    </View>
  );
}

// ─── Bid confirmation modal ────────────────────────────────────────────────────
function BidModal({ visible, bid, bidAmount, onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />
          <Text style={modal.title}>Confirm your bid</Text>

          <View style={modal.summaryCard}>
            <Text style={modal.summaryItem}>
              <Text style={modal.summaryKey}>Listing </Text>
              {bid?.title}
            </Text>
            <View style={modal.divider} />
            <Text style={modal.summaryItem}>
              <Text style={modal.summaryKey}>Your bid </Text>
              <Text style={{ color: GREEN, fontWeight: "800" }}>
                KES {Number(bidAmount).toLocaleString()}
              </Text>
            </Text>
            <View style={modal.divider} />
            <Text style={modal.summaryItem}>
              <Text style={modal.summaryKey}>Current best </Text>
              KES {bid?.currentBid?.toLocaleString() ?? "—"}
            </Text>
          </View>

          <View style={modal.note}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={GREEN}
            />
            <Text style={modal.noteTxt}>
              Your bid is binding. If accepted by the seller, a notification
              will be sent to you.
            </Text>
          </View>

          <TouchableOpacity style={modal.confirmBtn} onPress={onConfirm}>
            <Text style={modal.confirmTxt}>Place bid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modal.cancelBtn} onPress={onCancel}>
            <Text style={modal.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 18,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  summaryItem: { fontSize: 14, color: TEXT_DARK, lineHeight: 20 },
  summaryKey: { color: TEXT_FAINT, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#E8E8E8", marginVertical: 10 },
  note: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    alignItems: "flex-start",
  },
  noteTxt: { flex: 1, fontSize: 12, color: "#2E7D32", lineHeight: 17 },
  confirmBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelTxt: { color: TEXT_MID, fontSize: 14, fontWeight: "600" },
});

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function BidDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bid = route.params?.bid;
  const timeLeft = getTimeLeft(bid?.endsAt ?? "");

  const [bidAmount, setBidAmount] = useState(
    String((bid?.currentBid ?? 0) + (bid?.minBidIncrement ?? 1000)),
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const minBid = (bid?.currentBid ?? 0) + (bid?.minBidIncrement ?? 1000);

  function handlePlaceBid() {
    const amt = parseInt(bidAmount.replace(/,/g, ""));
    if (isNaN(amt) || amt < minBid) {
      Alert.alert(
        "Invalid amount",
        `Minimum bid is KES ${minBid.toLocaleString()}`,
        [{ text: "OK" }],
      );
      return;
    }
    setModalVisible(true);
  }

  function confirmBid() {
    setModalVisible(false);
    setBidPlaced(true);
    // In production: API call here
  }

  if (!bid) return null;

  return (
    <>
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.headerBtn}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>
            {bid.title}
          </Text>
          <TouchableOpacity style={s.headerBtn}>
            <Feather name="share-2" size={20} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Image carousel */}
          <View style={s.imgWrap}>
            <Image
              source={{ uri: bid.images[activeImg] }}
              style={s.mainImage}
            />
            <View style={s.imgOverlayTop}>
              <StatusBadge status={bid.status} />
            </View>
            {/* Timer chip */}
            <View style={s.timerChip}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <Text style={s.timerTxt}>{timeLeft} left</Text>
            </View>
          </View>

          <View style={s.body}>
            {/* Title & location */}
            <Text style={s.title}>{bid.title}</Text>
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={14} color={TEXT_FAINT} />
              <Text style={s.locationTxt}>{bid.location}</Text>
              <View style={s.conditionChip}>
                <Text style={s.conditionTxt}>{bid.condition}</Text>
              </View>
            </View>

            {/* Price section */}
            <View style={s.priceCard}>
              <View style={s.priceItem}>
                <Text style={s.priceLabel}>Current bid</Text>
                <Text style={s.currentBid}>
                  {bid.currentBid > 0
                    ? `KES ${bid.currentBid.toLocaleString()}`
                    : "No bids yet"}
                </Text>
                <Text style={s.bidCount}>{bid.bidCount} bids placed</Text>
              </View>
              <View style={s.priceDivider} />
              <View style={s.priceItem}>
                <Text style={s.priceLabel}>Asking price</Text>
                <Text style={s.askingPrice}>
                  KES {bid.askingPrice.toLocaleString()}
                </Text>
                <Text style={s.bidCount}>
                  Min increment: KES {bid.minBidIncrement.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={s.tagsRow}>
              {bid.tags.map((tag) => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagTxt}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>About this listing</Text>
              <Text style={s.descTxt}>{bid.description}</Text>
            </View>

            {/* Seller info */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Seller</Text>
              <View style={s.sellerCard}>
                <Avatar initials={bid.seller.avatar} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={s.sellerName}>{bid.seller.name}</Text>
                  <Text style={s.sellerMember}>
                    Member {bid.seller.memberNo}
                  </Text>
                  <Stars rating={bid.seller.rating} />
                </View>
                <View style={s.sellerStat}>
                  <Text style={s.sellerStatNum}>{bid.seller.totalSales}</Text>
                  <Text style={s.sellerStatLbl}>Sales</Text>
                </View>
                <TouchableOpacity style={s.contactBtn}>
                  <Ionicons name="chatbubble-outline" size={16} color={GREEN} />
                  <Text style={s.contactTxt}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Shares required */}
            <View
              style={[
                s.section,
                { backgroundColor: GREEN_LIGHT, borderRadius: 12, padding: 14 },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <MaterialIcons name="stars" size={18} color={GREEN} />
                <Text
                  style={[s.sectionTitle, { marginBottom: 0, color: GREEN }]}
                >
                  Shares required
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: "#2E7D32", lineHeight: 19 }}>
                This listing requires a minimum of{" "}
                <Text style={{ fontWeight: "800" }}>{bid.shares} shares</Text>{" "}
                to place a bid. You currently hold{" "}
                <Text style={{ fontWeight: "800" }}>1,240 shares</Text> ✅
              </Text>
            </View>

            {/* Bid placed confirmation */}
            {bidPlaced && (
              <View style={s.successBanner}>
                <Ionicons name="checkmark-circle" size={22} color={GREEN} />
                <Text style={s.successTxt}>
                  Your bid of KES {Number(bidAmount).toLocaleString()} was
                  placed successfully!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Sticky bid bar */}
        {!bidPlaced && (
          <View style={[s.stickyBar, { paddingBottom: insets.bottom + 12 }]}>
            <View style={s.bidInputWrap}>
              <Text style={s.bidCurrency}>KES</Text>
              <TextInput
                style={s.bidInput}
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
                placeholder={`Min ${minBid.toLocaleString()}`}
                placeholderTextColor={TEXT_FAINT}
              />
            </View>
            <TouchableOpacity style={s.bidBtn} onPress={handlePlaceBid}>
              <Text style={s.bidBtnTxt}>Place bid</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BidModal
        visible={modalVisible}
        bid={bid}
        bidAmount={bidAmount}
        onConfirm={confirmBid}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: TEXT_DARK },

  imgWrap: { width, height: 260, position: "relative" },
  mainImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imgOverlayTop: { position: "absolute", top: 12, left: 12 },
  timerChip: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timerTxt: { color: "#fff", fontSize: 12, fontWeight: "600" },

  body: { padding: 16 },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
    lineHeight: 26,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  locationTxt: { fontSize: 13, color: TEXT_FAINT, flex: 1 },
  conditionChip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  conditionTxt: { fontSize: 11, color: "#1D4ED8", fontWeight: "600" },

  priceCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  priceItem: { flex: 1, alignItems: "center" },
  priceLabel: { fontSize: 11, color: TEXT_FAINT, marginBottom: 4 },
  currentBid: {
    fontSize: 20,
    fontWeight: "800",
    color: GREEN,
    marginBottom: 3,
  },
  askingPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 3,
  },
  bidCount: { fontSize: 11, color: TEXT_FAINT },
  priceDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 8 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  tag: {
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTxt: { fontSize: 12, color: TEXT_MID },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  descTxt: { fontSize: 14, color: TEXT_MID, lineHeight: 22 },

  sellerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 2,
  },
  sellerMember: { fontSize: 11, color: TEXT_FAINT, marginBottom: 4 },
  sellerStat: { alignItems: "center", marginHorizontal: 8 },
  sellerStatNum: { fontSize: 16, fontWeight: "800", color: TEXT_DARK },
  sellerStatLbl: { fontSize: 10, color: TEXT_FAINT },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  contactTxt: { fontSize: 12, color: GREEN, fontWeight: "600" },

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  successTxt: {
    flex: 1,
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
    lineHeight: 18,
  },

  // Sticky bid bar
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bidInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  bidCurrency: { fontSize: 14, fontWeight: "700", color: TEXT_MID },
  bidInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    padding: 0,
  },
  bidBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  bidBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
