import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("screen");

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const HomeTopMovers = () => {
  const [coins, setCoins] = useState([
    {
      id: 1,
      name: "Bitcoin",
      icon: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/color/btc.png",
      nick: "BTC",
      price: 5399314,
      sign: "caretup",
      drop: 5.2,
    },
    {
      id: 2,
      name: "Ethereum",
      icon: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/color/eth.png",
      nick: "ETH",
      price: 449939,
      sign: "caretdown",
      drop: 0.08,
    },
    {
      id: 3,
      name: "Ripple",
      icon: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/color/xrp.png",
      nick: "XRP",
      price: 61236,
      sign: "caretup",
      drop: 12,
    },
    {
      id: 4,
      name: "Bitcoin Cash",
      icon: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/color/bch.png",
      nick: "BCH",
      price: 49916,
      sign: "caretup",
      drop: 1.2,
    },
    {
      id: 5,
      name: "Litecoin",
      icon: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/color/ltc.png",
      nick: "LTC",
      price: 17596,
      sign: "caretdown",
      drop: 3.2,
    },
    {
      id: 6,
      name: "Stellar Lumens",
      icon: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@9ab8d6934b83a4aa8ae5e8711609a70ca0ab1b2b/128/color/xlm.png",
      nick: "XLM",
      price: 4598,
      sign: "caretdown",
      drop: 8.2,
    },
  ]);
  return (
    <View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "black",
          paddingTop: 10,
        }}
      >
        Top Gainers
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingTop: 20 }}
      >
        {coins.map((coin) => (
          <TouchableOpacity key={coin.id} style={{ elevation: 13 }}>
            <View
              style={{
                width: width / 2.5,
                height: 150,
                borderWidth: 0.5,
                borderColor: "#ddd",
                borderRadius: 10,
                marginRight: 15,
                paddingHorizontal: 15,
                shadowColor: "#000",
                backgroundColor: "#fff",
                shadowOpacity: 0.05,
                elevation: 1,
              }}
            >
              <View>
                <Image
                  source={{ uri: coin.icon }}
                  style={{ width: 35, height: 35, marginTop: 15 }}
                />
              </View>

              <View
                style={{
                  marginTop: 15,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  {coin.nick}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "400",
                    paddingLeft: 5,
                    color: "#5D616D",
                  }}
                >
                  KES {numberWithCommas(coin.price)}
                </Text>
              </View>

              <View style={{ paddingTop: 15 }}>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "400",
                    paddingLeft: 5,
                    color: `${
                      coin.sign === "caretdown" ? "#FF4134" : "#00ab55"
                    }`,
                  }}
                >
                  <AntDesign
                    name={coin.sign}
                    size={12}
                    color={coin.sign === "caretdown" ? "#FF4134" : "#00ab55"}
                  />{" "}
                  {coin.drop}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeTopMovers;
