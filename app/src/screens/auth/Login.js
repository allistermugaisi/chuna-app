import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { TextInput, HelperText, useTheme } from "react-native-paper";
import {
  Ionicons,
  AntDesign,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

// Redux imports
import { Toast } from "../../components/Toast";
import { login } from "../../store/slices/authSlice";
import { getValueFor } from "../../utils/secureStore";

import { PhoneInput } from "../../components/PhoneInput";
import { StyledButton, ButtonText } from "../../components/styles";

const Login = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { isLoading } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    const standardPhone = `254${phone}`;

    if (!/^254(7|1)\d{8}$/.test(standardPhone)) {
      Toast.show({
        type: "error",
        title: "Invalid Phone Number",
        message: "Enter a valid phone number.",
      });
      return;
    }

    const payload = {
      ...data,
      phone: standardPhone,
    };

    await dispatch(login(payload)).unwrap();
    navigation.navigate("OTPScreen", { data: payload });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="default" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* <FontAwesome6
          name="arrow-left"
          size={24}
          color="white"
          onPress={() => navigation.navigate("Welcome")}
        /> */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.text_header}>Welcome back!</Text>
      </View>
      {/* <TextInputAvoidingView style={{ marginBottom: insets.bottom }}> */}
      <Animatable.View
        animation="fadeInUpBig"
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={{ marginBottom: 10 }}>
          <PhoneInput
            value={phone}
            // onChangeText={setPhone?.replace(/^\+254/, "")}
            onChangeText={(value) => {
              const cleaned = value
                ?.replace(/\D/g, "")
                ?.replace(/^254/, "")
                ?.replace(/^0/, "");

              setPhone(cleaned);
            }}
            onCountryChange={(c) => setCountry(c)}
          />
        </View>

        <Controller
          control={control}
          name="pin"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              label="PIN"
              placeholder="Enter PIN"
              value={value}
              keyboardType="number-pad"
              maxLength={4} // Change to 6 if using a 6-digit PIN
              secureTextEntry={!showPassword}
              theme={{
                colors: {
                  primary: "#00ab55",
                  underlineColor: "transparent",
                },
              }}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value.replace(/[^0-9]/g, ""))}
              right={
                <TextInput.Icon
                  onPress={togglePassword}
                  name={showPassword ? "eye-off" : "eye"}
                />
              }
            />
          )}
          rules={{
            required: {
              value: true,
              message: "PIN is required",
            },
            pattern: {
              value: /^[0-9]{4}$/,
              message: "PIN must be exactly 4 digits",
            },
          }}
        />

        <HelperText type="error">{errors?.pin?.message}</HelperText>

        <StyledButton
          disabled={isLoading ? true : false}
          onPress={handleSubmit(onSubmit)}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ButtonText>Sign in</ButtonText>
          )}
        </StyledButton>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity>
            <Text style={{ color: "#00ab55", marginTop: 15 }}>
              Terms of Service
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#00ab55", marginTop: 15 }}>
              Privacy policy
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      {/* </TextInputAvoidingView> */}
    </KeyboardAvoidingView>
  );
};

export default Login;

const { height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00ab55",
  },
  header: {
    flex: Platform.OS === "ios" ? 1 : 2.7,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  footer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: height * 0.04,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 25,
  },
  text_footer: {
    color: "#05375a",
    fontSize: 18,
  },
  backBtn: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  errorMsg: {
    color: "#FF0000",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    marginTop: 50,
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
