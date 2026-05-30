import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
// import { resetPassword } from '../../store/actions/authActions';
// import { clearErrors } from '../../store/actions/errorActions';
import { getValueFor } from "../../utils/secureStore";

// keyboard avoiding view
// import TextInputAvoidingView from '../../components/KeyboardAvoidingWrapper';
import { StyledButton, ButtonText } from "../../components/styles";

const ChangePin = ({ navigation }) => {
  // const toast = useToast();
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  let error = useSelector((state) => state.error);
  let passwordResetSuccess = useSelector(
    (state) => state.auth.passwordResetSuccess,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    const { password, password_confirmation } = data;
    const storedOTP = await getValueFor("ResetPasswordOTPCode");
    if (storedOTP) {
      const newData = {
        reset_password_token: storedOTP,
        password,
        password_confirmation,
      };
      setButtonLoading(true);
      // Attempt to authenticate user
      await dispatch(resetPassword(newData));
    }
  };

  //   useEffect(() => {
  //     // Check for register error
  //     if (error.id === "RESET_PASSWORD_FAIL") {
  //       setButtonLoading(false);
  //       Toast.show({
  //         type: "error",
  //         text1: "Password reset error. Please try again!",
  //         text2: "Oops, something went wrong",
  //       });
  //       dispatch(clearErrors());
  //     } else {
  //       setButtonLoading(false);
  //     }
  //   }, [error]);

  useEffect(() => {
    if (passwordResetSuccess) {
      navigation.navigate("Welcome");
      setButtonLoading(false);
      Toast.show({
        type: "success",
        text1: "Password reset success!",
        text2: "Kindly login using your new password",
      });
    }
  }, [passwordResetSuccess]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <FontAwesome6
          name="arrow-left"
          size={24}
          color="#fff"
          onPress={() => navigation.navigate("Welcome")}
        />
        <Text style={styles.text_header}>Change your Pin</Text>
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
          name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              mode="outlined"
              label="New pin"
              autoFocus
              secureTextEntry={showPassword ? false : true}
              placeholder="Enter new pin"
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
              message: "Pin is required",
            },
            minLength: {
              value: 6,
              message: "Pin should be atleast 6 characters",
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
              label="Confirm Pin"
              secureTextEntry={showPassword ? false : true}
              placeholder="Confirm your pin"
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
              message: "Confirm Pin is required",
            },
            validate: (value) =>
              value === getValues("password") || "Pins do not match",
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
            <ButtonText>Change Pin</ButtonText>
          )}
        </StyledButton>
      </Animatable.View>
      {/* </TextInputAvoidingView> */}
    </View>
  );
};

export default ChangePin;

const { height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00ab55",
  },
  header: {
    flex: Platform.OS === "ios" ? 1.2 : 3.3,
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
