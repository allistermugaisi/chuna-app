import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppTabStack from "./AppTabStack";
import AuthStackScreen from "./AuthScreenStack";
import { auth, logout } from "../store/slices/authSlice";
import { getValueFor } from "../utils/secureStore";
import ChunaLoader from "../components/ChunaLoader";
import { ToastProvider } from "../components/Toast";

const RootStack = () => {
  const dispatch = useDispatch();

  const { isAuth, authLoading } = useSelector((state) => state.auth);

  const [checkingSession, setCheckingSession] = useState(true);
  const logoutTimer = useRef(null);

  const scheduleAutoLogout = (expiresAt) => {
    if (!expiresAt) return;

    const timeLeft = expiresAt - Date.now();

    if (timeLeft <= 0) {
      dispatch(logout());
      return;
    }

    // clear existing timer
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }

    logoutTimer.current = setTimeout(() => {
      dispatch(logout());
    }, timeLeft);
  };

  useEffect(() => {
    const checkSessionValidity = async () => {
      try {
        const data = await getValueFor("user");
        console.log("Session Check - Retrieved User Data:", data);

        if (!data) {
          dispatch(logout());
          setCheckingSession(false);
          return;
        }

        // expired already
        if (data.expiresAt && Date.now() > data.expiresAt) {
          dispatch(logout());
          setCheckingSession(false);
          return;
        }

        // schedule auto logout
        scheduleAutoLogout(data.expiresAt);

        await dispatch(auth()).unwrap();
      } catch (error) {
        dispatch(logout());
      } finally {
        setCheckingSession(false);
      }
    };

    checkSessionValidity();

    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
    };
  }, [dispatch]);

  if (authLoading || checkingSession) {
    return <ChunaLoader />;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider />
      <NavigationContainer>
        {isAuth ? <AppTabStack /> : <AuthStackScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default RootStack;
