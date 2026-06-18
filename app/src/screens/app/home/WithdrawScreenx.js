import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  Platform,
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
import {
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Application from "expo-application";
import {
  initiateWithdraw,
  verifyWithdraw,
  resetWithdraw,
  clearWithdrawError,
} from "../../../store/slices/withdrawSlice";

const GREEN = "#4CAF20";
let GREEN_DARK = "#013220";
const GREEN_LIGHT = "#E8F5E9";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ── Step indicator ──
function StepDots({ step }) {
  return (
    <View style={sd.row}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[sd.dot, step === s && sd.dotActive, step > s && sd.dotDone]}
        >
          {step > s && <Ionicons name="checkmark" size={10} color="#fff" />}
        </View>
      ))}
    </View>
  );
}
const sd = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: { backgroundColor: GREEN },
  dotDone: { backgroundColor: (GREEN_DARK = "#388E3C") },
});

// ── OTP single-digit input ──
function OtpInput({ length = 6, value, onChange }) {
  const inputRef = useRef(null);
  const digits = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={otp.wrap}
    >
      {digits.map((d, i) => (
        <View
          key={i}
          style={[
            otp.cell,
            value.length === i && otp.cellActive,
            d && otp.cellFilled,
          ]}
        >
          <Text style={otp.digit}>{d || ""}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, "").slice(0, length))}
        keyboardType="numeric"
        maxLength={length}
        style={otp.hidden}
        autoFocus
      />
    </TouchableOpacity>
  );
}
const otp = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 8,
  },
  cell: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cellActive: { borderColor: GREEN, backgroundColor: GREEN_LIGHT },
  cellFilled: { borderColor: GREEN },
  digit: { fontSize: 22, fontWeight: "800", color: TEXT_DARK },
  hidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
});

// ── Countdown timer ──
function Countdown({ seconds }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const m = Math.floor(left / 60)
    .toString()
    .padStart(2, "0");
  const s = (left % 60).toString().padStart(2, "0");
  return (
    <Text
      style={{
        fontSize: 13,
        color: left < 60 ? "#E53935" : TEXT_FAINT,
        textAlign: "center",
      }}
    >
      Code expires in{" "}
      <Text style={{ fontWeight: "700" }}>
        {m}:{s}
      </Text>
    </Text>
  );
}

// ── Summary row ──
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
  value: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
});

