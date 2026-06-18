import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  fetchMyListings,
  fetchReceivedRequests,
  cancelListing,
  respondToRequest,
  clearError,
} from "../../../store/slices/marketSlice";
import ListingCard from "../../../components/ListingCard";
import RequestCard from "../../../components/RequestCard";
import EmptyState from "../../../components/EmptyState";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

const TABS = [
  { key: "listings", label: "My Listings", icon: "format-list-bulleted" },
  { key: "requests", label: "Received Requests", icon: "bell-outline" },
];

export default function SellerDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const {
    listings,
    listingsTotal,
    requests,
    loadingListings,
    loadingRequests,
    cancelling,
    responding,
    error,
  } = useSelector((state) => state.market);

  const [tab, setTab] = React.useState("listings");

  // Load both lists on mount
  useEffect(() => {
    dispatch(fetchMyListings())
      .unwrap()
      .catch((error) => console.log("Listings failed:", error));

    dispatch(fetchReceivedRequests())
      .unwrap()
      .catch((error) => console.log("Requests failed:", error));
  }, []);

  const handleCancel = useCallback(
    (listing) => {
      Alert.alert(
        "Cancel listing?",
        `Are you sure you want to cancel ${listing.listing_ref}? This cannot be undone.`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, cancel",
            style: "destructive",
            onPress: () => dispatch(cancelListing(listing.listing_ref)),
          },
        ],
      );
    },
    [dispatch],
  );

  const handleRespond = useCallback(
    (request, action) => {
      const label = action === "accept" ? "Accept" : "Decline";
      Alert.alert(
        `${label} request?`,
        action === "accept"
          ? `Accept the offer of KES ${Number(request.offered_price ?? 0).toLocaleString()} from ${request.buyer_name}?`
          : `Decline the request from ${request.buyer_name}?`,
        [
          { text: "Back", style: "cancel" },
          {
            text: label,
            style: action === "accept" ? "default" : "destructive",
            onPress: () =>
              dispatch(
                respondToRequest({ requestRef: request.request_ref, action }),
              ),
          },
        ],
      );
    },
    [dispatch],
  );

  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingReqs = requests.length;

  const renderHeader = useCallback(
    () => (
      <>
        <View style={s.pageHeader}>
          <View>
            <Text style={s.pageTitle}>My Shares</Text>
            <Text style={s.pageSub}>Manage your share listings</Text>
          </View>
          <TouchableOpacity
            style={s.createBtn}
            onPress={() => navigation.navigate("CreateListing")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={s.createBtnTxt}>New listing</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{listingsTotal}</Text>
            <Text style={s.statLbl}>Total listed</Text>
          </View>
          <View style={[s.statCard, s.statBorder]}>
            <Text style={[s.statNum, { color: GREEN }]}>{activeCount}</Text>
            <Text style={s.statLbl}>Active</Text>
          </View>
          <View style={[s.statCard, s.statBorder]}>
            <Text
              style={[
                s.statNum,
                { color: pendingReqs > 0 ? "#F59E0B" : TEXT_FAINT },
              ]}
            >
              {pendingReqs}
            </Text>
            <Text style={s.statLbl}>Pending offers</Text>
          </View>
        </View>

        {!!error && (
          <TouchableOpacity
            style={s.errorBanner}
            onPress={() => dispatch(clearError())}
          >
            <Ionicons name="warning-outline" size={16} color="#C62828" />
            <Text style={s.errorTxt}>{error}</Text>
            <Ionicons name="close" size={14} color="#C62828" />
          </TouchableOpacity>
        )}

        <View style={s.tabBar}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.tabBtn, tab === t.key && s.tabBtnActive]}
              onPress={() => setTab(t.key)}
            >
              <MaterialCommunityIcons
                name={t.icon}
                size={16}
                color={tab === t.key ? GREEN : TEXT_FAINT}
              />
              <Text style={[s.tabTxt, tab === t.key && s.tabTxtActive]}>
                {t.label}
              </Text>
              {t.key === "requests" && pendingReqs > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>{pendingReqs}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </>
    ),
    [listingsTotal, activeCount, pendingReqs, error, tab, dispatch, navigation],
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (tab === "listings") {
        return (
          <ListingCard
            listing={item}
            cancelling={cancelling === item.listing_ref}
            onCancel={() => handleCancel(item)}
            onPress={() =>
              navigation.navigate("ListingDetail", { listing: item })
            }
          />
        );
      }
      return (
        <RequestCard
          request={item}
          responding={responding === item.request_ref}
          onAccept={() => handleRespond(item, "accept")}
          onDecline={() => handleRespond(item, "reject")}
        />
      );
    },
    [tab, cancelling, responding, handleCancel, handleRespond, navigation],
  );

  const isLoading = tab === "listings" ? loadingListings : loadingRequests;
  const data = tab === "listings" ? listings : requests;

  const handleRefresh = useCallback(() => {
    if (tab === "listings") dispatch(fetchMyListings());
    else dispatch(fetchReceivedRequests());
  }, [tab, dispatch]);

  return (
    <View style={[s.container]}>
      <FlatList
        data={isLoading ? [] : data}
        keyExtractor={(item, idx) =>
          item.listing_ref ?? item.request_ref ?? String(idx)
        }
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={GREEN}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={GREEN} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState
              emoji={tab === "listings" ? "📋" : "📬"}
              title={tab === "listings" ? "No listings yet" : "No requests yet"}
              sub={
                tab === "listings"
                  ? "Tap 'New listing' to offer your shares"
                  : "Requests from buyers will appear here"
              }
              actionLabel={tab === "listings" ? "Create listing" : undefined}
              onAction={
                tab === "listings"
                  ? () => navigation.navigate("CreateListing")
                  : undefined
              }
            />
          )
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 14,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: TEXT_DARK },
  pageSub: { fontSize: 13, color: TEXT_FAINT, marginTop: 2 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: "hidden",
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: BORDER },
  statNum: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  statLbl: { fontSize: 11, color: TEXT_FAINT, marginTop: 3 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorTxt: { flex: 1, fontSize: 13, color: "#C62828" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabBtnActive: { backgroundColor: GREEN_LIGHT },
  tabTxt: { fontSize: 13, fontWeight: "600", color: TEXT_FAINT },
  tabTxtActive: { color: GREEN },
  badge: {
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeTxt: { color: "#fff", fontSize: 10, fontWeight: "800" },
});
