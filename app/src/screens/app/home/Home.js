import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import HomeRewards from "./HomeRewards";
import LottieView from "lottie-react-native";
import HomeTopMovers from "./HomeTopMovers";
import HomeWatchList from "./HomeWatchList";
import axios from "axios";

import { COLORS, SIZES, FONTS, icons, images } from "../../constants";

const { width, height } = Dimensions.get("window");

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const featuresData = [
    {
      id: 1,
      icon: icons.reload,
      color: COLORS.purple,
      backgroundColor: COLORS.lightpurple,
      description: "Buy",
    },
    // {
    // 	id: 2,
    // 	icon: icons.send,
    // 	color: COLORS.yellow,
    // 	backgroundColor: COLORS.lightyellow,
    // 	description: 'Sell',
    // },
    {
      id: 3,
      icon: icons.internet,
      color: COLORS.primary,
      backgroundColor: COLORS.lightGreen,
      description: "Pay",
    },
    {
      id: 4,
      icon: icons.wallet,
      color: COLORS.red,
      backgroundColor: COLORS.lightRed,
      description: "Wallet",
    },
    {
      id: 5,
      icon: icons.bill,
      color: COLORS.yellow,
      backgroundColor: COLORS.lightyellow,
      description: "Trade",
    },
    {
      id: 6,
      icon: icons.game,
      color: COLORS.primary,
      backgroundColor: COLORS.lightGreen,
      description: "Safe",
    },
    {
      id: 7,
      icon: icons.phone,
      color: COLORS.red,
      backgroundColor: COLORS.lightRed,
      description: "Rewards",
    },
    {
      id: 8,
      icon: icons.more,
      color: COLORS.purple,
      backgroundColor: COLORS.lightpurple,
      description: "More",
    },
  ];

  const specialPromoData = [
    {
      id: 1,
      img: images.promoBanner,
      title: "Bonus Cashback1",
      description: "Don't miss it. Grab it now!",
    },
    {
      id: 2,
      img: images.promoBanner,
      title: "Bonus Cashback2",
      description: "Don't miss it. Grab it now!",
    },
    {
      id: 3,
      img: images.promoBanner,
      title: "Bonus Cashback3",
      description: "Don't miss it. Grab it now!",
    },
    {
      id: 4,
      img: images.promoBanner,
      title: "Bonus Cashback4",
      description: "Don't miss it. Grab it now!",
    },
  ];

  const [features, setFeatures] = useState(featuresData);
  const [specialPromos, setSpecialPromos] = useState(specialPromoData);

  function renderBanner() {
    return (
      <View
        style={{
          height: 120,
          borderRadius: 20,
        }}
      >
        <Image
          source={images.banner}
          resizeMode="cover"
          style={{
            width: "100%",
            height: "100%",
            marginTop: 20,
            borderRadius: 20,
          }}
        />
      </View>
    );
  }

  function renderFeatures() {
    const Header = () => (
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "black",
          paddingTop: 50,
          paddingBottom: 20,
        }}
      >
        Favorites
      </Text>
    );

    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={{
          marginBottom: SIZES.padding * 2,
          width: 60,
          alignItems: "center",
        }}
        onPress={() => console.log(item.description)}
      >
        <View
          style={{
            height: 50,
            width: 50,
            marginBottom: 5,
            borderRadius: 20,
            backgroundColor: item.backgroundColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={item.icon}
            resizeMode="contain"
            style={{
              height: 20,
              width: 20,
              tintColor: item.color,
            }}
          />
        </View>
        <Text style={{ textAlign: "center", flexWrap: "wrap", ...FONTS.body4 }}>
          {item.description}
        </Text>
      </TouchableOpacity>
    );

    return (
      <FlatList
        ListHeaderComponent={Header}
        data={features}
        numColumns={4}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderItem}
        style={{ marginTop: SIZES.padding * 2 }}
        horizontal={false}
      />
    );
  }

  function renderPromos() {
    const HeaderComponent = () => (
      <View>
        {renderBanner()}
        {renderFeatures()}
        {/* {renderPromoHeader()} */}
      </View>
    );

    const renderPromoHeader = () => (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "black",
              paddingTop: 30,
              paddingBottom: 10,
            }}
          >
            Special Promo
          </Text>
        </View>
        <TouchableOpacity onPress={() => console.log("View All")}>
          <Text style={{ paddingTop: 30, color: COLORS.gray, ...FONTS.body4 }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
    );

    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={{
          marginVertical: SIZES.base,
          width: SIZES.width / 2.5,
        }}
        onPress={() => console.log(item.title)}
      >
        <View
          style={{
            height: 80,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: COLORS.primary,
          }}
        >
          <Image
            source={images.promoBanner}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        </View>

        <View
          style={{
            padding: SIZES.padding,
            backgroundColor: COLORS.lightGray,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <Text style={{ ...FONTS.h4 }}>{item.title}</Text>
          <Text style={{ ...FONTS.body4 }}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <FlatList
        ListHeaderComponent={HeaderComponent}
        contentContainerStyle={{ paddingHorizontal: SIZES.padding * 3 }}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        // data={specialPromos}
        keyExtractor={(item) => `${item.id}`}
        // renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View></View>}
        horizontal={false}
      />
    );
  }
  let mounted = true;
  useEffect(() => {
    onLoadRefresh();
    return () => {
      mounted = false;
    };
  }, []);

  const onLoadRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.nomics.com/v1/currencies/ticker?interval=1d,30d&convert=KES&per-page=100&page=1&pref=BTC&key=b82a4ef8e5ca4114f1111e7c744b632202c31ed6`,
      );
      const { data } = await response;
      if (mounted && data) {
        setData(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        `https://api.nomics.com/v1/currencies/ticker?interval=1d,30d&convert=KES&per-page=100&page=1&pref=BTC&key=b82a4ef8e5ca4114f1111e7c744b632202c31ed6`,
      );
      const { data } = await response;
      setData(data);
      setRefreshing(false);
    } catch (error) {
      console.log(error);
    }
  };

  // if (loading) {
  // 	return (
  // 		<LottieView
  // 			source={require('../../../assets/loading-spinner.json')}
  // 			autoPlay
  // 			loop
  // 		/>
  // 	);
  // }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff00ff"]}
          />
        }
      >
        <View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 30,
            }}
          >
            <Image
              source={require("../../../assets/wallet.png")}
              style={{ width: width / 2.2099, height: height / 2.9 }}
            />
            <Text style={{ fontSize: 20, fontWeight: "600", paddingTop: 10 }}>
              Welcome to FaxxPay
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "400",
                color: "#5d616d",
                paddingTop: 10,
              }}
            >
              Make your initial deposit today
            </Text>
            <View style={{ paddingTop: 30 }}>
              <TouchableOpacity style={styles.appButtonContainer}>
                <Text
                  style={{
                    fontSize: 16,
                    color: "white",
                    fontWeight: "600",
                    alignSelf: "center",
                  }}
                >
                  Load Wallet
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
						{renderPromos()}
					</SafeAreaView> */}

          <View style={{ paddingTop: 50, paddingHorizontal: 10 }}>
            <HomeWatchList />
          </View>

          <View style={{ paddingTop: 50, paddingHorizontal: 10 }}>
            <HomeTopMovers />
          </View>
          <View style={{ paddingTop: 50, paddingHorizontal: 10 }}>
            <HomeRewards />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appButtonContainer: {
    backgroundColor: "#00ab55",
    borderRadius: 50,
    paddingVertical: 17,
    paddingHorizontal: 100,
  },
});
export default Home;
