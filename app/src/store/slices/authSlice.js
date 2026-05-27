import axios from "axios";
import Toast from "react-native-toast-message";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { useNavigation } from "@react-navigation/native";

import { save, getValueFor, remove } from "../../utils/secureStore";

const initialState = {
  user: null,
  updatedUser: null,
  isAuth: false,
  isLoading: false,
  isForgotPassword: false,
  isOTPValid: false,
  isResetPassword: false,
  isAuthLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(auth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(auth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.user = action.payload;
      })
      .addCase(auth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(register.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(login.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isOTPValid = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isOTPValid = false;
        state.error = action.payload?.message;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.updatedUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(changePassword.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isAuthLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.error = action.payload?.message;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isAuthLoading = true;
        state.isForgotPassword = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isForgotPassword = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isForgotPassword = false;
        state.error = action.payload?.message;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isResetPassword = true;
        state.isForgotPassword = false;
        state.isOTPValid = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isResetPassword = false;
        state.error = action.payload?.message;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.user = null;
        state.isAuth = false;
        state.isAuthLoading = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

const baseUrl = "https://membershipapi.aakenya.co.ke";

// Setup config headers and access token
export const tokenConfig = async () => {
  // Get access token from secure store
  const access_token = await getValueFor("userToken");

  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // If access token, add to headers
  if (access_token) {
    config.headers["Authorization"] = `Bearer ${access_token.replace(
      /^"+|"+$/g,
      "",
    )}`;
  }

  return config;
};

// Setup config headers and access token
export const otpTokenConfig = async () => {
  // Get OTP token from secure store
  const otpToken = await getValueFor("otpToken");

  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // If OTP token, add to headers
  if (otpToken) {
    config.headers["Authorization"] = `Bearer ${otpToken.replace(
      /^"+|"+$/g,
      "",
    )}`;
  }

  return config;
};

// Check token and auth user
export const auth = createAsyncThunk(
  "auth/authUser",
  async (payload, { rejectWithValue }) => {
    const { source, member_id } = payload;

    try {
      const token = await tokenConfig();

      const body = JSON.stringify({ source, member_id });

      const { data } = await axios.post(
        `${baseUrl}/get_member_details`,
        body,
        token,
      );
      console.log("Auth Data", data);

      if (data?.status_code !== 1000) {
        await remove("user");
        await remove("userToken");

        // If the response is not successful, show an error toast
        Toast.show({
          type: "error",
          text1: `${data?.status_desc}`,
          text2: "Unable to authenticate. Please try again.",
        });
        return rejectWithValue(data);
      } else {
        return data.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    const token = await tokenConfig();

    const {
      source,
      first_name,
      last_name,
      phone,
      email,
      id_number,
      gender,
      pin,
    } = payload;

    try {
      // Request body
      const body = JSON.stringify({
        source,
        first_name,
        last_name,
        phone,
        email,
        id_number,
        gender,
        pin,
      });

      // Make request to register user
      const response = await axios.post(`${baseUrl}/register`, body, token);

      if (response.data.status_code !== 1000) {
        Toast.show({
          type: "error",
          text1: response.data.status_desc,
          text2: "Failed to register. Please try again.",
        });
        return rejectWithValue(response.data);
      } else {
        // Save verify otp token to secure store
        await save("otpToken", JSON.stringify(response.data.data.token));

        Toast.show({
          type: "success",
          text1: `${response.data.status_desc}`,
          text2: "Registration successful",
        });
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    const token = await tokenConfig();

    const { email, password } = payload;

    try {
      // Request body
      const body = JSON.stringify({ email, password });

      // Make request to login user
      const response = await axios.post(`${baseUrl}/login`, body, token);

      const data = await response.data;

      if (data?.status_code !== 1000) {
        await remove("user");
        await remove("userToken");
        Toast.show({
          type: "error",
          text1: `${data.status_desc}`,
          text2: "Unable to login. Please try again.",
        });
        return rejectWithValue(data);
      } else {
        // Save access token to secure store
        await save("user", JSON.stringify(data.data));
        await save("userToken", JSON.stringify(data.data.token));
        Toast.show({
          type: "success",
          text1: `${data.status_desc}`,
          text2: "Welcome back to AA Kenya",
        });
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (payload, { rejectWithValue }) => {
    try {
      // Get the OTP token from secure store
      const token = await otpTokenConfig();

      const { otp } = payload;

      const body = JSON.stringify({ otp });

      const response = await axios.post(`${baseUrl}/verify_otp`, body, token);

      if (response.data.status_code !== 1000) {
        Toast.show({
          type: "error",
          text1: response.data.status_desc,
          text2: "Failed to verify OTP. Please try again.",
        });
        return rejectWithValue(response.data);
      } else {
        Toast.show({
          type: "success",
          text1: response.data.status_desc,
          text2: "OTP verified successfully",
        });
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (_, { rejectWithValue }) => {
    try {
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload, { rejectWithValue }) => {
    const { source, phone, pin } = payload;

    try {
      const token = await tokenConfig();

      const body = JSON.stringify({ source, phone, pin });

      const response = await axios.post(
        `${baseUrl}/save_new_password`,
        body,
        token,
      );

      if (response.data.status_code !== 1000) {
        Toast.show({
          type: "error",
          text1: response.data.status_desc,
          text2: "Failed to change password. Please try again.",
        });
        return rejectWithValue(response.data);
      } else {
        Toast.show({
          type: "success",
          text1: response.data.status_desc,
          text2: "Password changed successfully",
        });
        // Clear user data from secure store
        await remove("user");
        await remove("userToken");

        return response.data;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message || "Failed to fetch junior members",
      });
      return rejectWithValue(error.response?.data);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (_, { rejectWithValue }) => {
    try {
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (_, { rejectWithValue }) => {
    try {
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Logout user
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await remove("user");
      await remove("userToken");
      Toast.show({
        type: "success",
        text1: "Logged out successfully",
        text2: "You have been logged out of your account.",
      });
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export default authSlice.reducer;
