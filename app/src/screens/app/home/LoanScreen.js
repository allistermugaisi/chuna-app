import React, { useEffect, useState, useCallback, useRef } from "react";
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
  FlatList,
  Modal,
  Alert,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  fetchFosaProducts,
  applyLoan,
  submitLoan,
  resetLoan,
  clearLoanError,
} from "../../../store/slices/loanSlice";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ─── Steps ───
const STEPS = ["Product", "Details", "Review"];

// ─── Step indicator ───
function StepBar({ current }) {
  return (
    <View style={sb.row}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <View style={sb.item}>
              <View
                style={[
                  sb.circle,
                  done && sb.circleDone,
                  active && sb.circleActive,
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={[sb.num, active && { color: "#fff" }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  sb.label,
                  (active || done) && { color: TEXT_DARK, fontWeight: "700" },
                ]}
              >
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[sb.line, done && sb.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
const sb = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  item: { alignItems: "center", gap: 4 },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: { backgroundColor: GREEN, borderColor: GREEN },
  circleDone: { backgroundColor: GREEN_DARK, borderColor: GREEN_DARK },
  num: { fontSize: 12, fontWeight: "700", color: TEXT_FAINT },
  label: { fontSize: 11, color: TEXT_FAINT },
  line: { flex: 1, height: 2, backgroundColor: BORDER, marginBottom: 14 },
  lineDone: { backgroundColor: GREEN },
});

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

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}
        {required && <Text style={{ color: "#E53935" }}> *</Text>}
      </Text>
      {children}
      {hint && !error && <Text style={f.hint}>{hint}</Text>}
      {error && <Text style={f.error}>{error}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginBottom: 8 },
  hint: { fontSize: 11, color: TEXT_FAINT, marginTop: 5, lineHeight: 15 },
  error: { fontSize: 11, color: "#C62828", marginTop: 5, fontWeight: "500" },
});

// ─── Loan product card ────────────────────────────────────────────────────────
function ProductCard({ product, selected, onPress }) {
  const isActive = selected?.product_code === product.product_code;
  return (
    <TouchableOpacity
      style={[pc.card, isActive && pc.cardActive]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Header */}
      <View style={pc.header}>
        <View style={[pc.iconWrap, isActive && { backgroundColor: GREEN }]}>
          <MaterialCommunityIcons
            name="bank-outline"
            size={20}
            color={isActive ? "#fff" : GREEN}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[pc.name, isActive && { color: GREEN }]}>
            {product.product_description}
          </Text>
          <Text style={pc.code}>{product.product_code}</Text>
        </View>
        {isActive && (
          <Ionicons name="checkmark-circle" size={22} color={GREEN} />
        )}
      </View>

      {/* Key stats */}
      <View style={pc.statsRow}>
        <View style={pc.stat}>
          <Text style={pc.statVal}>{product.interest}%</Text>
          <Text style={pc.statLbl}>Interest</Text>
        </View>
        <View style={pc.statDivider} />
        <View style={pc.stat}>
          <Text style={pc.statVal}>{product.installment_period}mo</Text>
          <Text style={pc.statLbl}>Period</Text>
        </View>
        <View style={pc.statDivider} />
        <View style={pc.stat}>
          <Text style={pc.statVal}>
            {Number(product.maximum_loan_amt).toLocaleString()}
          </Text>
          <Text style={pc.statLbl}>Max (KES)</Text>
        </View>
        <View style={pc.statDivider} />
        <View style={pc.stat}>
          <Text style={pc.statVal}>{product.min_no_of_guarantors}</Text>
          <Text style={pc.statLbl}>Guarantors</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={pc.badgeRow}>
        <View style={pc.badge}>
          <Ionicons name="refresh-outline" size={11} color={TEXT_MID} />
          <Text style={pc.badgeTxt}>{product.repayment_method}</Text>
        </View>
        {product.deposit_multiplier !== "0" && (
          <View style={pc.badge}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={11}
              color={TEXT_MID}
            />
            <Text style={pc.badgeTxt}>
              {product.deposit_multiplier}× deposit
            </Text>
          </View>
        )}
        {product.min_loan_amt !== "0" && (
          <View style={pc.badge}>
            <Ionicons name="arrow-up-outline" size={11} color={TEXT_MID} />
            <Text style={pc.badgeTxt}>
              Min KES {Number(product.min_loan_amt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
const pc = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardActive: { borderColor: GREEN, backgroundColor: "#FAFFFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 14, fontWeight: "700", color: TEXT_DARK, marginBottom: 2 },
  code: { fontSize: 11, color: TEXT_FAINT },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAF8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  stat: { flex: 1, alignItems: "center" },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 3,
  },
  statLbl: { fontSize: 10, color: TEXT_FAINT },
  statDivider: { width: 1, backgroundColor: BORDER },
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeTxt: { fontSize: 11, color: TEXT_MID, fontWeight: "500" },
});

// ─── Numeric input ───
function NumInput({
  control,
  name,
  rules,
  placeholder,
  prefix = "KES",
  error,
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={[ni.wrap, error && ni.wrapError]}>
          <Text style={ni.prefix}>{prefix}</Text>
          <TextInput
            style={ni.input}
            placeholder={placeholder ?? "0"}
            placeholderTextColor={TEXT_FAINT}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        </View>
      )}
    />
  );
}
const ni = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  wrapError: { borderColor: "#E53935" },
  prefix: { fontSize: 13, fontWeight: "700", color: TEXT_MID },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    padding: 0,
  },
});

