import React from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Auth screens
import { Welcome, Login, Signup, OTPScreen, ChangePin } from "../screens/auth";

import { AntDesign } from "@expo/vector-icons";

const AuthStack = createStackNavigator();

const AuthStackScreen = () => {
  const navigation = useNavigation();
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={Welcome} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Signup" component={Signup} />
      <AuthStack.Screen name="OTPScreen" component={OTPScreen} />
      <AuthStack.Screen name="ChangePin" component={ChangePin} />
    </AuthStack.Navigator>
  );
};

export default AuthStackScreen;
