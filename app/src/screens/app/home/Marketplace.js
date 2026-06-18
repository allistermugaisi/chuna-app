import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import {
  MOCK_BIDS,
  CATEGORIES,
  GREEN,
  GREEN_LIGHT,
  BG,
  TEXT_DARK,
  TEXT_MID,
  TEXT_FAINT,
  BORDER,
} from "../../../data/marketplaceData";
import { BidCard, SectionHeader } from "../../../components/Marketplace";

export default function MarketplaceHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeCategory, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | price_asc | price_desc | bids

  const filtered = useMemo(() => {
    let list = [...MOCK_BIDS];

    // category
    if (activeCategory !== "all") {
      list = list.filter((b) => b.category === activeCategory);
    }

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.location.toLowerCase().includes(q),
      );
    }

    // sort
    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case "price_desc":
        list.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case "bids":
        list.sort((a, b) => b.bidCount - a.bidCount);
        break;
      default:
        list.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    }

    return list;
  }, [search, activeCategory, sortBy]);

  const renderBid = useCallback(
    ({ item }) => (
      <BidCard
        bid={item}
        onPress={() => navigation.navigate("BidDetail", { bid: item })}
      />
    ),
    [navigation],
  );

  const ListHeader = () => (
    <>
      {/* Hero banner */}
      <View style={s.heroBanner}>
        <View style={s.heroLeft}>
          <Text style={s.heroTitle}>Chuna{"\n"}Marketplace</Text>
          <Text style={s.heroSub}>Buy, sell & bid with fellow members</Text>
          <TouchableOpacity
            style={s.createBtn}
            onPress={() => navigation.navigate("CreateBid")}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={s.createBtnTxt}>Create a listing</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 64 }}>🛒</Text>
      </View>

      {/* Quick stats bar */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statNum}>{MOCK_BIDS.length}</Text>
          <Text style={s.statLbl}>Active bids</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>1,204</Text>
          <Text style={s.statLbl}>Members</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>KES 4.2M</Text>
          <Text style={s.statLbl}>Total traded</Text>
        </View>
      </View>

      {/* Categories */}
      <Text style={s.subheading}>Browse by category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catRow}
      >
        {CATEGORIES.map((cat) => {
          const active = cat.key === activeCategory;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[s.catChip, active && s.catChipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={s.catEmoji}>{cat.emoji}</Text>
              <Text style={[s.catLabel, active && s.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort bar */}
      <View style={s.sortBar}>
        <Text style={s.sortLbl}>{filtered.length} listings</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "newest", label: "Newest" },
            { key: "price_asc", label: "Price ↑" },
            { key: "price_desc", label: "Price ↓" },
            { key: "bids", label: "Most bids" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[s.sortChip, sortBy === opt.key && s.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text
                style={[
                  s.sortChipTxt,
                  sortBy === opt.key && s.sortChipTxtActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <View style={s.searchWrap}>
          <Feather
            name="search"
            size={16}
            color={TEXT_FAINT}
            style={s.searchIcon}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search listings…"
            placeholderTextColor={TEXT_FAINT}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={TEXT_FAINT} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={s.myBidsBtn}
          onPress={() => navigation.navigate("MyBids")}
        >
          <Feather name="user" size={18} color={GREEN} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderBid}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🔍</Text>
            <Text style={s.emptyTitle}>No listings found</Text>
            <Text style={s.emptySub}>Try a different search or category</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: BG,
  },
  backBtn: { padding: 4 },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 14, color: TEXT_DARK, padding: 0 },
  myBidsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  list: { paddingHorizontal: 16, paddingBottom: 120 },

  // Hero
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GREEN,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    marginTop: 10,
  },
  heroLeft: { flex: 1 },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 28,
    marginBottom: 4,
  },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginBottom: 14 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignSelf: "flex-start",
  },
  createBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Stats
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 17, fontWeight: "800", color: TEXT_DARK },
  statLbl: { fontSize: 11, color: TEXT_FAINT, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: BORDER },

  // Categories
  subheading: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  catRow: { gap: 8, paddingRight: 8, marginBottom: 16 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BORDER,
  },
  catChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 13, color: TEXT_MID, fontWeight: "500" },
  catLabelActive: { color: "#fff", fontWeight: "700" },

  // Sort
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sortLbl: { fontSize: 13, color: TEXT_FAINT, flexShrink: 0 },
  sortChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  sortChipActive: { backgroundColor: TEXT_DARK, borderColor: TEXT_DARK },
  sortChipTxt: { fontSize: 12, color: TEXT_MID, fontWeight: "500" },
  sortChipTxtActive: { color: "#fff" },

  // Empty
  empty: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  emptySub: { fontSize: 14, color: TEXT_FAINT },
});
