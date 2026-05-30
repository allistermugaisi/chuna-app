import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from "react-hook-form";
import { TextInput, HelperText, useTheme } from "react-native-paper";
import { FontAwesome6, Ionicons, AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { getValueFor } from "../../utils/secureStore";
// import { registerUser } from "../../store/actions/authActions";
// import { clearErrors } from "../../store/actions/errorActions";

// keyboard avoiding view
// import TextInputAvoidingView from "../../components/KeyboardAvoidingWrapper";
// import TextInputAvoidingView from "../../components/KeyboardAvoidingWrapper";
import { StyledButton, ButtonText } from "../../components/styles";

const SignInScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  // const insets = useSafeAreaInsets();

  let error = useSelector((state) => state.error);
  let newAccount = useSelector((state) => state.auth.newAccount);

  const [buttonLoading, setButtonLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      password_confirmation,
    } = data;

    const newData = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password,
      password_confirmation,
    };
    // Attempt to register new user
    setButtonLoading(true);
    await dispatch(registerUser(newData));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Check for register error
    // if (error.id === "REGISTER_FAIL") {
    //   setButtonLoading(false);
    //   Toast.show({
    //     type: "error",
    //     text1: "An account with entered email already exists!",
    //     text2: "Oops, something went wrong",
    //   });
    //   dispatch(clearErrors());
    // } else {
    //   setButtonLoading(false);
    // }
  }, [error]);

  useEffect(() => {
    if (newAccount) {
      isEmailPhoneVerified();
      setButtonLoading(false);
    }
  }, [newAccount]);

  const isEmailPhoneVerified = async () => {
    const tempToken = await getValueFor("tempToken");

    if (tempToken) {
      navigation.navigate("OTPVerifyPhone");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="default" />
      <View style={styles.header}>
        {/* <FontAwesome6
          name="arrow-left"
          size={24}
          color="#fff"
          onPress={() => navigation.goBack()}
        /> */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.text_header}>Create your account</Text>
      </View>
      {/* <TextInputAvoidingView> */}
      <Animatable.View
        animation="fadeInUpBig"
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={{
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ width: "48%", marginRight: "2%" }}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  mode="outlined"
                  label="First Name"
                  style={
                    Platform.OS === "ios" && {
                      paddingHorizontal: 0,
                    }
                  }
                  placeholder="First Name"
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
                  message: "First Name is required",
                },
              }}
            />

            <HelperText type="error" style={styles.helper}>
              {errors?.firstName?.message}
            </HelperText>
          </View>
          <View style={{ width: "48%", marginLeft: "2%" }}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  mode="outlined"
                  label="Last Name"
                  style={
                    Platform.OS === "ios" && {
                      paddingHorizontal: 0,
                    }
                  }
                  placeholder="Last Name"
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
                  message: "Last Name is required",
                },
              }}
            />

            <HelperText type="error" style={styles.helper}>
              {errors?.lastName?.message}
            </HelperText>
          </View>
        </View>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              keyboardType="email-address"
              label="Email address"
              style={
                Platform.OS === "ios" && {
                  height: 50,
                  paddingHorizontal: 0,
                }
              }
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
          name="phone"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              keyboardType="numeric"
              maxLength={10}
              label="Phone Number"
              style={
                Platform.OS === "ios" && {
                  paddingHorizontal: 0,
                }
              }
              placeholder="0712345678"
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
              message: "Phone number is required",
            },
            pattern: {
              value: /^(\+254|0)[1-9]\d{8}$/i,
              message: "Please enter a valid mobile number",
            },
          }}
        />

        <HelperText type="error" style={styles.helper}>
          {errors?.phone?.message}
        </HelperText>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              label="Password"
              style={
                Platform.OS === "ios" && {
                  paddingHorizontal: 0,
                }
              }
              placeholder="Enter your password"
              value={value}
              theme={{
                colors: {
                  primary: "#00ab55",
                  underlineColor: "transparent",
                },
              }}
              onBlur={onBlur}
              secureTextEntry={showPassword ? false : true}
              onChangeText={(value) => onChange(value)}
              right={
                <TextInput.Icon
                  style={Platform.OS === "ios" && { paddingTop: 10 }}
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

        <HelperText type="error" style={styles.helper}>
          {errors?.password?.message}
        </HelperText>

        <Controller
          control={control}
          name="password_confirmation"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              label="Confirm Password"
              style={
                Platform.OS === "ios" && {
                  paddingHorizontal: 0,
                }
              }
              secureTextEntry={showPassword ? false : true}
              placeholder="Confirm your password"
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
                  style={Platform.OS === "ios" && { paddingTop: 10 }}
                  onPress={togglePassword}
                  name={showPassword ? "eye-off" : "eye"}
                />
              }
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Confirm Password is required",
            },
            validate: (value) =>
              value === getValues("password") || "Passwords do not match",
          }}
        />

        <HelperText type="error" style={styles.helper}>
          {errors?.password_confirmation?.message}
        </HelperText>

        <StyledButton
          disabled={buttonLoading ? true : false}
          onPress={handleSubmit(onSubmit)}
        >
          {buttonLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ButtonText>Create account</ButtonText>
          )}
        </StyledButton>

        <View style={styles.textPrivate}>
          <Text style={styles.color_textPrivate}>
            By signing up you agree to our
          </Text>
          <Text style={[styles.color_textPrivate, { fontWeight: "bold" }]}>
            {" "}
            User Agreement
          </Text>
          <Text style={styles.color_textPrivate}> and</Text>
          <Text style={[styles.color_textPrivate, { fontWeight: "bold" }]}>
            {" "}
            Terms of service.
          </Text>
        </View>
      </Animatable.View>
      {/* </TextInputAvoidingView> */}
    </View>
  );
};

export default SignInScreen;

const { height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00ab55",
  },
  header: {
    flex: Platform.OS === "ios" ? 0.2 : 0.55,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  phoneContainer: {
    width: "100%",
    flex: 1,
    height: Platform.OS === "ios" ? 52 : 60,
    borderWidth: 1,
    borderRadius: 5,
  },
  footer: {
    flex: Platform.OS === "ios" ? 1 : 2,
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
  textPrivate: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  color_textPrivate: {
    color: "grey",
  },
});
