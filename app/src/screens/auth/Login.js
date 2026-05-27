import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { TextInput, HelperText, useTheme } from "react-native-paper";
import {
  FontAwesome6,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { getValueFor } from "../../utils/secureStore";
// import { loginUser } from "../../store/actions/authActions";
// import { clearErrors } from "../../store/actions/errorActions";

// keyboard avoiding view
// import TextInputAvoidingView from "../../components/KeyboardAvoidingWrapper";
import { StyledButton, ButtonText } from "../../components/styles";

const Login = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  let error = useSelector((state) => state.error);
  let emailPassword = useSelector((state) => state.auth.emailPassword);

  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    // Attempt to authenticate user
    // setButtonLoading(true);
    // await dispatch(loginUser(data));
  };

  useEffect(() => {
    // Check for register error
    // if (error.id === "LOGIN_FAIL") {
    //   setButtonLoading(false);
    //   Toast.show({
    //     type: "error",
    //     text1: "Invalid credentials. Please try again!",
    //     text2: "Either your email address or password is incorrect.",
    //   });
    //   dispatch(clearErrors());
    // } else {
    //   setButtonLoading(false);
    // }
  }, []);

  useEffect(() => {
    if (emailPassword) {
      isEmailPhoneVerified();
      setButtonLoading(false);
      Toast.show({
        type: "info",
        text1: `You're almost there!`,
        text2: "Please provide the requested OTP",
      });
    }
  }, [emailPassword]);

  const isEmailPhoneVerified = async () => {
    const tempToken = await getValueFor("tempToken");
    const tempUserToken = await getValueFor("tempUserToken");

    if (tempToken) {
      navigation.navigate("OTPVerifyPhone");
    } else if (tempUserToken) {
      navigation.navigate("OTPVerifyEmail");
    } else {
      navigation.navigate("OTPScreen");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <FontAwesome6
          name="arrow-left"
          size={24}
          color="white"
          onPress={() => navigation.navigate("Welcome")}
        />
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
        <Controller
          control={control}
          type="email"
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              autoFocus={Platform.OS === "ios" ? true : false}
              keyboardType="email-address"
              label="Email address"
              placeholder="Enter your email address"
              value={value}
              theme={{
                colors: {
                  primary: "#00ab55",
                  underlineColor: "transparent",
                },
              }}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Email address is required",
            },
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
        />
        <HelperText type="error" style={styles.helper}>
          {errors?.email?.message}
        </HelperText>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              label="Password"
              secureTextEntry={showPassword ? false : true}
              placeholder="Enter password"
              value={value}
              theme={{
                colors: {
                  primary: "#00ab55",
                  underlineColor: "transparent",
                },
              }}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
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
              message: "Password is required",
            },
            minLength: {
              value: 8,
              message: "Password should be atleast 8 characters",
            },
          }}
        />

        <HelperText type="error">{errors?.password?.message}</HelperText>

        <StyledButton
          disabled={buttonLoading ? true : false}
          onPress={handleSubmit(onSubmit)}
        >
          {buttonLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ButtonText>Sign in</ButtonText>
          )}
        </StyledButton>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={{ color: "#00ab55", marginTop: 15 }}>Change pin?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#00ab55", marginTop: 15 }}>
              Privacy policy
            </Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      {/* </TextInputAvoidingView> */}
    </View>
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
