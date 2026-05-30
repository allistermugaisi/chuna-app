import { useSelector, useDispatch } from "react-redux";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AppTabStack from "./AppTabStack";
import AuthStackScreen from "./AuthScreenStack";

const RootStack = () => {
  let authUser = null; // Replace with actual authentication logic

  return (
    <NavigationContainer>
      {!authUser ? <AppTabStack /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default RootStack;

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
