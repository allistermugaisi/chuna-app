import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Share,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  fetchFullStatement,
  clearStatementError,
} from "../../../store/slices/statementSlice";

const { width: W, height: H } = Dimensions.get("window");

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
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

// ─── Detect base64 mime ───
function detectMime(base64 = "") {
  const head = base64.substring(0, 8);
  if (head.startsWith("JVBER")) return "application/pdf";
  if (head.startsWith("/9j/")) return "image/jpeg";
  if (head.startsWith("iVBOR")) return "image/png";
  return "image/png";
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

// ─── PDF WebView renderer ───
function PdfViewer({ base64 }) {
  const webViewRef = useRef(null);
  const [webViewHeight, setHeight] = useState(H);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(null);

  // Strip any data URI prefix — pdf.js wants raw base64
  const cleanBase64 = base64
    .replace(/^data:application\/pdf;base64,/, "")
    .replace(/\s/g, "");

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=4.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; background: #F4F6F8; }
      body { display: flex; flex-direction: column; align-items: center; padding: 12px; gap: 12px; }
      .page-wrap {
        width: 100%;
        background: #fff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      }
      canvas { display: block; width: 100% !important; height: auto !important; }
      #status { font-family: -apple-system, sans-serif; font-size: 14px; color: #999; padding: 24px; }
    </style>
  </head>
  <body>
    <div id="status">Loading PDF…</div>
    <div id="container"></div>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      (async () => {
        try {
          const pdfData    = atob('${cleanBase64}');
          const pdf        = await pdfjsLib.getDocument({ data: pdfData }).promise;
          const container  = document.getElementById('container');
          const statusEl   = document.getElementById('status');
          const pixelRatio = window.devicePixelRatio || 2;
          const viewW      = document.body.clientWidth - 24;

          statusEl.remove();

          for (let n = 1; n <= pdf.numPages; n++) {
            const page     = await pdf.getPage(n);
            const baseVP   = page.getViewport({ scale: 1 });
            const scale    = (viewW / baseVP.width) * Math.max(pixelRatio, 2);
            const viewport = page.getViewport({ scale });

            const wrap   = document.createElement('div');
            wrap.className = 'page-wrap';

            const canvas = document.createElement('canvas');
            const ctx    = canvas.getContext('2d', { alpha: false });
            canvas.width  = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width  = (viewport.width  / scale * (viewW / baseVP.width)) + 'px';
            canvas.style.height = (viewport.height / scale * (viewW / baseVP.width)) + 'px';

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            await page.render({ canvasContext: ctx, viewport, background: 'rgb(255,255,255)' }).promise;

            wrap.appendChild(canvas);
            container.appendChild(wrap);
          }

          // Tell React Native the total height + page count
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type:      'ready',
            height:    document.body.scrollHeight,
            pageCount: pdf.numPages,
          }));

        } catch (err) {
          document.body.innerHTML = '<p id="status">Failed to load PDF: ' + err.message + '</p>';
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err.message }));
        }
      })();
    </script>
  </body>
