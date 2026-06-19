import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Alert,
  Modal,
  FlatList,
  Platform,
  Animated,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  fetchSourceAccounts,
  fetchDestAccounts,
  transferToBosa,
  transferFosa,
  resetTransfer,
  clearTransferError,
} from "../../../store/slices/transferSlice";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ─── Transfer type config ───
const TRANSFER_TYPES = [
  {
    key: "fosa_to_bosa",
    label: "FOSA → BOSA",
    sub: "Move funds to your savings",
    icon: "bank-transfer-in",
    color: "#7C3AED",
    bg: "#F5F3FF",
    internal: true,
  },
  {
    key: "fosa_internal",
    label: "Internal Transfer",
    sub: "Between Chuna members",
    icon: "swap-horizontal",
    color: GREEN,
    bg: GREEN_LIGHT,
    internal: true,
  },
  {
    key: "fosa_external",
    label: "External Transfer",
    sub: "To another bank account",
    icon: "bank-outline",
    color: "#0284C7",
    bg: "#EFF6FF",
    internal: false,
  },
];

// ─── bal_code icon + colour map ───
const BAL_CONFIG = {
  SHA: { icon: "certificate", color: "#7C3AED" },
  DEP: { icon: "piggy-bank", color: "#0284C7" },
  RSK: { icon: "shield-account", color: "#D97706" },
  ORD: { icon: "bank-outline", color: GREEN },
};

// ─── Helpers ───
function genDocNo(prefix = "TXN") {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

// ─── Summary row ───
function SummaryRow({ label, value, accent }) {
  return (
    <View style={sr.row}>
      <Text style={sr.label}>{label}</Text>
      <Text style={[sr.value, accent && { color: GREEN, fontWeight: "800" }]}>
        {value}
      </Text>
    </View>
  );
}
const sr = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: { fontSize: 13, color: TEXT_FAINT },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
    maxWidth: "60%",
    textAlign: "right",
  },
});

