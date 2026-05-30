import React from "react";
import { View, Text, Button, Image } from "react-native";
// import { useSelector } from "react-redux";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
// import * as Localization from "expo-localization";

import {
  Entypo,
  Octicons,
  EvilIcons,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";

import {
  HomeStackScreen,
  //   ExploreStackScreen,
  //   MatchesStackScreen,
  //   ChatStackScreen,
  ProfileStackScreen,
} from "./AppScreenStack";

const Tab = createBottomTabNavigator();

const getTabBarVisibility = (route) => {
  const hiddenScreens = ["Notifications", "Wallet", "SettingsScreen"]; // Screens where the tab bar should be hidden
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";

  return hiddenScreens.includes(routeName) ? { display: "none" } : {};
};

const AppTabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#1F2937", // #0F1B6D
        tabBarStyle: getTabBarVisibility(route),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={({ route }) => ({
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, size }) => (
            <Octicons
              name="home"
              size={size}
              color={focused ? "#10B981" : "#1F2937"}
            />
          ),
        })}
      />
      {/* <Tab.Screen
        name="Explore"
        component={ExploreStackScreen}
        options={({ route }) => ({
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused, size }) => (
            <Entypo
              name="compass"
              size={size}
              color={focused ? "#10B981" : "#1F2937"}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesStackScreen}
        options={({ route }) => ({
          tabBarLabel: "Matches",
          tabBarIcon: ({ focused, size }) => (
            <AntDesign
              name="heart"
              size={size}
              color={focused ? "#10B981" : "#1F2937"}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Chats"
        component={ChatStackScreen}
        options={({ route }) => ({
          tabBarIcon: ({ focused, size }) => (
            <AntDesign
              name="message"
              size={size}
              color={focused ? "#10B981" : "#1F2937"}
            />
          ),
        })}
      />
       */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={({ route }) => ({
          tabBarIcon: ({ focused, size }) => (
            <FontAwesome5
              name="user"
              size={size}
              color={focused ? "#10B981" : "#1F2937"}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

export default AppTabStack;
