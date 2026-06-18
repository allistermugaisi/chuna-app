import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  CATEGORIES,
  GREEN,
  GREEN_LIGHT,
  GREEN_DARK,
  BG,
  TEXT_DARK,
  TEXT_MID,
  TEXT_FAINT,
  BORDER,
} from "../../../data/marketplaceData";

const CONDITIONS = [
  "New",
  "Used – Excellent",
  "Used – Good",
  "Used – Fair",
  "Service",
  "N/A",
];

// ─── Progress bar ──────────────────────────────────────────────────────────────
function StepBar({ step, total }) {
  return (
    <View style={pb.wrap}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[pb.seg, { backgroundColor: i < step ? GREEN : "#E0E0E0" }]}
        />
      ))}
    </View>
  );
}
const pb = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 4,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  seg: { flex: 1, height: 4, borderRadius: 2 },
});

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>
        {label}
        {required && <Text style={{ color: "#E53935" }}> *</Text>}
      </Text>
      {children}
      {hint && <Text style={f.hint}>{hint}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginBottom: 8 },
  hint: { fontSize: 11, color: TEXT_FAINT, marginTop: 5 },
});

// ─── Main component ────────────────────────────────────────────────────────────
export default function CreateBidScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  // Form state
  const [form, setForm] = useState({
    title: "",
    category: "",
    condition: "",
    description: "",
    askingPrice: "",
    minIncrement: "1000",
    location: "",
    endsInDays: "7",
    shares: "50",
    contactPhone: "",
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // ── Validation ──────────────────────────────────────────────────────────────
  function validateStep() {
    if (step === 1) {
      if (!form.title.trim()) {
        Alert.alert("Required", "Please enter a listing title.");
        return false;
      }
      if (!form.category) {
        Alert.alert("Required", "Please select a category.");
        return false;
      }
      if (!form.condition) {
        Alert.alert("Required", "Please select item condition.");
        return false;
      }
      if (!form.description.trim()) {
        Alert.alert("Required", "Please add a description.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.askingPrice || isNaN(form.askingPrice)) {
        Alert.alert("Required", "Enter a valid asking price.");
        return false;
      }
      if (!form.location.trim()) {
        Alert.alert("Required", "Enter a location.");
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => s - 1);
  }

  function handleSubmit() {
    if (!validateStep()) return;
    // In production: API call here
    Alert.alert(
      "Listing created! 🎉",
      "Your listing has been submitted and will be visible in the marketplace shortly.",
      [
        {
          text: "View Marketplace",
          onPress: () => navigation.navigate("Marketplace"),
        },
      ],
    );
  }

  // ── Step renders ────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <View style={s.stepHeading}>
        <Text style={s.stepTitle}>Product details</Text>
        <Text style={s.stepSub}>Tell buyers about what you're selling</Text>
      </View>

      <Field
        label="Listing title"
        required
        hint="Be specific, e.g. 'Samsung 65-inch 4K Smart TV'"
      >
        <TextInput
          style={s.input}
          placeholder="What are you selling?"
          placeholderTextColor={TEXT_FAINT}
          value={form.title}
          onChangeText={(v) => set("title", v)}
          maxLength={80}
        />
        <Text style={s.charCount}>{form.title.length}/80</Text>
      </Field>

      <Field label="Category" required>
        <View style={s.chipGrid}>
          {CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[s.chip, form.category === cat.key && s.chipActive]}
              onPress={() => set("category", cat.key)}
            >
              <Text style={s.chipEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  s.chipTxt,
                  form.category === cat.key && s.chipTxtActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Condition" required>
        <View style={s.chipGrid}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[s.chip, form.condition === c && s.chipActive]}
              onPress={() => set("condition", c)}
            >
              <Text
                style={[s.chipTxt, form.condition === c && s.chipTxtActive]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field
        label="Description"
        required
        hint="Min 30 characters. Include key details, defects, dimensions, etc."
      >
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="Describe your item in detail…"
          placeholderTextColor={TEXT_FAINT}
          value={form.description}
          onChangeText={(v) => set("description", v)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <Text style={s.charCount}>{form.description.length}/1000</Text>
      </Field>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={s.stepHeading}>
        <Text style={s.stepTitle}>Pricing & location</Text>
        <Text style={s.stepSub}>
          Set your price and where buyers can find the item
        </Text>
      </View>

      <Field
        label="Asking price (KES)"
        required
        hint="This is your target price. Bidders may offer less."
      >
        <View style={s.prefixInput}>
          <Text style={s.prefix}>KES</Text>
          <TextInput
            style={s.prefixField}
            placeholder="0"
            placeholderTextColor={TEXT_FAINT}
            keyboardType="numeric"
            value={form.askingPrice}
            onChangeText={(v) => set("askingPrice", v)}
          />
        </View>
      </Field>

      <Field
        label="Minimum bid increment (KES)"
        hint="Smallest amount each new bid must exceed the current bid by."
      >
        <View style={s.prefixInput}>
          <Text style={s.prefix}>KES</Text>
          <TextInput
            style={s.prefixField}
            placeholder="1000"
            placeholderTextColor={TEXT_FAINT}
            keyboardType="numeric"
            value={form.minIncrement}
            onChangeText={(v) => set("minIncrement", v)}
          />
        </View>
      </Field>

      <Field
        label="Location"
        required
        hint="Town/area where item is located or service is available."
      >
        <TextInput
          style={s.input}
          placeholder="e.g. Nairobi, Westlands"
          placeholderTextColor={TEXT_FAINT}
          value={form.location}
          onChangeText={(v) => set("location", v)}
        />
      </Field>

      <Field
        label="Listing duration"
        hint="How many days should this listing remain open?"
      >
        <View style={s.chipGrid}>
          {["3", "7", "14", "21", "30"].map((d) => (
            <TouchableOpacity
              key={d}
              style={[s.chip, form.endsInDays === d && s.chipActive]}
              onPress={() => set("endsInDays", d)}
            >
              <Text
                style={[s.chipTxt, form.endsInDays === d && s.chipTxtActive]}
              >
                {d} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field
        label="Contact phone"
        hint="Shown to interested bidders after a bid is placed."
      >
        <TextInput
          style={s.input}
          placeholder="07XXXXXXXX"
          placeholderTextColor={TEXT_FAINT}
          keyboardType="phone-pad"
          value={form.contactPhone}
          onChangeText={(v) => set("contactPhone", v)}
        />
      </Field>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={s.stepHeading}>
        <Text style={s.stepTitle}>Review & submit</Text>
        <Text style={s.stepSub}>Double-check everything before going live</Text>
      </View>

      {/* Preview card */}
      <View style={s.previewCard}>
        {/* Photo placeholder */}
        <View style={s.photoPlaceholder}>
          <Ionicons name="camera-outline" size={32} color={TEXT_FAINT} />
          <Text style={s.photoHint}>Add photos after submission</Text>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={s.previewTitle}>{form.title || "—"}</Text>

          <View style={s.previewRow}>
            <Text style={s.previewKey}>Category</Text>
            <Text style={s.previewVal}>
              {CATEGORIES.find((c) => c.key === form.category)?.label ?? "—"}
            </Text>
          </View>
          <View style={s.previewRow}>
            <Text style={s.previewKey}>Condition</Text>
            <Text style={s.previewVal}>{form.condition || "—"}</Text>
          </View>
          <View style={s.previewRow}>
            <Text style={s.previewKey}>Asking price</Text>
            <Text style={[s.previewVal, { color: GREEN, fontWeight: "800" }]}>
              {form.askingPrice
                ? `KES ${Number(form.askingPrice).toLocaleString()}`
                : "—"}
            </Text>
          </View>
          <View style={s.previewRow}>
            <Text style={s.previewKey}>Min increment</Text>
            <Text style={s.previewVal}>
              KES {Number(form.minIncrement || 0).toLocaleString()}
            </Text>
          </View>
          <View style={s.previewRow}>
            <Text style={s.previewKey}>Location</Text>
            <Text style={s.previewVal}>{form.location || "—"}</Text>
          </View>
          <View style={s.previewRow}>
            <Text style={s.previewKey}>Duration</Text>
            <Text style={s.previewVal}>{form.endsInDays} days</Text>
          </View>
        </View>
      </View>

      {/* Terms note */}
      <View style={s.termsBox}>
        <MaterialIcons name="gavel" size={18} color={GREEN} />
        <Text style={s.termsTxt}>
          By submitting, you confirm this listing complies with Chuna Sacco
          marketplace policies. False listings may result in account suspension.
        </Text>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => (step === 1 ? navigation.goBack() : prevStep())}
            style={s.headerBtn}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Create listing</Text>
          <Text style={s.stepIndicator}>
            Step {step}/{TOTAL_STEPS}
          </Text>
        </View>

        <StepBar step={step} total={TOTAL_STEPS} />

        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Footer buttons */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          {step > 1 && (
            <TouchableOpacity style={s.backBtn} onPress={prevStep}>
              <Text style={s.backBtnTxt}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[s.nextBtn, step > 1 && { flex: 1 }]}
            onPress={step < TOTAL_STEPS ? nextStep : handleSubmit}
          >
            <Text style={s.nextBtnTxt}>
              {step < TOTAL_STEPS ? "Continue" : "Submit listing 🚀"}
            </Text>
            {step < TOTAL_STEPS && (
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  stepIndicator: { fontSize: 12, color: TEXT_FAINT, fontWeight: "600" },

  scroll: { paddingHorizontal: 16, paddingBottom: 20 },

  stepHeading: { marginBottom: 20, marginTop: 4 },
  stepTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  stepSub: { fontSize: 14, color: TEXT_FAINT },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT_DARK,
  },
  textarea: { minHeight: 110, paddingTop: 12 },
  charCount: {
    fontSize: 11,
    color: TEXT_FAINT,
    textAlign: "right",
    marginTop: 4,
  },

  prefixInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: "hidden",
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MID,
    backgroundColor: BG,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  prefixField: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipEmoji: { fontSize: 14 },
  chipTxt: { fontSize: 13, color: TEXT_MID, fontWeight: "500" },
  chipTxtActive: { color: "#fff", fontWeight: "700" },

  // Preview
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  photoPlaceholder: {
    height: 130,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoHint: { fontSize: 12, color: TEXT_FAINT },
  previewTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 14,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  previewKey: { fontSize: 13, color: TEXT_FAINT },
  previewVal: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
    maxWidth: "55%",
    textAlign: "right",
  },

  termsBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  termsTxt: { flex: 1, fontSize: 12, color: "#2E7D32", lineHeight: 17 },

  // Footer
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnTxt: { fontSize: 14, fontWeight: "600", color: TEXT_MID },
  nextBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
  },
  nextBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