// ─── Account select modal ───
function AccountModal({
  visible,
  title,
  accounts,
  loading,
  selected,
  onSelect,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={am.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={am.sheet}>
        <View style={am.handle} />
        <View style={am.header}>
          <Text style={am.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={am.closeBtn}>
            <Ionicons name="close" size={20} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={am.centerWrap}>
            <ActivityIndicator color={GREEN} size="large" />
            <Text style={am.loadTxt}>Loading accounts…</Text>
          </View>
        ) : !accounts?.length ? (
          <View style={am.centerWrap}>
            <MaterialCommunityIcons
              name="bank-off-outline"
              size={40}
              color={TEXT_FAINT}
            />
            <Text style={am.emptyTxt}>No accounts available</Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item, i) => item.account_no ?? String(i)}
            contentContainerStyle={am.list}
            renderItem={({ item }) => {
              const isSelected = selected?.account_no === item.account_no;
              const cfg = BAL_CONFIG[item.bal_code] ?? {
                icon: "wallet-outline",
                color: GREEN,
              };
              const isActive =
                !item.account_status ||
                item.account_status?.toLowerCase() === "active";

              return (
                <TouchableOpacity
                  style={[
                    am.item,
                    isSelected && am.itemSelected,
                    !isActive && am.itemDisabled,
                  ]}
                  onPress={() => {
                    if (!isActive) return;
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={isActive ? 0.8 : 1}
                >
                  <View
                    style={[
                      am.itemIcon,
                      { backgroundColor: cfg.color + "20" },
                      isSelected && { backgroundColor: cfg.color },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={cfg.icon}
                      size={20}
                      color={isSelected ? "#fff" : cfg.color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[am.itemName, isSelected && { color: GREEN }]}>
                      {item.account_name}
                    </Text>
                    {item.account_no !== item.account_name && (
                      <Text style={am.itemNo}>{item.account_no}</Text>
                    )}
                    <View style={am.itemMeta}>
                      <Text style={am.itemBal}>KES {item.balances}</Text>
                      <View
                        style={[
                          am.srcBadge,
                          {
                            backgroundColor:
                              item.source === "FOSA" ? "#EFF6FF" : "#F5F3FF",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            am.srcTxt,
                            {
                              color:
                                item.source === "FOSA" ? "#0284C7" : "#7C3AED",
                            },
                          ]}
                        >
                          {item.source}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={GREEN} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
const am = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  title: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  centerWrap: { alignItems: "center", paddingVertical: 48, gap: 10 },
  loadTxt: { fontSize: 14, color: TEXT_FAINT },
  emptyTxt: { fontSize: 14, color: TEXT_FAINT },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F8FAF8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  itemSelected: { borderColor: GREEN, backgroundColor: "#F0FBF4" },
  itemDisabled: { opacity: 0.45 },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 3,
  },
  itemNo: { fontSize: 11, color: TEXT_FAINT, marginBottom: 4 },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemBal: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
  srcBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  srcTxt: { fontSize: 10, fontWeight: "700" },
});

// ─── Account selector row (tappable) ──────────────────────────────────────────
function AccountRow({ label, account, placeholder, loading, onPress, empty }) {
  const cfg = account
    ? (BAL_CONFIG[account.bal_code] ?? { icon: "wallet-outline", color: GREEN })
    : null;
  return (
    <TouchableOpacity
      style={[acr.wrap, empty && acr.wrapEmpty]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {cfg ? (
        <View style={[acr.icon, { backgroundColor: cfg.color + "20" }]}>
          <MaterialCommunityIcons name={cfg.icon} size={18} color={cfg.color} />
        </View>
      ) : (
        <View style={[acr.icon, { backgroundColor: "#F0F0F0" }]}>
          <MaterialCommunityIcons
            name="bank-outline"
            size={18}
            color={TEXT_FAINT}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={acr.label}>{label}</Text>
        {account ? (
          <>
            <Text style={acr.name}>{account.account_name}</Text>
            {account.account_no !== account.account_name && (
              <Text style={acr.no}>{account.account_no}</Text>
            )}
            <Text style={acr.bal}>KES {account.balances}</Text>
          </>
        ) : (
          <Text style={acr.placeholder}>
            {loading ? "Loading…" : placeholder}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={GREEN} />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={TEXT_FAINT} />
      )}
    </TouchableOpacity>
  );
}
const acr = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  wrapEmpty: { borderColor: "#FCA5A5", borderStyle: "dashed" },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    color: TEXT_FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  name: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  no: { fontSize: 11, color: TEXT_FAINT, marginTop: 2 },
  bal: { fontSize: 12, color: GREEN, fontWeight: "600", marginTop: 3 },
  placeholder: { fontSize: 14, color: TEXT_FAINT, fontStyle: "italic" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function TransferScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const seedAccountNo = route?.params?.account_no ?? "";
  const seedMobileNo = route?.params?.mobile_no ?? "";

  const {
    sourceAccounts,
    loadingSource,
    destAccounts,
    loadingDest,
    transferring,
    transferResult,
    error,
  } = useSelector((s) => s.transfer);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [transferType, setTransferType] = useState("fosa_to_bosa");
  const [sourceAccount, setSourceAccount] = useState(null);
  const [destAccount, setDestAccount] = useState(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showDestModal, setShowDestModal] = useState(false);
  const [extAccountNo, setExtAccountNo] = useState(""); // for external transfer

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { amount: "", reference: "" } });

  const amount = watch("amount");

  // ── Load accounts on mount ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(
      fetchSourceAccounts({
        account_no: seedAccountNo,
        mobile_no: seedMobileNo,
      }),
    );
    dispatch(
      fetchDestAccounts({ account_no: seedAccountNo, mobile_no: seedMobileNo }),
    );
  }, []);

  // ── Auto-select single source account ────────────────────────────────────────
  useEffect(() => {
    const list = sourceAccounts?.source_accounts ?? [];
    if (list.length === 1 && !sourceAccount) setSourceAccount(list[0]);
  }, [sourceAccounts]);

  // ── Reset destination when transfer type changes ──────────────────────────────
  useEffect(() => {
    setDestAccount(null);
    setExtAccountNo("");
  }, [transferType]);

  // ── Clean up on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => dispatch(resetTransfer());
  }, []);

  // ── Destination account lists per transfer type ───────────────────────────────
  const destList = (() => {
    if (!destAccounts) return [];
    if (transferType === "fosa_to_bosa")
      return destAccounts.bosa_accounts ?? [];
    if (transferType === "fosa_internal")
      return destAccounts.fosa_accounts ?? [];
    return []; // external — no modal, manual entry
  })();

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (data) => {
      if (!sourceAccount) {
        Alert.alert("Missing", "Please select a source account.");
        return;
      }

      const doc_no = genDocNo("TXN");
      const amount = Number(data.amount);

      if (transferType === "fosa_to_bosa") {
        if (!destAccount) {
          Alert.alert("Missing", "Please select a BOSA destination account.");
          return;
        }
        await dispatch(
          transferToBosa({
            source_account_no: sourceAccount.account_no,
            bosa_account: destAccount.account_name.toUpperCase(),
            amount,
            doc_no,
            app_type: "",
          }),
        )
          .unwrap()
          .catch(() => {});
      } else if (transferType === "fosa_internal") {
        if (!destAccount) {
          Alert.alert("Missing", "Please select a destination account.");
          return;
        }
        await dispatch(
          transferFosa({
            source_account_no: sourceAccount.account_no,
            destination_account: destAccount.account_no,
            amount,
            doc_no,
            app_type: "",
          }),
        )
          .unwrap()
          .catch(() => {});
      } else {
        // External — destination is a manually entered account number
        if (!extAccountNo.trim()) {
          Alert.alert(
            "Missing",
            "Please enter the destination account number.",
          );
          return;
        }
        await dispatch(
          transferFosa({
            source_account_no: sourceAccount.account_no,
            destination_account: extAccountNo.trim(),
            amount,
            doc_no,
            app_type: "",
          }),
        )
          .unwrap()
          .catch(() => {});
      }
    },
    [dispatch, sourceAccount, destAccount, extAccountNo, transferType],
  );

  const handleDone = useCallback(() => {
    dispatch(resetTransfer());
    reset();
    setSourceAccount(null);
    setDestAccount(null);
    navigation.goBack();
  }, [dispatch, navigation, reset]);

  // ── Success screen ────────────────────────────────────────────────────────────
  if (transferResult) {
    const typeCfg = TRANSFER_TYPES.find((t) => t.key === transferType);
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { alignItems: "center", paddingTop: 40 },
          ]}
        >
          {/* Icon */}
          <View style={s.successIcon}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>

          <Text style={s.successTitle}>Transfer successful!</Text>
          <Text style={s.successSub}>{typeCfg?.label} completed</Text>

          {/* Receipt */}
          <View style={s.receiptCard}>
            <Text style={s.receiptHead}>Transaction receipt</Text>
            <SummaryRow
              label="Amount"
              value={`KES ${Number(transferResult.amount ?? 0).toLocaleString()}`}
              accent
            />
            <SummaryRow
              label="From"
              value={
                transferResult.source_account_no ??
                sourceAccount?.account_no ??
                "—"
              }
            />
            <SummaryRow
              label="To"
              value={
                transferResult.bosa_account ??
                destAccount?.account_name ??
                extAccountNo ??
                "—"
              }
            />
            <SummaryRow
              label="Reference"
              value={transferResult.doc_no ?? "—"}
            />
            <SummaryRow
              label="Status"
              value={
                transferResult.status || transferResult.description
                  ? "Successful"
                  : "Pending"
              }
            />
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { width: "100%" }]}
            onPress={handleDone}
          >
            <Text style={s.primaryBtnTxt}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const typeCfg = TRANSFER_TYPES.find((t) => t.key === transferType);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.container]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Transfer type selector ── */}
          <Text style={s.sectionLabel}>Transfer type</Text>
          <View style={s.typeRow}>
            {TRANSFER_TYPES.map((t) => {
              const active = transferType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    s.typeCard,
                    active && s.typeCardActive,
                    active && { borderColor: t.color },
                  ]}
                  onPress={() => setTransferType(t.key)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      s.typeIconWrap,
                      { backgroundColor: active ? t.color : t.bg },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={t.icon}
                      size={20}
                      color={active ? "#fff" : t.color}
                    />
                  </View>
                  <Text style={[s.typeLabel, active && { color: t.color }]}>
                    {t.label}
                  </Text>
                  <Text style={s.typeSub}>{t.sub}</Text>
                  {t.internal && (
                    <View style={s.internalBadge}>
                      <Text style={s.internalTxt}>Internal</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Source account ── */}
          <Text style={s.sectionLabel}>From</Text>
          <AccountRow
            label="Source account"
            account={sourceAccount}
            placeholder="Tap to select source account"
            loading={loadingSource}
            empty={!sourceAccount}
            onPress={() => setShowSourceModal(true)}
          />

          {/* ── Destination account ── */}
          <Text style={s.sectionLabel}>To</Text>
          {transferType === "fosa_external" ? (
            // External — manual text input
            <View style={[s.extInputWrap, errors.destAccount && s.inputError]}>
              <MaterialCommunityIcons
                name="bank-outline"
                size={18}
                color={TEXT_FAINT}
              />
              <TextInput
                style={s.extInput}
                placeholder="Enter destination account number"
                placeholderTextColor={TEXT_FAINT}
                value={extAccountNo}
                onChangeText={setExtAccountNo}
                autoCapitalize="characters"
              />
            </View>
          ) : (
            <AccountRow
              label={
                transferType === "fosa_to_bosa"
                  ? "BOSA account"
                  : "Destination account"
              }
              account={destAccount}
              placeholder={
                transferType === "fosa_to_bosa"
                  ? "Tap to select BOSA account"
                  : "Tap to select destination"
              }
              loading={loadingDest}
              empty={!destAccount}
              onPress={() => setShowDestModal(true)}
            />
          )}

          {/* ── Amount ── */}
          <Text style={s.sectionLabel}>Amount</Text>
          <Controller
            control={control}
            name="amount"
            rules={{
              required: "Enter an amount.",
              validate: (v) =>
                Number(v) > 0 || "Amount must be greater than zero.",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Enter a valid amount.",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[s.amountWrap, errors.amount && s.amountError]}>
                <Text style={s.amountPrefix}>KES</Text>
                <TextInput
                  style={s.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={TEXT_FAINT}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </View>
            )}
          />
          {errors.amount && (
            <Text style={s.fieldError}>{errors.amount.message}</Text>
          )}

          {/* ── Live summary ── */}
          {!!amount &&
            Number(amount) > 0 &&
            sourceAccount &&
            (destAccount || extAccountNo) && (
              <View style={s.summaryCard}>
                <Text style={s.summaryTitle}>Transfer summary</Text>
                <SummaryRow label="Type" value={typeCfg?.label} />
                <SummaryRow label="From" value={sourceAccount.account_name} />
                <SummaryRow
                  label="To"
                  value={destAccount?.account_name ?? extAccountNo}
                />
                <SummaryRow
                  label="Amount"
                  value={`KES ${Number(amount).toLocaleString()}`}
                  accent
                />
              </View>
            )}

          {/* ── Error banner ── */}
          {!!error && (
            <TouchableOpacity
              style={s.errorBanner}
              onPress={() => dispatch(clearTransferError())}
            >
              <Ionicons name="warning-outline" size={16} color="#C62828" />
              <Text style={s.errorTxt}>{error}</Text>
              <Ionicons name="close" size={14} color="#C62828" />
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Submit footer ── */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[
              s.primaryBtn,
              (transferring || !sourceAccount) && s.primaryBtnDisabled,
              { backgroundColor: typeCfg?.color ?? GREEN },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={transferring || !sourceAccount}
          >
            {transferring ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={typeCfg?.icon ?? "bank-transfer"}
                  size={20}
                  color="#fff"
                />
                <Text style={s.primaryBtnTxt}>
                  {transferType === "fosa_to_bosa"
                    ? "Transfer to BOSA"
                    : transferType === "fosa_internal"
                      ? "Transfer"
                      : "Send Transfer"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Source account modal ── */}
        <AccountModal
          visible={showSourceModal}
          title="Select source account"
          accounts={sourceAccounts?.source_accounts ?? []}
          loading={loadingSource}
          selected={sourceAccount}
          onSelect={setSourceAccount}
          onClose={() => setShowSourceModal(false)}
        />

        {/* ── Destination account modal ── */}
        <AccountModal
          visible={showDestModal}
          title={
            transferType === "fosa_to_bosa"
              ? "Select BOSA account"
              : "Select destination account"
          }
          accounts={destList}
          loading={loadingDest}
          selected={destAccount}
          onSelect={setDestAccount}
          onClose={() => setShowDestModal(false)}
        />
      </View>
    </KeyboardAvoidingView>
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
  navTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },

  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 4,
  },

  // Transfer type cards
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  typeCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  typeCardActive: { backgroundColor: "#FAFFF8" },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
  },
  typeSub: {
    fontSize: 9,
    color: TEXT_FAINT,
    textAlign: "center",
    lineHeight: 13,
  },
  internalBadge: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 2,
  },
  internalTxt: { fontSize: 9, color: GREEN, fontWeight: "700" },

  // Amount
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 6,
  },
  amountError: { borderColor: "#E53935" },
  amountPrefix: { fontSize: 20, fontWeight: "700", color: TEXT_MID },
  amountInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: "800",
    color: TEXT_DARK,
    padding: 0,
  },
  fieldError: { fontSize: 12, color: "#C62828", marginBottom: 14 },

  // External account input
  extInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  inputError: { borderColor: "#E53935" },
  extInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    padding: 0,
  },

  // Summary
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_MID,
    marginBottom: 10,
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorTxt: { flex: 1, fontSize: 13, color: "#C62828" },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Success
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  successSub: { fontSize: 14, color: TEXT_FAINT, marginBottom: 28 },
  receiptCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  receiptHead: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_MID,
    marginBottom: 12,
  },
});
