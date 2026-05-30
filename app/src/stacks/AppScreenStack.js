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

import { Home, Profile } from "../screens/app";

import { Notifications } from "../global";

import { Ionicons, Feather, FontAwesome6, Entypo } from "@expo/vector-icons";

const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

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

export const ProfileStackScreen = () => {
  const navigation = useNavigation();

  return (
    <ProfileStack.Navigator
    // screenOptions={{
    //   cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
    //   presentation: "modal", // card
    // }}
    >
      <ProfileStack.Screen
        name="ProfileScreen"
        component={Profile}
        options={{
          title: "Account Profile",
          headerTitleAlign: "left",
          headerShown: false,
          headerLeft: () => <View style={{ paddingHorizontal: 5 }}></View>,
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 5,
              }}
            >
              {/* <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Profile", {
                    screen: "Notifications",
                  })
                }
                style={{
                  paddingHorizontal: 10,
                  backgroundColor: "#fff",
                  borderRadius: 50,
                }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Profile", {
                    screen: "Notifications",
                  })
                }
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 19,
                  backgroundColor: "#e8f5e9",
                  borderWidth: 1,
                  borderColor: "#0ccd5a",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#0ccd5a"
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ProfileStack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          title: "Account",
          headerTitleAlign: "left",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Profile", {
                  screen: "ProfileScreen",
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
    </ProfileStack.Navigator>
  );
};
