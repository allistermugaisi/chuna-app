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
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const { height: H, width: W } = Dimensions.get("window");

// ─── Brand colors ───
const C = {
  primary: "#E8614A",
  primaryDark: "#C0255A",
  peach: "#F0907A",
  secondary: "#1E4A58",
  bg: "#FDF7F5",
  surface: "#FFFFFF",
  inputBg: "#F5EFED",
  border: "#EAE0DC",
  textDark: "#1E4A58",
  textMid: "#4A6B76",
  textLight: "#9AABB2",
  white: "#FFFFFF",
  success: "#7ECBA0",
};

// ─── Country data ───
const COUNTRIES = [
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬" },
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "🇪🇹" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", dial: "+212", flag: "🇲🇦" },
  { code: "SN", name: "Senegal", dial: "+221", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "CM", name: "Cameroon", dial: "+237", flag: "🇨🇲" },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "🇷🇼" },
  { code: "ZM", name: "Zambia", dial: "+260", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", dial: "+263", flag: "🇿🇼" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "LS", name: "Lesotho", dial: "+266", flag: "🇱🇸" },
  { code: "MW", name: "Malawi", dial: "+265", flag: "🇲🇼" },
  { code: "MZ", name: "Mozambique", dial: "+258", flag: "🇲🇿" },
  { code: "NA", name: "Namibia", dial: "+264", flag: "🇳🇦" },
  { code: "BW", name: "Botswana", dial: "+267", flag: "🇧🇼" },
  { code: "TN", name: "Tunisia", dial: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "Algeria", dial: "+213", flag: "🇩🇿" },
  { code: "SD", name: "Sudan", dial: "+249", flag: "🇸🇩" },
  { code: "SO", name: "Somalia", dial: "+252", flag: "🇸🇴" },
  { code: "AO", name: "Angola", dial: "+244", flag: "🇦🇴" },
  { code: "CD", name: "DR Congo", dial: "+243", flag: "🇨🇩" },
];

// ─── Country Picker Modal ───
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
          style={[
            modal.row,
            isSelected && { backgroundColor: C.primary + "10" },
          ]}
        >
          <Text style={modal.flag}>{item.flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={modal.countryName}>{item.name}</Text>
          </View>
          <Text
            style={[
              modal.dialCode,
              isSelected && { color: C.primary, fontWeight: "700" },
            ]}
          >
            {item.dial}
          </Text>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={C.primary}
              style={{ marginLeft: 6 }}
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
      <Animated.View style={[modal.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          modal.sheet,
          {
            paddingBottom: insets.bottom + 8,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={modal.handle} />

        {/* Header */}
        <View style={modal.header}>
          <Text style={modal.title}>Select Country</Text>
          <TouchableOpacity
            onPress={onClose}
            style={modal.closeBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={modal.searchWrap}>
          <Feather
            name="search"
            size={16}
            color={C.textLight}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={modal.searchInput}
            placeholder="Search country or dial code..."
            placeholderTextColor={C.textLight}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && Platform.OS === "android" && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={C.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          ListEmptyComponent={
            <View style={modal.empty}>
              <Text style={modal.emptyText}>
                No country found for "{query}"
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={modal.sep} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Animated.View>
    </Modal>
  );
}

const modal = StyleSheet.create({
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DCDCE0",
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECEC",
  },
  title: { fontSize: 17, fontWeight: "700", color: C.textDark },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#F5F5F8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 6,
    borderWidth: 1,
    borderColor: "#EAEAEE",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    padding: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
  },
  flag: { fontSize: 26 },
  countryName: { fontSize: 15, color: C.textDark, fontWeight: "400" },
  dialCode: { fontSize: 14, color: C.textMid, fontWeight: "500" },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F0F0F5",
    marginLeft: 60,
  },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14, color: C.textLight },
});

// ─── Phone Input with Country Selector ───────────────────────────────────────
export function PhoneInput({ value, onChangeText, onCountryChange }) {
  const [country, setCountry] = useState(COUNTRIES[0]); // Kenya default
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSelect = (c) => {
    setCountry(c);
    onCountryChange?.(c);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.primary],
  });

  return (
    <>
      <Animated.View style={[ph.wrapper, { borderColor }]}>
        {/* Country selector button */}
        <TouchableOpacity
          onPress={() => setPickerOpen(true)}
          style={ph.countryBtn}
          activeOpacity={0.75}
        >
          <Text style={ph.flag}>{country.flag}</Text>
          <Text style={ph.dialCode}>{country.dial}</Text>
          <Ionicons
            name="chevron-down"
            size={13}
            color={C.textLight}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>

        {/* Vertical divider */}
        <View style={ph.divider} />

        {/* Number input */}
        <TextInput
          style={ph.input}
          placeholder="Phone number"
          placeholderTextColor={C.textLight}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Clear button */}
        {value?.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText?.("")}
            style={ph.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={18} color={C.textLight} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Hint: full number preview */}
      {value?.length > 0 && (
        <Text style={ph.preview}>
          Full number:{" "}
          <Text style={{ color: C.primary, fontWeight: "600" }}>
            {country.dial} {value}
          </Text>
        </Text>
      )}

      <CountryPickerModal
        visible={pickerOpen}
        selected={country}
        onSelect={handleSelect}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}

const ph = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingRight: 12,
    height: 54,
    overflow: "hidden",
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: "100%",
  },
  flag: { fontSize: 22 },
  dialCode: { fontSize: 14, fontWeight: "600", color: C.textDark },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: C.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    paddingHorizontal: 12,
    padding: 0,
  },
  clearBtn: { padding: 2 },
  preview: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 5,
    marginLeft: 4,
  },
});

// ─── Usage — drop-in replacement for your existing form section ───────────────
//
// In your LoginScreen, replace:
//   import { PhoneInput } from "./PhoneInput"; // adjust path
//
// Then swap your form section:
//
// const [phone,   setPhone]   = useState("");
// const [country, setCountry] = useState(null);
//
// <PhoneInput
//   value={phone}
//   onChangeText={setPhone}
//   onCountryChange={(c) => setCountry(c)}
// />
//
// When submitting:
//   const fullNumber = `${country?.dial || "+254"}${phone}`;
//   console.log(fullNumber); // e.g. "+254712345678"
