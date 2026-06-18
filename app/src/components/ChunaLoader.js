import React from "react";
import { View, Text, ActivityIndicator, Image, StyleSheet } from "react-native";

const ChunaLoader = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Chuna Sacco</Text>
      <Text style={styles.subtitle}>Building Your Financial Future</Text>

      <ActivityIndicator size="large" color="#0F766E" style={styles.loader} />
    </View>
  );
};

export default ChunaLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },
  loader: {
    marginTop: 32,
  },
});
