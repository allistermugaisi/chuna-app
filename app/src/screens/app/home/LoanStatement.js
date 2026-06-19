import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  fetchGuaranteedLoans,
  fetchLoanStatement,
  fetchRepaymentSchedule,
  fetchRunningLoans,
} from "../../../store/slices/loanStatementSlice";

const { width: W, height: H } = Dimensions.get("window");

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_FAINT = "#777777";
const BORDER = "#EEEEEE";

function detectMime(base64 = "") {
  const clean = base64?.replace(/^data:[^;]+;base64,/, "").trim();
  if (clean?.startsWith("JVBER")) return "application/pdf";
  if (clean?.startsWith("/9j/")) return "image/jpeg";
  if (clean?.startsWith("iVBOR")) return "image/png";
  return "application/pdf";
}

function cleanBase64(base64 = "") {
  return base64?.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
}

function firstValue(item, keys, fallback = "-") {
  const key = keys.find(
    (name) => item?.[name] !== undefined && item?.[name] !== null,
  );
  return key ? String(item[key]) : fallback;
}

function getLoanNo(item) {
  return firstValue(
    item,
    ["loan_no", "loanNo", "loan_number", "loanNumber", "no"],
    "",
  );
}

function getDocNo(item) {
  return firstValue(item, ["doc_no", "docNo", "document_no", "documentNo"], "");
}

function money(value) {
  if (value === undefined || value === null || value === "") return "-";
  const numeric = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
}

