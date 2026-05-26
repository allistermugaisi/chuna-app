import React, { useState, useEffect } from "react";
import {
  Platform,
  Linking,
  View,
  Text,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

import { Discover, Explore, Matches, Chats, Profile } from "../screens/app";

import { Notifications } from "../global";

import { Ionicons, Feather, FontAwesome6, Entypo } from "@expo/vector-icons";

const HomeStack = createStackNavigator();

export const HomeStackScreen = ({ navigation }) => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={Home}
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          title: "Account",
          headerTitleAlign: "left",
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Home", {
                  screen: "HomeScreen",
                })
              }
              style={{
                paddingHorizontal: 10,
              }}
            >
              <Entypo name="chevron-thin-left" size={20} color="black" />
            </TouchableOpacity>
          ),
          headerTintColor: "#000",
        }}
      />
    </HomeStack.Navigator>
  );
};
