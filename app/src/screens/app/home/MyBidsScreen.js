import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import {
  MY_BIDS,
  MY_SHARES,
  GREEN,
  GREEN_LIGHT,
  GREEN_DARK,
  BG,
  TEXT_DARK,
  TEXT_MID,
  TEXT_FAINT,
  BORDER,
  GOLD,
  STATUS,
} from "../../../data/marketplaceData";
import {
  MyBidCard,
  ShareStatCard,
  SectionHeader,
  Avatar,
  StatusBadge,
} from "../../../components/Marketplace";

const { width } = Dimensions.get("window");

const TABS = ["My Listings", "My Shares"];

// ─── Mini bar chart ────────────────────────────────────────────────────────────
function DividendBar({ history }) {
  const max = Math.max(...history.map((h) => h.dividend));
  return (
    <View style={bar.wrap}>
      {history.map((h, i) => {
        const pct = h.dividend / max;
        return (
          <View key={i} style={bar.col}>
            <Text style={bar.val}>
              {h.dividend >= 1000
                ? `${(h.dividend / 1000).toFixed(1)}k`
                : h.dividend}
            </Text>
            <View style={bar.trackWrap}>
              <View
                style={[bar.fill, { height: `${Math.max(pct * 100, 8)}%` }]}
              />
            </View>
            <Text style={bar.month}>{h.month.slice(0, 3)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const bar = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    height: 100,
    marginTop: 8,
  },
  col: { flex: 1, alignItems: "center", gap: 4 },
  val: { fontSize: 9, color: TEXT_FAINT, fontWeight: "600" },
  trackWrap: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    justifyContent: "flex-end",
  },
  fill: { backgroundColor: GREEN, borderRadius: 6, width: "100%" },
  month: { fontSize: 9, color: TEXT_FAINT },
});

// ─── Shares tab ────────────────────────────────────────────────────────────────
function SharesTab() {
  const sh = MY_SHARES;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={st.scroll}
    >
      {/* Hero card */}
      <View style={st.hero}>
        <View style={st.heroLeft}>
          <Text style={st.heroLabel}>Total shares value</Text>
          <Text style={st.heroValue}>KES {sh.totalValue.toLocaleString()}</Text>
          <Text style={st.heroSub}>
            {sh.totalShares.toLocaleString()} shares @ KES {sh.shareValue}/share
          </Text>
        </View>
        <View style={st.heroRight}>
          <MaterialIcons
            name="stars"
            size={36}
            color="rgba(255,255,255,0.85)"
          />
        </View>
      </View>

      {/* Stat cards */}
      <View style={st.statRow}>
        <ShareStatCard
          label="Available shares"
          value={sh.availableShares.toLocaleString()}
          sub="Can use for bids"
          accent
        />
        <View style={{ width: 10 }} />
        <ShareStatCard
          label="Pending dividend"
          value={`KES ${sh.pendingDividend.toLocaleString()}`}
          sub="Next payout"
        />
      </View>

      {/* Last dividend */}
      <View style={st.lastDiv}>
        <View style={{ flex: 1 }}>
          <Text style={st.lastDivTitle}>Last dividend paid</Text>
          <Text style={st.lastDivDate}>{sh.lastDividend.date}</Text>
        </View>
        <Text style={st.lastDivAmt}>
          KES {sh.lastDividend.amount.toLocaleString()}
        </Text>
        <View style={st.checkChip}>
          <Ionicons name="checkmark" size={14} color={GREEN} />
          <Text style={{ fontSize: 11, color: GREEN, fontWeight: "700" }}>
            Paid
          </Text>
        </View>
      </View>

      {/* Dividend chart */}
      <View style={st.section}>
        <SectionHeader title="Monthly dividends" />
        <DividendBar history={sh.history} />
      </View>

      {/* Share history table */}
      <View style={st.section}>
        <SectionHeader title="Share activity" />
        {sh.history.map((h, i) => (
          <View key={i} style={st.histRow}>
            <Text style={st.histMonth}>{h.month}</Text>
            <View style={{ flex: 1 }} />
            <Text style={st.histShares}>
              {h.shares.toLocaleString()} shares
            </Text>
            <Text style={st.histDiv}>+KES {h.dividend.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Buy more shares CTA */}
      <TouchableOpacity style={st.buyCta}>
        <MaterialIcons name="add-circle-outline" size={20} color={GREEN} />
        <Text style={st.buyCtaTxt}>Buy more shares</Text>
        <Ionicons name="chevron-forward" size={16} color={GREEN} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  hero: {
    backgroundColor: GREEN,
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 10,
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 4 },
  heroValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  heroRight: {},
  statRow: { flexDirection: "row", marginBottom: 12 },
  lastDiv: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  lastDivTitle: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
  lastDivDate: { fontSize: 11, color: TEXT_FAINT, marginTop: 2 },
  lastDivAmt: { fontSize: 17, fontWeight: "800", color: TEXT_DARK },
  checkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  histMonth: { fontSize: 13, color: TEXT_MID, width: 80 },
  histShares: { fontSize: 12, color: TEXT_FAINT, marginRight: 12 },
  histDiv: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
    width: 90,
    textAlign: "right",
  },
  buyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  buyCtaTxt: { flex: 1, fontSize: 14, fontWeight: "700", color: GREEN },
});

// ─── Listings tab ──────────────────────────────────────────────────────────────
function ListingsTab({ navigation }) {
  return (
    <FlatList
      data={MY_BIDS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={lt.header}>
          <TouchableOpacity
            style={lt.createBtn}
            onPress={() => navigation.navigate("CreateBid")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={lt.createBtnTxt}>New listing</Text>
          </TouchableOpacity>
          <View style={lt.statsRow}>
            {[
              { num: MY_BIDS.length, lbl: "Total" },
              {
                num: MY_BIDS.filter((b) => b.status === "OPEN").length,
                lbl: "Active",
              },
              {
                num: MY_BIDS.filter((b) => b.status === "PENDING").length,
                lbl: "Pending",
              },
            ].map((stat, i) => (
              <View key={i} style={lt.statItem}>
                <Text style={lt.statNum}>{stat.num}</Text>
                <Text style={lt.statLbl}>{stat.lbl}</Text>
              </View>
            ))}
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <MyBidCard
          bid={item}
          onPress={() => navigation.navigate("BidDetail", { bid: item })}
          onManage={() => {}} // navigate to manage screen
        />
      )}
      ListEmptyComponent={
        <View style={lt.empty}>
          <Text style={lt.emptyEmoji}>📭</Text>
          <Text style={lt.emptyTitle}>No listings yet</Text>
          <Text style={lt.emptySub}>
            Create your first listing to start selling
          </Text>
        </View>
      }
    />
  );
}

const lt = StyleSheet.create({
  header: { marginTop: 10, marginBottom: 14 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    justifyContent: "center",
  },
  createBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statItem: { flex: 1, alignItems: "center", padding: 14 },
  statNum: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  statLbl: { fontSize: 11, color: TEXT_FAINT, marginTop: 3 },
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

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function MyBidsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);

  return (
    <View style={[ms.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={ms.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={ms.headerBtn}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>

        <View style={ms.avatarWrap}>
          <Avatar initials="AM" size={40} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ms.memberName}>ALLISTER MUGAISI</Text>
          <Text style={ms.memberNo}>Member No. 1149967128</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={ms.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[ms.tabBtn, tab === i && ms.tabBtnActive]}
            onPress={() => setTab(i)}
          >
            <Text style={[ms.tabTxt, tab === i && ms.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 ? <ListingsTab navigation={navigation} /> : <SharesTab />}
    </View>
  );
}

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  avatarWrap: {},
  memberName: { fontSize: 14, fontWeight: "800", color: TEXT_DARK },
  memberNo: { fontSize: 11, color: TEXT_FAINT },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: GREEN },
  tabTxt: { fontSize: 14, fontWeight: "600", color: TEXT_FAINT },
  tabTxtActive: { color: GREEN, fontWeight: "700" },
});
