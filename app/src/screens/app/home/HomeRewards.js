import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("screen");
const HomeRewards = () => {
  return (
    <View>
      <View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "black",
            paddingTop: 10,
          }}
        >
          Rewards
        </Text>
        <View style={{ paddingTop: 15 }}>
          <LinearGradient
            colors={["#6c13d7", "#6c13d7"]}
            style={{ borderRadius: 15 }}
          >
            <View
              style={{
                height: height / 3.5,
                width: "auto",
                borderRadius: 10,
              }}
            >
              <Image
                source={require("../../../../assets/sell3.jpg")}
                resizeMode="cover"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

export default HomeRewards;
