import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  initiateDeposit,
  resetDeposit,
  clearDepositError,
} from "../../../store/slices/depositSlice";
import { PhoneInput } from "../../../components/PhoneInput";
import { fetchWithdrawableAccounts } from "../../../store/slices/withdrawSlice";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ── Quick amount chip ──
function QuickChip({ label, onPress }) {
  return (
    <TouchableOpacity style={qc.chip} onPress={onPress} activeOpacity={0.75}>
      <Text style={qc.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const qc = StyleSheet.create({
  chip: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: "center",
    flex: 1,
  },
  label: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
});

// ── Summary row ──
function SummaryRow({ label, value, accent, mono }) {
  return (
    <View style={sr.row}>
      <Text style={sr.label}>{label}</Text>
      <Text
        style={[
          sr.value,
          accent && { color: GREEN, fontWeight: "800" },
          mono && {
            fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
            fontSize: 12,
          },
        ]}
      >
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
    maxWidth: "55%",
    textAlign: "right",
  },
});

// ── Status badge ──
function StatusBadge({ status }) {
  const cfg = {
    queued: { bg: "#FEF3C7", color: "#92400E", label: "Queued" },
    success: { bg: GREEN_LIGHT, color: GREEN, label: "Success" },
    failed: { bg: "#FEE2E2", color: "#C62828", label: "Failed" },
    pending: { bg: "#EFF6FF", color: "#1D4ED8", label: "Pending" },
  }[status?.toLowerCase()] ?? {
    bg: "#F4F6F8",
    color: TEXT_FAINT,
    label: status,
  };

  return (
    <View style={[sb.wrap, { backgroundColor: cfg.bg }]}>
      <View style={[sb.dot, { backgroundColor: cfg.color }]} />
      <Text style={[sb.txt, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { fontSize: 12, fontWeight: "700" },
});

// ── Main screen ──
export default function DepositScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  // Account info passed from HomeScreen / balance card
  const accountNo = route?.params?.account_no ?? "";
  const memberNo = route?.params?.member_no ?? "";
  //   const phone = route?.params?.phone ?? "";

  const { depositing, depositResult, error } = useSelector(
    (state) => state.deposit,
  );

  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { amount: "" } });

  const amount = watch("amount");

  // Clean up on unmount
  useEffect(() => {
    return () => dispatch(resetDeposit());
  }, []);

  // ── Submit ──
  const onSubmit = useCallback(
    async (data) => {
      const doc_no = `DEP-${Date.now().toString().slice(-8)}`;
      await dispatch(
        initiateDeposit({
          phone: phone,
          amount: Number(data.amount),
          account_no: accountNo,
          member_no: memberNo,
          doc_no,
        }),
      )
        .unwrap()
        .catch(() => {});
    },
    [dispatch, phone, accountNo, memberNo],
  );

  const handleDone = useCallback(() => {
    dispatch(resetDeposit());
    navigation.goBack();
  }, [dispatch, navigation]);

  // ── Success view ──
  if (depositResult) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[s.scroll, { alignItems: "center" }]}
        >
          {/* Icon */}
          <View style={s.successIcon}>
            <MaterialCommunityIcons
              name="cellphone-check"
              size={44}
              color="#fff"
            />
          </View>

          <Text style={s.successTitle}>Check your phone!</Text>
          <Text style={s.successSub}>
            An M-Pesa STK push has been sent to{"\n"}
            <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
              {depositResult.phone}
            </Text>
            {"\n"}Enter your M-Pesa PIN to complete the deposit.
          </Text>

          {/* Result card */}
          <View style={s.resultCard}>
            <View style={s.resultCardHeader}>
              <Text style={s.resultCardTitle}>Deposit details</Text>
              <StatusBadge status={depositResult.status} />
            </View>

            <SummaryRow
              label="Amount"
              value={`KES ${Number(depositResult.amount).toLocaleString()}`}
              accent
            />
            <SummaryRow label="Account" value={depositResult.account_no} />
            <SummaryRow label="Phone" value={depositResult.phone} />
            <SummaryRow label="Reference" value={depositResult.doc_no} mono />
            <SummaryRow
              label="Request ID"
              value={depositResult.checkout_request_id}
              mono
            />
          </View>

          {/* Info note */}
          <View style={s.infoNote}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#1D4ED8"
            />
            <Text style={s.infoNoteTxt}>
              If you don't receive the prompt within 30 seconds, check that your
              phone is on and try again.
            </Text>
          </View>

          <TouchableOpacity style={s.primaryBtn} onPress={handleDone}>
            <Text style={s.primaryBtnTxt}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Form view ───
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.container]}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* M-Pesa header */}
          <View style={s.mpesaHeader}>
            <View style={s.mpesaIconWrap}>
              <Text style={{ fontSize: 32 }}>
                <AntDesign name="mobile" size={24} color="black" />
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.mpesaHeaderTitle}>M-Pesa STK Push</Text>
              <Text style={s.mpesaHeaderSub}>
                You'll receive a payment prompt on{" "}
                <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
                  {phone}
                </Text>
              </Text>
            </View>
          </View>

          {/* Amount input */}
          <Text style={s.fieldLabel}>
            Amount <Text style={{ color: "#E53935" }}>*</Text>
          </Text>
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
              <View style={[s.amountWrap, errors.amount && s.amountWrapError]}>
                <Text style={s.amountPrefix}>KES</Text>
                <TextInput
                  style={s.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={TEXT_FAINT}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoFocus
                />
              </View>
            )}
          />
          {errors.amount && (
            <Text style={s.fieldError}>{errors.amount.message}</Text>
          )}

          {/* Quick amounts */}
          <Text style={s.quickLabel}>Quick amounts</Text>
          <View style={s.quickRow}>
            {[500, 1000, 2000, 5000].map((n) => (
              <QuickChip
                key={n}
                label={`KES ${n.toLocaleString()}`}
                onPress={() =>
                  setValue("amount", String(n), { shouldValidate: true })
                }
              />
            ))}
          </View>
          <View style={[s.quickRow, { marginTop: 8 }]}>
            {[10000, 20000, 50000].map((n) => (
              <QuickChip
                key={n}
                label={`KES ${(n / 1000).toFixed(0)}K`}
                onPress={() =>
                  setValue("amount", String(n), { shouldValidate: true })
                }
              />
            ))}
          </View>

          {/* Account info */}
          <View style={s.accountCard}>
            <View style={s.accountCardRow}>
              <MaterialCommunityIcons
                name="bank-outline"
                size={18}
                color={GREEN}
              />
              <View style={{ flex: 1 }}>
                <Text style={s.accountCardLabel}>Depositing into</Text>
                <Text style={s.accountCardValue}>{accountNo}</Text>
              </View>
              <View style={s.activeChip}>
                <Text style={s.activeChipTxt}>Active</Text>
              </View>
            </View>
          </View>

          {/* Live summary */}
          {!!amount && Number(amount) > 0 && (
            <View style={s.summaryCard}>
              <Text style={s.summaryTitle}>Transaction summary</Text>
              <SummaryRow
                label="You'll pay"
                value={`KES ${Number(amount).toLocaleString()}`}
                accent
              />
              <SummaryRow label="To account" value={accountNo} />
              <SummaryRow label="Via" value="M-Pesa STK Push" />
            </View>
          )}

          {/* Error banner */}
          {!!error && (
            <TouchableOpacity
              style={s.errorBanner}
              onPress={() => dispatch(clearDepositError())}
            >
              <Ionicons name="warning-outline" size={16} color="#C62828" />
              <Text style={s.errorTxt}>{error}</Text>
              <Ionicons name="close" size={14} color="#C62828" />
            </TouchableOpacity>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[s.primaryBtn, depositing && s.primaryBtnDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={depositing}
          >
            {depositing ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={s.primaryBtnTxt}>Sending prompt…</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="cellphone-arrow-down"
                  size={20}
                  color="#fff"
                />
                <Text style={s.primaryBtnTxt}>Send M-Pesa prompt</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={s.disclaimer}>
            By depositing you agree to Chuna Sacco's terms. Standard M-Pesa
            charges may apply.
          </Text>
        </ScrollView>
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
  backBtn: {
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

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 },

  // M-Pesa header
  mpesaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  mpesaIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFF8E1",
    alignItems: "center",
    justifyContent: "center",
  },
  mpesaHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  mpesaHeaderSub: { fontSize: 13, color: TEXT_FAINT, lineHeight: 18 },

  // Amount
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 6,
    gap: 10,
  },
  amountWrapError: { borderColor: "#E53935" },
  amountPrefix: { fontSize: 20, fontWeight: "700", color: TEXT_MID },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "800",
    color: TEXT_DARK,
    padding: 0,
  },
  fieldError: { fontSize: 12, color: "#C62828", marginBottom: 16 },

  // Quick amounts
  quickLabel: {
    fontSize: 12,
    color: TEXT_FAINT,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 8,
  },
  quickRow: { flexDirection: "row", gap: 8 },

  // Account card
  accountCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  accountCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  accountCardLabel: { fontSize: 11, color: TEXT_FAINT, marginBottom: 3 },
  accountCardValue: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },
  activeChip: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeChipTxt: { fontSize: 11, fontWeight: "700", color: GREEN },

  // Summary card
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  errorTxt: { flex: 1, fontSize: 13, color: "#C62828" },

  // Buttons
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 16,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },

  disclaimer: {
    fontSize: 11,
    color: TEXT_FAINT,
    textAlign: "center",
    lineHeight: 16,
  },

  // Success
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginTop: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  successSub: {
    fontSize: 14,
    color: TEXT_FAINT,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  resultCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultCardTitle: { fontSize: 13, fontWeight: "700", color: TEXT_MID },

  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    width: "100%",
  },
  infoNoteTxt: { flex: 1, fontSize: 13, color: "#1D4ED8", lineHeight: 18 },
});