</html>`;

  const onMessage = useCallback((e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "ready") {
        setHeight(msg.height + 40);
        setPageCount(msg.pageCount);
        setLoading(false);
      } else if (msg.type === "error") {
        setLoading(false);
      }
    } catch {}
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Page count badge */}
      {pageCount && (
        <View style={pv.pageBadge}>
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={14}
            color="#E53935"
          />
          <Text style={pv.pageTxt}>
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </Text>
        </View>
      )}

      {/* Loading overlay */}
      {loading && (
        <View style={pv.loadOverlay}>
          <ActivityIndicator color={GREEN} size="large" />
          <Text style={pv.loadTxt}>Rendering PDF…</Text>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        maximumZoomScale={4}
        minimumZoomScale={1}
        showsVerticalScrollIndicator={false}
      >
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={{ width: W, height: webViewHeight }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false} // outer ScrollView handles scroll
          scalesPageToFit={false}
          automaticallyAdjustContentInsets={false}
          onMessage={onMessage}
          startInLoadingState={false} // we show our own loader
          useWebKit
        />
      </ScrollView>
    </View>
  );
}

const pv = StyleSheet.create({
  pageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    margin: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pageTxt: { fontSize: 12, fontWeight: "600", color: TEXT_DARK },
  loadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  loadTxt: { fontSize: 14, color: TEXT_FAINT },
});

// ─── Main screen ───
export default function FullStatementScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { fullStatement, loadingFull, error } = useSelector((s) => s.statement);

  const [dateFrom, setDateFrom] = useState(sixMonthsAgo());
  const [dateTo, setDateTo] = useState(today());
  const [pdfOpen, setPdfOpen] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchFullStatement({ date_from: dateFrom, date_to: dateTo }));
  }, [dispatch, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, []);

  // ── Save to cache & share ──
  const saveFile = useCallback(async () => {
    if (!fullStatement) return null;
    const mime = detectMime(fullStatement);
    const ext = mime === "application/pdf" ? "pdf" : "png";
    const path = `${FileSystem.cacheDirectory}chuna-statement-${dateFrom}-to-${dateTo}.${ext}`;
    await FileSystem.writeAsStringAsync(path, fullStatement, {
      encoding: "base64",
    });
    return { path, mime };
  }, [fullStatement, dateFrom, dateTo]);

  const handleShare = useCallback(async () => {
    try {
      const file = await saveFile();
      if (!file) return;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.path, {
          mimeType: file.mime,
          dialogTitle: "Share statement",
          UTI: file.mime === "application/pdf" ? "com.adobe.pdf" : "public.png",
        });
      } else {
        await Share.share({ message: `Statement: ${file.path}` });
      }
    } catch (e) {
      console.log("Share failed:", e);
    }
  }, [saveFile]);

  const isPdf = fullStatement
    ? detectMime(fullStatement) === "application/pdf"
    : false;

  return (
    <View style={[s.container]}>
      {/* Navbar */}
      <View style={s.navBar}>
        <Text style={s.navTitle}>Your Account Statement</Text>
        <TouchableOpacity style={s.iconBtn} onPress={load}>
          <Feather name="refresh-cw" size={17} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      {/* Date filter */}
      <View style={s.filterRow}>
        <DatePill label="From" value={dateFrom} onPress={() => {}} />
        <Ionicons name="arrow-forward" size={14} color={TEXT_FAINT} />
        <DatePill label="To" value={dateTo} onPress={() => {}} />
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

      {/* ── Content ── */}
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

        {/* Statement ready card */}
        {!loadingFull && !error && !!fullStatement && (
          <>
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

            {/* Preview card */}
            <View style={s.previewCard}>
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={64}
                color="#E53935"
              />
              <Text style={s.previewTitle}>Statement ready</Text>
              <Text style={s.previewSub}>
                Your account statement for the selected period is ready to view
                or share.
              </Text>
              <TouchableOpacity
                style={s.openPdfBtn}
                onPress={() => setPdfOpen(true)}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={s.openPdfTxt}>View Statement</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>

      {/* Bottom actions */}
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

      {/* ── PDF Modal ── */}
      <Modal
        visible={pdfOpen}
        animationType="slide"
        onRequestClose={() => setPdfOpen(false)}
      >
        <View style={[s.pdfScreen, { paddingTop: insets.top }]}>
          {/* Modal nav */}
          <View style={s.pdfHeader}>
            <TouchableOpacity
              onPress={() => setPdfOpen(false)}
              style={s.iconBtn}
            >
              <Ionicons name="chevron-down" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.navTitle}>Statement Preview</Text>
            <TouchableOpacity onPress={handleShare} style={s.iconBtn}>
              <Ionicons name="share-outline" size={20} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          {/* PDF rendered via pdf.js in WebView */}
          {fullStatement && <PdfViewer base64={fullStatement} />}

          {/* Bottom bar inside modal */}
          <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color={GREEN} />
              <Text style={s.shareTxt}>Share Statement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.doneBtn}
              onPress={() => setPdfOpen(false)}
            >
              <Text style={s.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

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

  // Preview card
  previewCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  previewTitle: { fontSize: 18, fontWeight: "800", color: TEXT_DARK },
  previewSub: {
    fontSize: 13,
    color: TEXT_FAINT,
    textAlign: "center",
    lineHeight: 20,
  },
  openPdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  openPdfTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },

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

  // Bottom bar
  bottomBar: {
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

  // PDF Modal
  pdfScreen: { flex: 1, backgroundColor: BG },
  pdfHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
});
