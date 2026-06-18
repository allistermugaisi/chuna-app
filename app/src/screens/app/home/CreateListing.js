import React from "react";
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
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createListing } from "../../../store/slices/marketSlice";

const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";

// ─── Field wrapper ───
function Field({ label, hint, required, error, children }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}
        {required && <Text style={{ color: "#E53935" }}> *</Text>}
      </Text>
      {children}
      {hint && !error && <Text style={f.hint}>{hint}</Text>}
      {error && <Text style={f.error}>{error.message}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginBottom: 8 },
  hint: { fontSize: 11, color: TEXT_FAINT, marginTop: 6, lineHeight: 16 },
  error: { fontSize: 11, color: "#C62828", marginTop: 6, fontWeight: "500" },
});

// ─── Preview row ───
function PreviewRow({ label, value, accent }) {
  return (
    <View style={pr.row}>
      <Text style={pr.label}>{label}</Text>
      <Text style={[pr.value, accent && { color: GREEN, fontWeight: "800" }]}>
        {value}
      </Text>
    </View>
  );
}
const pr = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: { fontSize: 13, color: TEXT_FAINT },
  value: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
});

// ─── Main screen ───
export default function CreateListingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.market);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sharesOffered: "",
      pricePerShare: "",
      askingPrice: "",
      description: "",
    },
  });

  // ── Drive the live preview without extra state ───
  const sharesOffered = watch("sharesOffered");
  const pricePerShare = watch("pricePerShare");
  const askingPrice = watch("askingPrice");
  const description = watch("description");

  const totalValue =
    sharesOffered && pricePerShare
      ? (Number(sharesOffered) * Number(pricePerShare)).toLocaleString()
      : "—";

  // ── Submit — RHF validates first, then calls this ───
  async function onSubmit(data) {
    const payload = {
      shares: Number(data.sharesOffered),
      shares_offered: Number(data.sharesOffered),
      asking_price: Number(data.askingPrice),
      price_per_share: Number(data.pricePerShare),
      description: data.description.trim(),
    };

    try {
      const result = await dispatch(createListing(payload)).unwrap();

      Alert.alert(
        "Listing Created!",
        `Your listing ${result.listing_ref} is now live.\n\nExpires: ${result.expires_at?.split(" ")[0]}`,
        [
          {
            text: "View my listings",
            onPress: () => navigation.navigate("SellerDashboard"),
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Failed",
        error?.message ?? "Could not create listing. Try again.",
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Info banner ── */}
          <View style={s.infoBanner}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color="#1D4ED8"
            />
            <Text style={s.infoTxt}>
              Your shares will be listed in the marketplace for other members to
              purchase. Listings expire after 30 days.
            </Text>
          </View>

          {/* ── Shares offered ── */}
          <Controller
            control={control}
            name="sharesOffered"
            rules={{
              required: "Enter a valid number of shares.",
              validate: (v) => Number(v) > 0 || "Must be greater than zero.",
              pattern: { value: /^\d+$/, message: "Numbers only." },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Number of shares to sell"
                required
                hint="How many shares are you offering to sell?"
                error={errors.sharesOffered}
              >
                <View
                  style={[s.inputRow, errors.sharesOffered && s.inputError]}
                >
                  <MaterialCommunityIcons
                    name="certificate-outline"
                    size={18}
                    color={TEXT_FAINT}
                  />
                  <TextInput
                    style={s.input}
                    placeholder="e.g. 100"
                    placeholderTextColor={TEXT_FAINT}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <Text style={s.inputUnit}>shares</Text>
                </View>
              </Field>
            )}
          />

          {/* ── Price per share ─── */}
          <Controller
            control={control}
            name="pricePerShare"
            rules={{
              required: "Enter a valid price per share.",
              validate: (v) => Number(v) > 0 || "Must be greater than zero.",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Enter a valid amount.",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Price per share (KES)"
                required
                hint="The price you want per individual share."
                error={errors.pricePerShare}
              >
                <View
                  style={[s.inputRow, errors.pricePerShare && s.inputError]}
                >
                  <Text style={s.prefix}>KES</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. 50"
                    placeholderTextColor={TEXT_FAINT}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              </Field>
            )}
          />

          {/* ── Asking price ─── */}
          <Controller
            control={control}
            name="askingPrice"
            rules={{
              required: "Enter a valid asking price.",
              validate: (v) => Number(v) > 0 || "Must be greater than zero.",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Enter a valid amount.",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Asking price (KES)"
                required
                hint="The total minimum amount you are willing to accept."
                error={errors.askingPrice}
              >
                <View style={[s.inputRow, errors.askingPrice && s.inputError]}>
                  <Text style={s.prefix}>KES</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. 40"
                    placeholderTextColor={TEXT_FAINT}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
              </Field>
            )}
          />

          {/* ── Description ─── */}
          <Controller
            control={control}
            name="description"
            rules={{
              required: "Please add a description.",
              minLength: { value: 5, message: "Minimum 5 characters." },
              maxLength: { value: 300, message: "Maximum 300 characters." },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Description"
                required
                hint="Brief note for buyers — e.g. reason for selling."
                error={errors.description}
              >
                <TextInput
                  style={[
                    s.inputRow,
                    s.textarea,
                    errors.description && s.inputError,
                  ]}
                  placeholder="e.g. Selling 100 shares to raise funds for house purchase."
                  placeholderTextColor={TEXT_FAINT}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={300}
                />
                <Text style={s.charCount}>{(value ?? "").length}/300</Text>
              </Field>
            )}
          />

          {/* ── Live preview ── */}
          <View style={s.previewCard}>
            <View style={s.previewHeader}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={16}
                color={TEXT_MID}
              />
              <Text style={s.previewTitle}>Listing preview</Text>
            </View>
            <PreviewRow
              label="Shares offered"
              value={
                sharesOffered ? Number(sharesOffered).toLocaleString() : "—"
              }
            />
            <PreviewRow
              label="Price per share"
              value={
                pricePerShare
                  ? `KES ${Number(pricePerShare).toLocaleString()}`
                  : "—"
              }
            />
            <PreviewRow
              label="Asking price"
              value={
                askingPrice
                  ? `KES ${Number(askingPrice).toLocaleString()}`
                  : "—"
              }
            />
            <PreviewRow
              label="Total value"
              value={`KES ${totalValue}`}
              accent
            />
          </View>

          {/* ── Terms ─── */}
          <View style={s.termsBanner}>
            <Ionicons name="shield-checkmark-outline" size={16} color={GREEN} />
            <Text style={s.termsTxt}>
              By submitting, you confirm you own these shares and agree to the
              Chuna Sacco marketplace terms.
            </Text>
          </View>
        </ScrollView>

        {/* ── Submit footer ── */}
        <View style={[s.footer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[s.submitBtn, isLoading && s.submitBtnDisabled]}
            onPress={handleSubmit(onSubmit)} // ← RHF validates then calls onSubmit
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={s.submitTxt}>Submit listing</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 16 },

  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
  },
  infoTxt: { flex: 1, fontSize: 13, color: "#1D4ED8", lineHeight: 18 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
  },
  inputError: { borderColor: "#E53935" },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    padding: 0,
  },
  inputUnit: { fontSize: 13, color: TEXT_FAINT, fontWeight: "500" },
  prefix: { fontSize: 13, fontWeight: "700", color: TEXT_MID },
  textarea: { minHeight: 100, paddingTop: 12, alignItems: "flex-start" },
  charCount: {
    fontSize: 11,
    color: TEXT_FAINT,
    textAlign: "right",
    marginTop: 5,
  },

  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  previewTitle: { fontSize: 13, fontWeight: "700", color: TEXT_MID },

  termsBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  termsTxt: { flex: 1, fontSize: 12, color: "#2E7D32", lineHeight: 17 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
