import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppTabStack from "./AppTabStack";
import AuthStackScreen from "./AuthScreenStack";
import {
  auth,
  authenticateUser,
  verifyOTP,
  logout,
} from "../store/slices/authSlice";
import { getValueFor } from "../utils/secureStore";
import { ToastProvider } from "../components/Toast";
import ChunaLoader from "../components/ChunaLoader";

const RootStack = () => {
  const dispatch = useDispatch();

  const { isAuth, authLoading } = useSelector((state) => state.auth);

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSessionValidity = async () => {
      try {
        const data = await getValueFor("user"); // using our improved secureStore wrapper
        console.log("Session Check - Retrieved User Data:", data);
        if (!data) {
          // no user stored
          dispatch(logout());
          setCheckingSession(false);
          return;
        }

        // If we stored tokens with expiry
        if (data.expiresAt && Date.now() > data.expiresAt) {
          // Session expired
          dispatch(logout());
          setCheckingSession(false);
          return;
        }

        // Session valid
        setCheckingSession(false);
        await dispatch(auth()).unwrap();
        // await dispatch(authenticateUser(data)); // update Redux state with user group data
      } catch (error) {
        // console.error("Session check error:", error);
        // await dispatch(logout()).unwrap();
        setCheckingSession(false);
      }
    };

    checkSessionValidity();
  }, [dispatch]);

  // === If authUser is false the loader should display ===
  if (authLoading || checkingSession) {
    return <ChunaLoader />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuth ? <AppTabStack /> : <AuthStackScreen />}
      </NavigationContainer>
      <ToastProvider />
    </SafeAreaProvider>
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