function PdfViewer({ base64 }) {
  const webViewRef = useRef(null);
  const [webViewHeight, setHeight] = useState(H);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(null);
  const pdfBase64 = cleanBase64(base64);

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
      .page-wrap { width: 100%; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
      canvas { display: block; width: 100% !important; height: auto !important; }
      #status { font-family: -apple-system, sans-serif; font-size: 14px; color: #999; padding: 24px; }
    </style>
  </head>
  <body>
    <div id="status">Loading PDF...</div>
    <div id="container"></div>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      (async () => {
        try {
          const pdfData = atob('${pdfBase64}');
          const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
          const container = document.getElementById('container');
          const statusEl = document.getElementById('status');
          const pixelRatio = window.devicePixelRatio || 2;
          const viewW = document.body.clientWidth - 24;

          statusEl.remove();

          for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            const baseVP = page.getViewport({ scale: 1 });
            const scale = (viewW / baseVP.width) * Math.max(pixelRatio, 2);
            const viewport = page.getViewport({ scale });
            const wrap = document.createElement('div');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { alpha: false });

            wrap.className = 'page-wrap';
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport, background: 'rgb(255,255,255)' }).promise;
            wrap.appendChild(canvas);
            container.appendChild(wrap);
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ready',
            height: document.body.scrollHeight,
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
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {pageCount && (
        <View style={s.pageBadge}>
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={14}
            color="#E53935"
          />
          <Text style={s.pageTxt}>
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </Text>
        </View>
      )}
      {loading && (
        <View style={s.loadOverlay}>
          <ActivityIndicator color={GREEN} size="large" />
          <Text style={s.loadingTxt}>Rendering PDF...</Text>
        </View>
      )}
      <ScrollView maximumZoomScale={4} minimumZoomScale={1}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={{ width: W, height: webViewHeight }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          scalesPageToFit={false}
          automaticallyAdjustContentInsets={false}
          onMessage={onMessage}
          useWebKit
        />
      </ScrollView>
    </View>
  );
}

function ImageReportViewer({ base64 }) {
  const mime = detectMime(base64);
  const uri = `data:${mime};base64,${cleanBase64(base64)}`;

  return (
    <ScrollView
      maximumZoomScale={4}
      minimumZoomScale={1}
      contentContainerStyle={s.imageReportWrap}
    >
      <Image source={{ uri }} style={s.imageReport} resizeMode="contain" />
    </ScrollView>
  );
}

function LoanCard({
  item,
  onLoanStatement,
  onRepaymentSchedule,
  loadingStatement,
  loadingSchedule,
}) {
  const loanNo = getLoanNo(item);
  const title = firstValue(
    item,
    ["loan_type", "loanType", "description", "name"],
    "Loan",
  );
  const balance = firstValue(
    item,
    ["balance", "loan_balance", "outstanding_balance", "outstanding"],
    "",
  );
  const amount = firstValue(
    item,
    ["amount", "loan_amount", "approved_amount", "principal"],
    "",
  );
  const status = firstValue(item, ["status", "loan_status"], "Running");

  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.loanIcon}>
          <MaterialCommunityIcons
            name="cash-multiple"
            size={20}
            color={GREEN}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardSub}>Loan No: {loanNo || "-"}</Text>
        </View>
        <View style={s.statusPill}>
          <Text style={s.statusText}>{status}</Text>
        </View>
      </View>

      <View style={s.metricRow}>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Amount</Text>
          <Text style={s.metricValue}>{money(amount)}</Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Balance</Text>
          <Text style={s.metricValue}>{money(balance)}</Text>
        </View>
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity
          style={s.outlineBtn}
          onPress={() => onLoanStatement(item)}
          disabled={!loanNo || loadingStatement}
        >
          {loadingStatement ? (
            <ActivityIndicator size="small" color={GREEN} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={17}
                color={GREEN}
              />
              <Text style={s.outlineTxt}>Statement</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => onRepaymentSchedule(item)}
          disabled={!loanNo || loadingSchedule}
        >
          {loadingSchedule ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={17}
                color="#fff"
              />
              <Text style={s.primaryTxt}>Schedule</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GuaranteedLoanCard({ item }) {
  const loanNo = getLoanNo(item);
  const name = firstValue(
    item,
    ["member_name", "name", "borrower_name", "loanee_name"],
    "Guaranteed loan",
  );
  const amount = firstValue(
    item,
    ["amount", "guaranteed_amount", "loan_amount"],
    "",
  );
  const balance = firstValue(
    item,
    ["balance", "outstanding_balance", "loan_balance"],
    "",
  );

  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.loanIcon}>
          <MaterialCommunityIcons
            name="account-check-outline"
            size={20}
            color={GREEN}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{name}</Text>
          <Text style={s.cardSub}>Loan No: {loanNo || "-"}</Text>
        </View>
      </View>
      <View style={s.metricRow}>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Guaranteed</Text>
          <Text style={s.metricValue}>{money(amount)}</Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricLabel}>Balance</Text>
          <Text style={s.metricValue}>{money(balance)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function LoanStatementsScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const docNo = route?.params?.doc_no ?? route?.params?.docNo ?? "";
  const [tab, setTab] = useState("running");
  const [report, setReport] = useState(null);
  const [reportTitle, setReportTitle] = useState("Loan Statement");

  const {
    runningLoans,
    guaranteedLoans,
    loanStatement,
    repaymentSchedule,
    loadingRunningLoans,
    loadingGuaranteedLoans,
    loadingLoanStatement,
    loadingRepaymentSchedule,
    error,
  } = useSelector((state) => state.loanStatement);

  const reportLoading = loadingLoanStatement || loadingRepaymentSchedule;

  const loadLists = useCallback(() => {
    dispatch(fetchRunningLoans());
    dispatch(fetchGuaranteedLoans({ doc_no: docNo }));
  }, [dispatch, docNo]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    if (loanStatement) {
      setReport(loanStatement);
      setReportTitle("Loan Statement");
    }
  }, [loanStatement]);

  useEffect(() => {
    if (repaymentSchedule) {
      setReport(repaymentSchedule);
      setReportTitle("Repayment Schedule");
    }
  }, [repaymentSchedule]);

  const activeLoans = tab === "running" ? runningLoans : guaranteedLoans;
  const loadingList =
    tab === "running" ? loadingRunningLoans : loadingGuaranteedLoans;

  const selectedLabel = useMemo(() => {
    if (reportTitle === "Repayment Schedule") return "repayment-schedule";
    return "loan-statement";
  }, [reportTitle]);

  const handleLoanStatement = useCallback(
    (item) => {
      dispatch(
        fetchLoanStatement({
          doc_no: getDocNo(item) || docNo,
          loan_no: getLoanNo(item),
        }),
      );
    },
    [dispatch, docNo],
  );

  const handleRepaymentSchedule = useCallback(
    (item) => {
      dispatch(
        fetchRepaymentSchedule({
          doc_no: getDocNo(item) || docNo,
          loan_no: getLoanNo(item),
        }),
      );
    },
    [dispatch, docNo],
  );

  const saveReport = useCallback(async () => {
    if (!report) return null;
    const mime = detectMime(report);
    const ext =
      mime === "application/pdf"
        ? "pdf"
        : mime === "image/jpeg"
          ? "jpg"
          : "png";
    const path = `${FileSystem.cacheDirectory}${selectedLabel}-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(path, cleanBase64(report), {
      encoding: "base64",
    });
    return { path, mime };
  }, [report, selectedLabel]);

  const handleShare = useCallback(async () => {
    try {
      const file = await saveReport();
      if (!file) return;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.path, {
          mimeType: file.mime,
          dialogTitle: `Share ${reportTitle}`,
          UTI:
            file.mime === "application/pdf" ? "com.adobe.pdf" : "public.image",
        });
      } else {
        await Share.share({ message: `${reportTitle}: ${file.path}` });
      }
    } catch (e) {
      console.log("Share failed:", e);
    }
  }, [reportTitle, saveReport]);

  return (
    <View style={s.container}>
      <View style={[s.navBar, { paddingTop: 10 }]}>
        <Text style={s.navTitle}>Loan Statements</Text>
        <TouchableOpacity style={s.iconBtn} onPress={loadLists}>
          <Feather name="refresh-cw" size={17} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === "running" && s.tabActive]}
          onPress={() => setTab("running")}
        >
          <Text style={[s.tabText, tab === "running" && s.tabTextActive]}>
            Running Loans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === "guaranteed" && s.tabActive]}
          onPress={() => setTab("guaranteed")}
        >
          <Text style={[s.tabText, tab === "guaranteed" && s.tabTextActive]}>
            Guaranteed
          </Text>
        </TouchableOpacity>
      </View>

      {reportLoading && (
        <View style={s.reportBanner}>
          <ActivityIndicator size="small" color={GREEN} />
          <Text style={s.reportBannerText}>Generating report...</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {loadingList && (
          <View style={s.centerWrap}>
            <ActivityIndicator color={GREEN} size="large" />
            <Text style={s.loadingTxt}>Loading loans...</Text>
          </View>
        )}

        {!loadingList && !!error && (
          <View style={s.centerWrap}>
            <MaterialCommunityIcons
              name="file-alert-outline"
              size={52}
              color="#E53935"
            />
            <Text style={s.errorTitle}>Could not load loans</Text>
            <Text style={s.errorSub}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={loadLists}>
              <Text style={s.retryTxt}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loadingList && !error && activeLoans.length === 0 && (
          <View style={s.centerWrap}>
            <MaterialCommunityIcons
              name="file-search-outline"
              size={52}
              color={TEXT_FAINT}
            />
            <Text style={s.emptyTitle}>No loans found</Text>
            <Text style={s.emptySub}>
              {tab === "running"
                ? "You do not have running loans."
                : "No guaranteed loans found."}
            </Text>
          </View>
        )}

        {!loadingList &&
          !error &&
          tab === "running" &&
          runningLoans.map((item, index) => (
            <LoanCard
              key={`${getLoanNo(item)}-${index}`}
              item={item}
              onLoanStatement={handleLoanStatement}
              onRepaymentSchedule={handleRepaymentSchedule}
              loadingStatement={loadingLoanStatement}
              loadingSchedule={loadingRepaymentSchedule}
            />
          ))}

        {!loadingList &&
          !error &&
          tab === "guaranteed" &&
          guaranteedLoans.map((item, index) => (
            <GuaranteedLoanCard
              key={`${getLoanNo(item)}-${index}`}
              item={item}
            />
          ))}
      </ScrollView>

      <Modal
        visible={!!report}
        animationType="slide"
        onRequestClose={() => setReport(null)}
      >
        <View style={[s.pdfScreen, { paddingTop: insets.top }]}>
          <View style={s.pdfHeader}>
            <TouchableOpacity onPress={() => setReport(null)} style={s.iconBtn}>
              <Ionicons name="chevron-down" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.navTitle}>{reportTitle}</Text>
            <TouchableOpacity onPress={handleShare} style={s.iconBtn}>
              <Ionicons name="share-outline" size={20} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          {report && detectMime(report) === "application/pdf" ? (
            <PdfViewer base64={report} />
          ) : (
            <ImageReportViewer base64={report} />
          )}

          <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color={GREEN} />
              <Text style={s.shareTxt}>Share {reportTitle}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.doneBtn} onPress={() => setReport(null)}>
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
    paddingBottom: 12,
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
  tabs: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: BG,
  },
  tabActive: { backgroundColor: GREEN_LIGHT },
  tabText: { fontSize: 13, fontWeight: "700", color: TEXT_FAINT },
  tabTextActive: { color: GREEN_DARK },
  reportBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: GREEN_LIGHT,
  },
  reportBannerText: { fontSize: 13, fontWeight: "600", color: GREEN_DARK },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 120, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 14,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  loanIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: TEXT_DARK },
  cardSub: { marginTop: 2, fontSize: 12, color: TEXT_FAINT },
  statusPill: {
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 11, fontWeight: "700", color: GREEN_DARK },
  metricRow: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, backgroundColor: BG, borderRadius: 10, padding: 10 },
  metricLabel: { fontSize: 11, color: TEXT_FAINT, marginBottom: 3 },
  metricValue: { fontSize: 13, fontWeight: "800", color: TEXT_DARK },
  actionRow: { flexDirection: "row", gap: 10 },
  outlineBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  outlineTxt: { color: GREEN, fontSize: 13, fontWeight: "800" },
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  primaryTxt: { color: "#fff", fontSize: 13, fontWeight: "800" },
  centerWrap: {
    flex: 1,
    minHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 28,
  },
  loadingTxt: { fontSize: 14, color: TEXT_FAINT },
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
  emptySub: { fontSize: 13, color: TEXT_FAINT, textAlign: "center" },
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
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  imageReportWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  imageReport: {
    width: W - 24,
    height: H - 180,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
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
