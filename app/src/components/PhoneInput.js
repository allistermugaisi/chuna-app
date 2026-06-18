import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Animated,
  FlatList,
  Platform,
  TextInput,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: H } = Dimensions.get("window");

// ─── Chuna Sacco brand tokens ──────────────────────────────────────────────────
const GREEN = "#4CAF20";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#388E3C";
const BG = "#F4F6F8";
const TEXT_DARK = "#1A1A1A";
const TEXT_MID = "#555555";
const TEXT_FAINT = "#999999";
const BORDER = "#EEEEEE";
const WHITE = "#FFFFFF";

// ─── Country data ──────────────────────────────────────────────────────────────
const COUNTRIES = [{ code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" }];

// ─── Country picker modal ──────────────────────────────────────────────────────
function CountryPickerModal({ visible, selected, onSelect, onClose }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const slideY = useRef(new Animated.Value(H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setQuery("");
      Animated.parallel([
        Animated.spring(slideY, {
          toValue: 0,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: H,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const filtered = useMemo(
    () =>
      query.trim()
        ? COUNTRIES.filter(
            (c) =>
              c.name.toLowerCase().includes(query.toLowerCase()) ||
              c.dial.includes(query) ||
              c.code.toLowerCase().includes(query.toLowerCase()),
          )
        : COUNTRIES,
    [query],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const isSelected = item.code === selected?.code;
      return (
        <TouchableOpacity
          onPress={() => {
            onSelect(item);
            onClose();
          }}
          activeOpacity={0.75}
          style={[m.row, isSelected && m.rowSelected]}
        >
          {/* Flag */}
          <Text style={m.flag}>{item.flag}</Text>

          {/* Country name */}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                m.countryName,
                isSelected && { color: GREEN, fontWeight: "700" },
              ]}
            >
              {item.name}
            </Text>
          </View>

          {/* Dial code */}
          <Text
            style={[
              m.dialCode,
              isSelected && { color: GREEN, fontWeight: "700" },
            ]}
          >
            {item.dial}
          </Text>

          {/* Checkmark */}
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={GREEN}
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      );
    },
    [selected],
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[m.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          m.sheet,
          {
            paddingBottom: insets.bottom + 8,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={m.handle} />

        {/* Header */}
        <View style={m.header}>
          <View style={m.headerLeft}>
            <MaterialCommunityIcons name="earth" size={20} color={GREEN} />
            <Text style={m.title}>Select country</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={m.closeBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={18} color={TEXT_MID} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={m.searchWrap}>
          <Feather
            name="search"
            size={16}
            color={TEXT_FAINT}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={m.searchInput}
            placeholder="Search country or dial code…"
            placeholderTextColor={TEXT_FAINT}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && Platform.OS === "android" && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={TEXT_FAINT} />
            </TouchableOpacity>
          )}
        </View>

        {/* Count */}
        <Text style={m.resultCount}>
          {filtered.length} {filtered.length === 1 ? "country" : "countries"}
        </Text>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          ItemSeparatorComponent={() => <View style={m.sep} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={m.empty}>
              <MaterialCommunityIcons
                name="earth-off"
                size={36}
                color={TEXT_FAINT}
              />
              <Text style={m.emptyText}>No country found for "{query}"</Text>
            </View>
          }
        />
      </Animated.View>
    </Modal>
  );
}

const m = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.78,
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "700", color: TEXT_DARK },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 11 : 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT_DARK, padding: 0 },
  resultCount: {
    fontSize: 11,
    color: TEXT_FAINT,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
  },
  rowSelected: { backgroundColor: GREEN_LIGHT },
  flag: { fontSize: 24 },
  countryName: { fontSize: 14, color: TEXT_DARK, fontWeight: "500" },
  dialCode: { fontSize: 13, color: TEXT_MID, fontWeight: "500" },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: 56,
  },
  empty: { alignItems: "center", paddingTop: 48, gap: 10 },
  emptyText: { fontSize: 14, color: TEXT_FAINT },
});

// ─── PhoneInput ────────────────────────────────────────────────────────────────
export function PhoneInput({
  value,
  onChangeText,
  onCountryChange,
  error,
  label = "Phone number",
}) {
  const [country, setCountry] = useState(COUNTRIES[0]); // Kenya default
  const [pickerOpen, setPickerOpen] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () =>
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const handleBlur = () =>
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

  const handleSelect = (c) => {
    setCountry(c);
    onCountryChange?.(c);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? "#E53935" : BORDER, error ? "#E53935" : GREEN],
  });

  // Expose full E.164 number via a helper the parent can use
  const fullNumber = `${country.dial}${value ?? ""}`;

  return (
    <View style={pi.container}>
      {/* Label */}
      {!!label && <Text style={pi.label}>{label}</Text>}

      {/* Input row */}
      <Animated.View style={[pi.wrapper, { borderColor }]}>
        {/* Country selector */}
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={pi.countryBtn}
          activeOpacity={0.75}
        >
          <Text style={pi.flag}>{country.flag}</Text>
          <Text style={pi.dialCode}>{country.dial}</Text>
          <Ionicons name="chevron-down" size={12} color={TEXT_FAINT} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={pi.divider} />

        {/* Number field */}
        <TextInput
          style={pi.input}
          placeholder="07XXXXXXXX"
          placeholderTextColor={TEXT_FAINT}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Clear */}
        {(value?.length ?? 0) > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText?.("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ paddingRight: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={18} color={TEXT_FAINT} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Full number preview */}
      {(value?.length ?? 0) > 0 && !error && (
        <View style={pi.previewRow}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={13}
            color={GREEN}
          />
          <Text style={pi.preview}>
            Full number:{" "}
            <Text style={{ color: GREEN, fontWeight: "700" }}>
              {fullNumber}
            </Text>
          </Text>
        </View>
      )}

      {/* Inline error */}
      {!!error && (
        <View style={pi.errorRow}>
          <Ionicons name="warning-outline" size={13} color="#C62828" />
          <Text style={pi.errorTxt}>{error}</Text>
        </View>
      )}

      <CountryPickerModal
        visible={pickerOpen}
        selected={country}
        onSelect={handleSelect}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const pi = StyleSheet.create({
  container: { marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "600", color: TEXT_DARK, marginBottom: 8 },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    height: 52,
    overflow: "hidden",
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: "100%",
  },
  flag: { fontSize: 20 },
  dialCode: { fontSize: 13, fontWeight: "700", color: TEXT_DARK },
  divider: { width: 1, height: 24, backgroundColor: BORDER },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    paddingHorizontal: 12,
    padding: 0,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    marginLeft: 2,
  },
  preview: { fontSize: 12, color: TEXT_FAINT },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    marginLeft: 2,
  },
  errorTxt: { fontSize: 12, color: "#C62828", fontWeight: "500" },
});

// ─── Usage ────────────────────────────────────────────────────────────────────
//
// import { PhoneInput } from "../components/PhoneInput";
//
// const [phone,   setPhone]   = useState("");
// const [country, setCountry] = useState(null);
//
// <PhoneInput
//   label="Phone number"
//   value={phone}
//   onChangeText={setPhone}
//   onCountryChange={(c) => setCountry(c)}
//   error={errors.phone?.message}   // pass react-hook-form error here
// />
//
// When submitting:
//   const fullNumber = `${country?.dial ?? "+254"}${phone}`;
//   // e.g. "+254712345678"