// ─── Main screen ───
export default function WithdrawScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  // Pull account info passed from HomeScreen balance card
  const accountNo = route?.params?.account_no ?? "01-13488-01";
  const mobileNo = route?.params?.mobile_no ?? "";
  const balance = route?.params?.balance ?? 100000;

  const { initiating, verifying, otpData, withdrawResult, error } = useSelector(
    (state) => state.withdraw,
  );

  // step: 1 = form, 2 = otp, 3 = success
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { amount: "", account_no: accountNo },
  });

  const amount = watch("amount");

  // Move to OTP step when otpData arrives
  useEffect(() => {
    if (otpData) setStep(2);
  }, [otpData]);

  // Move to success step when result arrives
  useEffect(() => {
    if (withdrawResult) setStep(3);
  }, [withdrawResult]);

  // Clean up on unmount
  useEffect(() => {
    return () => dispatch(resetWithdraw());
  }, []);

  // ── Step 1 submit ──
  const onSubmitAmount = useCallback(
    async (data) => {
      const today = new Date().toISOString().split("T")[0]; // "2026-06-18"
      await dispatch(
        initiateWithdraw({
          account_no: data.account_no,
          amount: Number(data.amount),
          doc_no: `MPE-${Date.now().toString().slice(-6)}`, // simple unique ref
          transaction_date: today,
          app_type:
            Device.osName || (Platform.OS === "ios" ? "iOS" : "Android"),
        }),
      )
        .unwrap()
        .catch(() => {}); // error surfaced via Redux state
    },
    [dispatch],
  );

  // ── Step 2 OTP verify ──
  const onVerifyOtp = useCallback(async () => {
    if (otpCode.length < 6) {
      Alert.alert("Invalid code", "Please enter the full 6-digit code.");
      return;
    }
    await dispatch(verifyWithdraw({ otp: otpCode }))
      .unwrap()
      .catch(() => {});
  }, [dispatch, otpCode]);

  const handleDone = useCallback(() => {
    dispatch(resetWithdraw());
    navigation.goBack();
  }, [dispatch, navigation]);

  // ── Renders ──
  const renderStep1 = () => (
    <>
      <StepDots step={1} />

      <Text style={s.stepTitle}>Enter amount</Text>
      <Text style={s.stepSub}>Funds will be sent to your M-Pesa number</Text>

      {/* Available balance chip */}
      <View style={s.balanceChip}>
        <MaterialCommunityIcons name="wallet-outline" size={16} color={GREEN} />
        <Text style={s.balanceChipTxt}>
          Available:{" "}
          <Text style={{ fontWeight: "800", color: GREEN }}>
            KES {Number(balance).toLocaleString()}
          </Text>
        </Text>
      </View>

      {/* Amount field */}
      <Controller
        control={control}
        name="amount"
        rules={{
          required: "Enter an amount.",
          validate: (v) => {
            if (Number(v) <= 0) return "Amount must be greater than zero.";
            if (Number(v) > balance) return "Amount exceeds available balance.";
            return true;
          },
          pattern: {
            value: /^\d+(\.\d{1,2})?$/,
            message: "Enter a valid amount.",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={s.amountWrap}>
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

      {/* Account selector (static for now — extend with fetchWithdrawableAccounts) */}
      <View style={s.accountRow}>
        <MaterialCommunityIcons
          name="bank-outline"
          size={18}
          color={TEXT_FAINT}
        />
        <View style={{ flex: 1 }}>
          <Text style={s.accountLabel}>From account</Text>
          <Text style={s.accountValue}>{accountNo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={TEXT_FAINT} />
      </View>

      {/* M-Pesa destination note */}
      <View style={s.mpesaNote}>
        <View style={s.mpesaIconWrap}>
          <Text style={{ fontSize: 20 }}>📱</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.mpesaNoteTitle}>Sending to M-Pesa</Text>
          <Text style={s.mpesaNoteSub}>
            Funds will be sent to the phone number linked to your account
          </Text>
        </View>
      </View>

      {/* Error banner */}
      {!!error && (
        <TouchableOpacity
          style={s.errorBanner}
          onPress={() => dispatch(clearWithdrawError())}
        >
          <Ionicons name="warning-outline" size={16} color="#C62828" />
          <Text style={s.errorTxt}>{error}</Text>
          <Ionicons name="close" size={14} color="#C62828" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[s.primaryBtn, initiating && s.primaryBtnDisabled]}
        onPress={handleSubmit(onSubmitAmount)}
        disabled={initiating}
      >
        {initiating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={s.primaryBtnTxt}>Continue</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <StepDots step={2} />

      <Text style={s.stepTitle}>Enter verification code</Text>
      <Text style={s.stepSub}>
        A 6-digit code was sent to{" "}
        <Text style={{ fontWeight: "700", color: TEXT_DARK }}>
          {otpData?.phone ?? "your phone"}
        </Text>
      </Text>

      {/* Transaction summary */}
      <View style={s.summaryCard}>
        <SummaryRow
          label="Amount"
          value={`KES ${Number(otpData?.amount ?? 0).toLocaleString()}`}
          accent
        />
        <SummaryRow label="Account" value={otpData?.account_no ?? "—"} />
        <SummaryRow label="Reference" value={otpData?.doc_no ?? "—"} />
      </View>

      {/* OTP input */}
      <OtpInput length={6} value={otpCode} onChange={setOtpCode} />

      {/* Countdown */}
      {otpData?.expires_in && (
        <View style={{ marginTop: 12, marginBottom: 4 }}>
          <Countdown seconds={otpData.expires_in} />
        </View>
      )}

      {/* Error */}
      {!!error && (
        <TouchableOpacity
          style={[s.errorBanner, { marginTop: 14 }]}
          onPress={() => dispatch(clearWithdrawError())}
        >
          <Ionicons name="warning-outline" size={16} color="#C62828" />
          <Text style={s.errorTxt}>{error}</Text>
          <Ionicons name="close" size={14} color="#C62828" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          s.primaryBtn,
          { marginTop: 20 },
          (verifying || otpCode.length < 6) && s.primaryBtnDisabled,
        ]}
        onPress={onVerifyOtp}
        disabled={verifying || otpCode.length < 6}
      >
        {verifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.primaryBtnTxt}>Verify & withdraw</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={s.ghostBtn}
        onPress={() => {
          setStep(1);
          dispatch(resetWithdraw());
          setOtpCode("");
        }}
      >
        <Text style={s.ghostBtnTxt}>← Change amount</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <View style={s.successWrap}>
      {/* Icon */}
      <View style={s.successIcon}>
        <Ionicons name="checkmark" size={40} color="#fff" />
      </View>

      <Text style={s.successTitle}>Withdrawal successful!</Text>
      <Text style={s.successSub}>Your funds are on their way to M-Pesa</Text>

      {/* Receipt */}
      <View style={s.receiptCard}>
        <Text style={s.receiptHead}>Transaction receipt</Text>
        <SummaryRow
          label="Amount"
          value={`KES ${Number(withdrawResult?.amount ?? 0).toLocaleString()}`}
          accent
        />
        <SummaryRow label="Account" value={withdrawResult?.account_no ?? "—"} />
        <SummaryRow label="Reference" value={withdrawResult?.doc_no ?? "—"} />
        <SummaryRow
          label="Date"
          value={withdrawResult?.transaction_date ?? "—"}
        />
      </View>

      <TouchableOpacity style={s.primaryBtn} onPress={handleDone}>
        <Text style={s.primaryBtnTxt}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
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

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 14,
    color: TEXT_FAINT,
    marginBottom: 24,
    lineHeight: 20,
  },

  // Balance chip
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  balanceChipTxt: { fontSize: 14, color: TEXT_MID },

  // Amount input
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 6,
    gap: 10,
  },
  amountPrefix: { fontSize: 20, fontWeight: "700", color: TEXT_MID },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "800",
    color: TEXT_DARK,
    padding: 0,
  },
  fieldError: {
    fontSize: 12,
    color: "#C62828",
    marginBottom: 16,
    marginTop: 2,
  },

  // Account row
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  accountLabel: { fontSize: 11, color: TEXT_FAINT, marginBottom: 3 },
  accountValue: { fontSize: 14, fontWeight: "700", color: TEXT_DARK },

  // M-Pesa note
  mpesaNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  mpesaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF3CD",
    alignItems: "center",
    justifyContent: "center",
  },
  mpesaNoteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  mpesaNoteSub: { fontSize: 12, color: "#92400E", lineHeight: 17 },

  // Summary card
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },

  // Error banner
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
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    width: "100%",
    textAlign: "center",
  },
  ghostBtn: { alignItems: "center", paddingVertical: 14, marginTop: 4 },
  ghostBtnTxt: { fontSize: 14, color: TEXT_FAINT, fontWeight: "500" },

  // Success
  successWrap: { alignItems: "center", paddingTop: 20 },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: TEXT_FAINT,
    marginBottom: 28,
    textAlign: "center",
  },
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
