import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
// import OTPInputView from "@twotalltotems/react-native-otp-input";
import { useForm, Controller } from "react-hook-form";
import { TextInput, HelperText, useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";

import { getValueFor } from "../../utils/secureStore";
// import { otpSuccess, sendPhoneOTP } from '../../store/actions/authActions';
import { StyledButton, ButtonText } from "../../components/styles";

const OTPScreen = ({ navigation }) => {
  // const toast = useToast();
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [code, setCode] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  // Disable button and start timer on load
  useEffect(() => {
    countDownTimer();
  }, []);

  useEffect(() => {
    const verifyOTP = async () => {
      if (code.length === 7) {
        const storedOTP = await getValueFor("OTPCode");
        const confirmOTP = code.includes(storedOTP);
        if (confirmOTP) {
          dispatch(otpSuccess());
          Toast.show({
            type: "success",
            text1: "OTP verified successfully!",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Invalid OTP, kindly resend a new code!",
          });
        }
      }
    };
    verifyOTP();
  }, [code]);

  useEffect(() => {
    setDisabled(true);
    // exit early when we reach 0
    if (!timeLeft) return setDisabled(false);

    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // clear interval on re-render to avoid memory leaks
    return () => {
      clearInterval(intervalId);
    };
    // add timeLeft as a dependency to re-rerun the effect
    // when we update it
  }, [timeLeft]);

  const countDownTimer = () => {
    setTimeLeft(120);
  };

  const onSubmit = async (data) => {
    navigation.navigate("ChangePin");
    // setButtonLoading(true);
    // const { otp } = data;
    // if (otp.length === 7) {
    //   const storedOTP = await getValueFor("OTPCode");
    //   const confirmOTP = otp.includes(storedOTP);
    //   if (confirmOTP) {
    //     dispatch(otpSuccess());
    //     Toast.show({
    //       type: "success",
    //       text1: "OTP verified successfully!",
    //     });
    //   } else {
    //     Toast.show({
    //       type: "error",
    //       text1: "Invalid OTP, kindly resend a new code!",
    //     });
    //   }
    // }
  };

  const resendCode = async () => {
    countDownTimer();
    await dispatch(sendPhoneOTP());
    Toast.show({
      type: "success",
      text1: "New OTP code has been sent!",
    });
  };

  return (
    <>
      <SafeAreaView>
        <StatusBar barStyle="default" />
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 38,
            paddingTop: 30,
            backgroundColor: "#fff",
          }}
        >
          <FontAwesome6
            name="arrow-left"
            size={24}
            color="#000000"
            onPress={() => navigation.navigate("Welcome")}
          />
        </View>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
            >
              Enter the 6-digit code sent to your phone number
            </Text>
            <Text>We need to confirm it's really you trying to sign in.</Text>
          </View>

          <View style={styles.inputAndroid}>
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  mode="outlined"
                  style={{ backgroundColor: "#fff" }}
                  label="Enter 6-digit code"
                  value={value}
                  theme={{
                    colors: {
                      primary: "#00ab55",
                      underlineColor: "transparent",
                    },
                  }}
                  onChangeText={(value) => onChange(value)}
                />
              )}
              rules={{
                required: {
                  value: true,
                  message: "6-digit code is required",
                },
                minLength: {
                  value: 6,
                  message: "OTP code should be 6 characters",
                },
                maxLength: {
                  value: 6,
                  message: "OTP code should be 6 characters",
                },
              }}
            />
          </View>
          <HelperText type="error" style={styles.helper}>
            {errors?.otp?.message}
          </HelperText>

          <StyledButton
            style={{ width: "80%" }}
            disabled={buttonLoading ? true : false}
            onPress={handleSubmit(onSubmit)}
          >
            {buttonLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ButtonText>Confirm code</ButtonText>
            )}
          </StyledButton>

          <StyledButton
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#00ab55",
              width: "80%",
            }}
            disabled={disabled}
            onPress={resendCode}
          >
            {timeLeft === 0 ? (
              <ButtonText style={{ color: "#00ab55" }}>Resend code</ButtonText>
            ) : (
              <ButtonText style={{ color: "red" }}>
                Wait {timeLeft}s to resend code
              </ButtonText>
            )}
          </StyledButton>
        </View>
      </SafeAreaView>
    </>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#fff",
    color: "#000",
    paddingTop: "5%",
    alignItems: "center",
  },
  textContainer: {
    width: "80%",
  },
  input: {
    width: "80%",
    height: "15%",
  },
  inputAndroid: {
    width: "80%",
    height: "6%",
    marginTop: "5%",
  },
  underlineStyleBase: {
    width: 30,
    height: 40,
    borderWidth: 0,
    fontSize: 20,
    borderBottomWidth: 2,
    color: "#000000",
  },
  underlineStyleHighLighted: {
    borderColor: "#00ab55",
  },
});
