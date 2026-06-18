import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const GREEN = "#4CAF20";
const TEXT_DARK = "#1A1A1A";
const TEXT_FAINT = "#999999";

export default function EmptyState({
  emoji,
  title,
  sub,
  actionLabel,
  onAction,
}) {
  return (
    <View style={s.wrap}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.sub}>{sub}</Text>
      {actionLabel && (
        <TouchableOpacity style={s.btn} onPress={onAction}>
          <Text style={s.btnTxt}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 56, paddingHorizontal: 32 },
  emoji: { fontSize: 44, marginBottom: 14 },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 6,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: TEXT_FAINT,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