// ─── Main screen ───
export default function LoanScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const {
    loanProducts,
    loadingProducts,
    applying,
    applyResult,
    submitting,
    submitResult,
    error,
  } = useSelector((s) => s.loan);

  const [step, setStep] = useState(0); // 0=product, 1=details, 2=review
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loan_amount: "",
      loan_purpose: "",
      basic_pay: "",
      allowances: "",
      deductions: "",
      house_allowances: "",
      transport_allowances: "",
    },
  });

  const formValues = watch();

  // ── Load products on mount ───
  useEffect(() => {
    dispatch(fetchFosaProducts());
  }, []);

  // ── Move to review after apply succeeds ──
  useEffect(() => {
    if (applyResult) setStep(2);
  }, [applyResult]);

  // ── Clean up on unmount ───
  useEffect(() => {
    return () => dispatch(resetLoan());
  }, []);

  // ── Step 0 → 1 (product selected, go to details) ──
  const handleSelectProduct = useCallback(() => {
    if (!selectedProduct) {
      Alert.alert(
        "Select product",
        "Please select a loan product to continue.",
      );
      return;
    }
    setStep(1);
  }, [selectedProduct]);

  // ── Step 1 → apply (submit form) ───
  const onApply = useCallback(
    async (data) => {
      if (!selectedProduct) return;
      await dispatch(
        applyLoan({
          loan_type: selectedProduct.product_code,
          loan_amount: Number(data.loan_amount),
          repayment_period: selectedProduct.installment_period,
          basic_pay: Number(data.basic_pay),
          allowances: Number(data.allowances),
          deductions: Number(data.deductions),
          loan_purpose: data.loan_purpose.trim(),
          house_allowances: Number(data.house_allowances),
          transport_allowances: Number(data.transport_allowances),
        }),
      )
        .unwrap()
        .catch(() => {});
    },
    [dispatch, selectedProduct],
  );

  // ── Step 2 → submit ──────────────────────────────────────────────────────────
  const onSubmit = useCallback(async () => {
    if (!applyResult?.application_no) return;
    Alert.alert(
      "Submit loan?",
      "Once submitted, this application will be sent for review. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            await dispatch(submitLoan({ loan_no: applyResult.application_no }))
              .unwrap()
              .catch(() => {});
          },
        },
      ],
    );
  }, [dispatch, applyResult]);

  const handleDone = useCallback(() => {
    dispatch(resetLoan());
    navigation.goBack();
  }, [dispatch, navigation]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (submitResult) {
    return (
      <View style={[s.container]}>
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { alignItems: "center", paddingTop: 48 },
          ]}
        >
          <View style={s.successIcon}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
          <Text style={s.successTitle}>Loan submitted!</Text>
          <Text style={s.successSub}>{submitResult.description}</Text>

          <View style={s.receiptCard}>
            <Text style={s.receiptHead}>Application details</Text>
            <SummaryRow
              label="Loan number"
              value={String(submitResult.loan_no)}
            />
            <SummaryRow
              label="Product"
              value={selectedProduct?.product_description ?? "—"}
            />
            <SummaryRow
              label="Amount"
              value={`KES ${Number(formValues.loan_amount).toLocaleString()}`}
              accent
            />
            <SummaryRow
              label="Repayment"
              value={`${selectedProduct?.installment_period} months`}
            />
            <SummaryRow
              label="Interest rate"
              value={`${selectedProduct?.interest}% p.m.`}
            />
            <SummaryRow label="Purpose" value={formValues.loan_purpose} />
          </View>

          <View style={s.infoNote}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#1D4ED8"
            />
            <Text style={s.infoNoteTxt}>
              Your loan application is under review. You will be notified once
              it is approved.
            </Text>
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { width: "100%", marginTop: 8 }]}
            onPress={handleDone}
          >
            <Text style={s.primaryBtnTxt}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.container]}>
        {/* Nav */}
        <View style={s.navBar}>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() =>
              step > 0 ? setStep((s) => s - 1) : navigation.goBack()
            }
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.navTitle}>Loan Application Process</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Step bar */}
        <StepBar current={step} />

        {/* ── STEP 0 — Product selection ─────────────────────────────────────── */}
        {step === 0 && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scroll}
            >
              {/* Info banner */}
              <View style={s.infoBanner}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color="#1D4ED8"
                />
                <Text style={s.infoTxt}>
                  Select a loan product that suits your needs. Each product has
                  different terms and eligibility criteria.
                </Text>
              </View>

              {loadingProducts ? (
                <View style={s.centerWrap}>
                  <ActivityIndicator color={GREEN} size="large" />
                  <Text style={s.loadingTxt}>Loading products…</Text>
                </View>
              ) : loanProducts.length === 0 ? (
                <View style={s.centerWrap}>
                  <MaterialCommunityIcons
                    name="bank-off-outline"
                    size={48}
                    color={TEXT_FAINT}
                  />
                  <Text style={s.emptyTitle}>No products available</Text>
                  <TouchableOpacity
                    style={s.retryBtn}
                    onPress={() => dispatch(fetchFosaProducts())}
                  >
                    <Text style={s.retryTxt}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                loanProducts.map((p) => (
                  <ProductCard
                    key={p.product_code}
                    product={p}
                    selected={selectedProduct}
                    onPress={() => setSelectedProduct(p)}
                  />
                ))
              )}

              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
              <TouchableOpacity
                style={[s.primaryBtn, !selectedProduct && s.primaryBtnDisabled]}
                onPress={handleSelectProduct}
                disabled={!selectedProduct || loadingProducts}
              >
                <Text style={s.primaryBtnTxt}>
                  Continue with{" "}
                  {selectedProduct?.product_description ?? "selected product"}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 1 — Loan details ──────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* Selected product summary chip */}
              <TouchableOpacity
                style={s.productChip}
                onPress={() => setStep(0)}
                activeOpacity={0.8}
              >
                <View style={s.productChipIcon}>
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={16}
                    color={GREEN}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.productChipName}>
                    {selectedProduct?.product_description}
                  </Text>
                  <Text style={s.productChipSub}>
                    {selectedProduct?.interest}% interest ·{" "}
                    {selectedProduct?.installment_period} months · Max KES{" "}
                    {Number(selectedProduct?.maximum_loan_amt).toLocaleString()}
                  </Text>
                </View>
                <Feather name="edit-2" size={14} color={TEXT_FAINT} />
              </TouchableOpacity>

              {/* ── Loan details ─────────────────────────────────────────────── */}
              <Text style={s.sectionTitle}>Loan details</Text>

              <Field
                label="Loan amount"
                required
                error={errors.loan_amount?.message}
                hint={`Min: KES ${Number(selectedProduct?.min_loan_amt).toLocaleString()} · Max: KES ${Number(selectedProduct?.maximum_loan_amt).toLocaleString()}`}
              >
                <NumInput
                  control={control}
                  name="loan_amount"
                  rules={{
                    required: "Enter the loan amount.",
                    validate: (v) => {
                      const n = Number(v);
                      if (n <= 0) return "Must be greater than zero.";
                      if (n > Number(selectedProduct?.maximum_loan_amt))
                        return `Cannot exceed KES ${Number(selectedProduct?.maximum_loan_amt).toLocaleString()}`;
                      if (
                        selectedProduct?.min_loan_amt !== "0" &&
                        n < Number(selectedProduct?.min_loan_amt)
                      )
                        return `Minimum is KES ${Number(selectedProduct?.min_loan_amt).toLocaleString()}`;
                      return true;
                    },
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Enter a valid amount.",
                    },
                  }}
                  placeholder="0"
                  error={errors.loan_amount}
                />
              </Field>

              <Field
                label="Loan purpose"
                required
                error={errors.loan_purpose?.message}
              >
                <Controller
                  control={control}
                  name="loan_purpose"
                  rules={{
                    required: "Enter the loan purpose.",
                    minLength: { value: 3, message: "Too short." },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[s.textArea, errors.loan_purpose && s.inputError]}
                      placeholder="e.g. School fees, medical expenses…"
                      placeholderTextColor={TEXT_FAINT}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      maxLength={200}
                    />
                  )}
                />
              </Field>

              {/* ── Payroll / income details ──────────────────────────────────── */}
              <Text style={s.sectionTitle}>Income & deductions</Text>

              <View style={s.twoCol}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Basic pay"
                    required
                    error={errors.basic_pay?.message}
                  >
                    <NumInput
                      control={control}
                      name="basic_pay"
                      rules={{
                        required: "Required.",
                        validate: (v) => Number(v) > 0 || "Must be > 0.",
                      }}
                      placeholder="0"
                      error={errors.basic_pay}
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Allowances" error={errors.allowances?.message}>
                    <NumInput
                      control={control}
                      name="allowances"
                      rules={{
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Invalid.",
                        },
                      }}
                      placeholder="0"
                      error={errors.allowances}
                    />
                  </Field>
                </View>
              </View>

              <View style={s.twoCol}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="House allowance"
                    error={errors.house_allowances?.message}
                  >
                    <NumInput
                      control={control}
                      name="house_allowances"
                      rules={{
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Invalid.",
                        },
                      }}
                      placeholder="0"
                      error={errors.house_allowances}
                    />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Transport allowance"
                    error={errors.transport_allowances?.message}
                  >
                    <NumInput
                      control={control}
                      name="transport_allowances"
                      rules={{
                        pattern: {
                          value: /^\d+(\.\d{1,2})?$/,
                          message: "Invalid.",
                        },
                      }}
                      placeholder="0"
                      error={errors.transport_allowances}
                    />
                  </Field>
                </View>
              </View>

              <Field
                label="Total deductions"
                required
                error={errors.deductions?.message}
              >
                <NumInput
                  control={control}
                  name="deductions"
                  rules={{
                    required: "Required.",
                    validate: (v) => Number(v) >= 0 || "Cannot be negative.",
                  }}
                  placeholder="0"
                  error={errors.deductions}
                />
              </Field>

              {/* Error */}
              {!!error && (
                <TouchableOpacity
                  style={s.errorBanner}
                  onPress={() => dispatch(clearLoanError())}
                >
                  <Ionicons name="warning-outline" size={16} color="#C62828" />
                  <Text style={s.errorTxt}>{error}</Text>
                  <Ionicons name="close" size={14} color="#C62828" />
                </TouchableOpacity>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
              <TouchableOpacity
                style={[s.primaryBtn, applying && s.primaryBtnDisabled]}
                onPress={handleSubmit(onApply)}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="file-send-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={s.primaryBtnTxt}>Submit application</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 2 — Review & submit ───────────────────────────────────────── */}
        {step === 2 && applyResult && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.scroll}
            >
              {/* Application created banner */}
              <View style={s.appliedBanner}>
                <Ionicons name="checkmark-circle" size={22} color={GREEN} />
                <View style={{ flex: 1 }}>
                  <Text style={s.appliedTitle}>Application created</Text>
                  <Text style={s.appliedSub}>
                    Application #{applyResult.application_no} · Review and
                    submit below
                  </Text>
                </View>
              </View>

              {/* Loan summary card */}
              <View style={s.reviewCard}>
                <Text style={s.reviewCardTitle}>Loan summary</Text>
                <SummaryRow
                  label="Product"
                  value={selectedProduct?.product_description}
                />
                <SummaryRow
                  label="Product code"
                  value={selectedProduct?.product_code}
                />
                <SummaryRow
                  label="Amount"
                  value={`KES ${Number(formValues.loan_amount).toLocaleString()}`}
                  accent
                />
                <SummaryRow
                  label="Repayment"
                  value={`${selectedProduct?.installment_period} months`}
                />
                <SummaryRow
                  label="Interest"
                  value={`${selectedProduct?.interest}% p.m.`}
                />
                <SummaryRow label="Purpose" value={formValues.loan_purpose} />
              </View>

              {/* Income summary card */}
              <View style={s.reviewCard}>
                <Text style={s.reviewCardTitle}>Income details</Text>
                <SummaryRow
                  label="Basic pay"
                  value={`KES ${Number(formValues.basic_pay).toLocaleString()}`}
                />
                <SummaryRow
                  label="Allowances"
                  value={`KES ${Number(formValues.allowances || 0).toLocaleString()}`}
                />
                <SummaryRow
                  label="House allowance"
                  value={`KES ${Number(formValues.house_allowances || 0).toLocaleString()}`}
                />
                <SummaryRow
                  label="Transport allowance"
                  value={`KES ${Number(formValues.transport_allowances || 0).toLocaleString()}`}
                />
                <SummaryRow
                  label="Total deductions"
                  value={`KES ${Number(formValues.deductions).toLocaleString()}`}
                />
              </View>

              {/* Warning */}
              <View style={s.warnBanner}>
                <Ionicons name="warning-outline" size={18} color="#92400E" />
                <Text style={s.warnTxt}>
                  Submitting this application is final and cannot be reversed.
                  Ensure all details are correct before proceeding.
                </Text>
              </View>

              {/* Error */}
              {!!error && (
                <TouchableOpacity
                  style={s.errorBanner}
                  onPress={() => dispatch(clearLoanError())}
                >
                  <Ionicons name="warning-outline" size={16} color="#C62828" />
                  <Text style={s.errorTxt}>{error}</Text>
                  <Ionicons name="close" size={14} color="#C62828" />
                </TouchableOpacity>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>

            <View
              style={[s.footer, { paddingBottom: insets.bottom + 12, gap: 10 }]}
            >
              <TouchableOpacity style={s.editBtn} onPress={() => setStep(1)}>
                <Feather name="edit-2" size={16} color={TEXT_MID} />
                <Text style={s.editBtnTxt}>Edit details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.primaryBtn, submitting && s.primaryBtnDisabled]}
                onPress={onSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="send-check-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={s.primaryBtnTxt}>Submit loan application</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
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

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_FAINT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 8,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  infoTxt: { flex: 1, fontSize: 13, color: "#1D4ED8", lineHeight: 18 },

  // Product chip (step 1 summary)
  productChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  productChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  productChipName: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
    marginBottom: 3,
  },
  productChipSub: { fontSize: 11, color: TEXT_FAINT },

  // Inputs
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT_DARK,
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: { borderColor: "#E53935" },
  twoCol: { flexDirection: "row", gap: 10 },

  // Review cards
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  reviewCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_MID,
    marginBottom: 12,
  },

  // Applied banner
  appliedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  appliedTitle: { fontSize: 14, fontWeight: "700", color: GREEN_DARK },
  appliedSub: { fontSize: 12, color: GREEN_DARK, marginTop: 2 },

  // Warning
  warnBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  warnTxt: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18 },

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

  // States
  centerWrap: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 40,
  },
  loadingTxt: { fontSize: 14, color: TEXT_FAINT },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  retryBtn: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },

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
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 13,
  },
  editBtnTxt: { fontSize: 15, color: TEXT_MID, fontWeight: "600" },

  // Success
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  receiptHead: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_MID,
    marginBottom: 12,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    width: "100%",
  },
  infoNoteTxt: { flex: 1, fontSize: 13, color: "#1D4ED8", lineHeight: 18 },
});
