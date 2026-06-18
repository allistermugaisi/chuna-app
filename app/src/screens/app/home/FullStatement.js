import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  Dimensions,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  fetchFullStatement,
  clearStatementError,
} from "../../../store/slices/statementSlice";

const { width: W } = Dimensions.get("window");

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ─── Date helpers ───
function today() {
  return new Date().toISOString().split("T")[0];
}
function sixMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split("T")[0];
}
function formatDisplay(iso = "") {
  try {
    return new Date(iso).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Date pill ───
function DatePill({ label, value, onPress }) {
  return (
    <TouchableOpacity style={dp.wrap} onPress={onPress} activeOpacity={0.8}>
      <Feather name="calendar" size={13} color={GREEN} />
      <View>
        <Text style={dp.label}>{label}</Text>
        <Text style={dp.value}>{formatDisplay(value)}</Text>
      </View>
      <Ionicons name="chevron-down" size={13} color={TEXT_FAINT} />
    </TouchableOpacity>
  );
}
const dp = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER,
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: TEXT_FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: { fontSize: 12, fontWeight: "600", color: TEXT_DARK },
});

// ─── Detect base64 content type ───
function detectMime(base64 = "") {
  // Read the first few chars of the base64 string to identify the file type
  const head = base64.substring(0, 8);
  if (head.startsWith("JVBER")) return "application/pdf"; // %PDF
  if (head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("iVBOR")) return "image/png";
  return "image/png"; // fallback
}

// ─── Statement image viewer ────
function StatementImage({ base64 }) {
  const mime = detectMime(base64);
  const uri = `data:${mime};base64,${base64}`;
  const isPdf = mime === "application/pdf";

  const [size, setSize] = useState({ width: W - 32, height: (W - 32) * 1.6 });

  useEffect(() => {
    if (isPdf) return; // can't getSize on a PDF
    Image.getSize(
      uri,
      (w, h) => {
        const ratio = h / w;
        const width = W - 32;
        setSize({ width, height: width * ratio });
      },
      () => {},
    );
  }, [uri]);

  if (isPdf) {
    return (
      <View style={si.pdfWrap}>
        <MaterialCommunityIcons name="file-pdf-box" size={56} color="#E53935" />
        <Text style={si.pdfTitle}>Statement ready</Text>
        <Text style={si.pdfSub}>
          This statement is a PDF. Use the Share button below to open or save
          it.
        </Text>
      </View>
    );
  }

  return (
    <View style={si.wrap}>
      <Image
        source={{ uri }}
        style={[si.image, { width: size.width, height: size.height }]}
        resizeMode="contain"
      />
    </View>
  );
}
const si = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  image: {},
  pdfWrap: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pdfTitle: { fontSize: 17, fontWeight: "700", color: TEXT_DARK },
  pdfSub: {
    fontSize: 13,
    color: TEXT_FAINT,
    textAlign: "center",
    lineHeight: 20,
  },
});

// ─── Main screen ───
export default function FullStatementScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { fullStatement, loadingFull, error } = useSelector((s) => s.statement);

  const [dateFrom, setDateFrom] = useState(sixMonthsAgo());
  const [dateTo, setDateTo] = useState(today());

  const load = useCallback(() => {
    dispatch(fetchFullStatement({ date_from: dateFrom, date_to: dateTo }));
  }, [dispatch, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, []);

  const handleShare = useCallback(async () => {
    if (!fullStatement) return;
    try {
      const mime = detectMime(fullStatement);
      const ext = mime === "application/pdf" ? "pdf" : "png";
      const filename = `chuna-statement-${dateFrom}-to-${dateTo}.${ext}`;
      const path = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(path, fullStatement, {
        encoding: "base64", // plain string — no EncodingType enum needed
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: mime,
          dialogTitle: "Share statement",
          UTI: mime === "application/pdf" ? "com.adobe.pdf" : "public.png",
        });
      } else {
        await Share.share({ message: `Statement saved to: ${path}` });
      }
    } catch (e) {
      console.log("Share failed:", e);
    }
  }, [fullStatement, dateFrom, dateTo]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Nav bar */}
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
        <Text style={s.navTitle}>Account Statement</Text>
        <TouchableOpacity style={s.iconBtn} onPress={load}>
          <Feather name="refresh-cw" size={17} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      {/* Date filter */}
      <View style={s.filterRow}>
        <DatePill
          label="From"
          value={dateFrom}
          onPress={() => {
            /* wire DatePicker */
          }}
        />
        <Ionicons name="arrow-forward" size={14} color={TEXT_FAINT} />
        <DatePill
          label="To"
          value={dateTo}
          onPress={() => {
            /* wire DatePicker */
          }}
        />
        <TouchableOpacity
          style={s.applyBtn}
          onPress={load}
          disabled={loadingFull}
        >
          {loadingFull ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.applyTxt}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Loading */}
        {loadingFull && (
          <View style={s.centerWrap}>
            <ActivityIndicator color={GREEN} size="large" />
            <Text style={s.loadingTxt}>Generating statement…</Text>
          </View>
        )}

        {/* Error */}
        {!loadingFull && !!error && (
          <View style={s.centerWrap}>
            <MaterialCommunityIcons
              name="file-alert-outline"
              size={52}
              color="#E53935"
            />
            <Text style={s.errorTitle}>Could not load statement</Text>
            <Text style={s.errorSub}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={load}>
              <Text style={s.retryTxt}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!loadingFull && !error && !fullStatement && (
          <View style={s.centerWrap}>
            <MaterialCommunityIcons
              name="file-search-outline"
              size={52}
              color={TEXT_FAINT}
            />
            <Text style={s.emptyTitle}>No statement found</Text>
            <Text style={s.emptySub}>Try a different date range</Text>
          </View>
        )}

        {/* Statement image */}
        {!loadingFull && !error && !!fullStatement && (
          <>
            {/* Period banner */}
            <View style={s.periodBanner}>
              <MaterialCommunityIcons
                name="calendar-range"
                size={16}
                color={GREEN}
              />
              <Text style={s.periodTxt}>
                {formatDisplay(dateFrom)} – {formatDisplay(dateTo)}
              </Text>
            </View>

            {/* The actual statement rendered from base64 */}
            <StatementImage base64={fullStatement} />

            {/* Spacer so buttons don't overlap image */}
            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>

      {/* ── Sticky bottom actions ────────────────────────────────────────────── */}
      {!loadingFull && !!fullStatement && (
        <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={GREEN} />
            <Text style={s.shareTxt}>Share Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.doneTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Nav
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: TEXT_DARK },

  // Filter
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  applyBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: "center",
  },
  applyTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },

  scroll: { flexGrow: 1, paddingBottom: 120 },

  // Period banner
  periodBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  periodTxt: { fontSize: 13, fontWeight: "600", color: GREEN_DARK },

  // States
  centerWrap: {
    flex: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  loadingTxt: { fontSize: 14, color: TEXT_FAINT, marginTop: 8 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  errorSub: { fontSize: 13, color: TEXT_FAINT, textAlign: "center" },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  emptySub: { fontSize: 13, color: TEXT_FAINT },

  // Bottom bar — mirrors KCB design
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
  },
  shareTxt: { color: GREEN, fontWeight: "700", fontSize: 15 },
  doneBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  doneTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
