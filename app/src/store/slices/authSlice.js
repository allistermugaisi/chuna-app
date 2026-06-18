import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { Toast } from "../../components/Toast";
import { save, getValueFor, remove } from "../../utils/secureStore";

const initialState = {
  user: null,
  updatedUser: null,
  isAuth: false,
  isLoading: false,
  isAuthLoading: false,
  isOTPRequired: false,
  isOTPValid: false,
  resendPhoneOTP: false,
  isForgotPassword: false,
  isResetPassword: false,
  error: null,
  appInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(auth.pending, (state) => {
        state.isAuth = true;
        state.isAuthLoading = true;
      })
      .addCase(auth.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = true;
        state.appInitialized = true;
        state.user = action.payload;
      })
      .addCase(auth.rejected, (state, action) => {
        state.isAuth = false;
        state.isAuthLoading = false;
        state.appInitialized = false;
        state.error = action.payload?.message;
      })
      .addCase(authenticateUser.pending, (state) => {
        state.isAuthLoading = true;
        state.error = null;
      })
      .addCase(authenticateUser.fulfilled, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = action.payload.isAuth; // will be true
      })
      .addCase(authenticateUser.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = false;
        state.error = action.payload || "Failed to authenticate user";
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
        state.isLoading = true;
        state.isOTPRequired = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOTPRequired = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isOTPRequired = false;
        state.error = action.payload?.message;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isAuth = false;
        state.isOTPValid = false;
        state.isAuthLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isAuth = true;
        state.isOTPValid = true;
        state.isAuthLoading = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuth = false;
        state.isOTPValid = false;
        state.error = action.payload?.message;
      })
      .addCase(resendPhoneOTP.pending, (state) => {
        state.isLoading = true;
        state.resendPhoneOTP = false;
      })
      .addCase(resendPhoneOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resendPhoneOTP = true;
        state.user = action.payload;
      })
      .addCase(resendPhoneOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.resendPhoneOTP = false;
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

const baseUrl = "https://chus.tililtech.com";

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

// Check token and auth user
export const auth = createAsyncThunk(
  "auth/authUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      // console.log("Auth Token", token);

      const { data } = await axios.get(`${baseUrl}/profile/member-info`, token);
      // console.log("Auth Data", data);

      if (data?.status_code !== 200) {
        await remove("user");
        await remove("userToken");

        // If the response is not successful, show an error toast
        Toast.show({
          type: "error",
          title: `Oops! An error occurred.`,
          message: "Unable to authenticate. Please try again.",
        });
        return rejectWithValue(data);
      } else {
        return data.data;
      }
    } catch (error) {
      // Toast.show({
      //   type: "error",
      //   title: `Error ${error?.response?.data?.status_code}`,
      //   message: `${error?.response?.data?.message}`,
      // });
      await remove("user");
      await remove("userToken");
      return rejectWithValue(error?.response?.data);
    }
  },
);

// === Check In-App token and auth user ===
// === This is controlled by token expiry ===
export const authenticateUser = createAsyncThunk(
  "auth/authenticateUser",
  async (payload = null, { rejectWithValue }) => {
    // console.log("Auth Thunk - Payload:", payload);
    try {
      // If payload exists, use it directly (from SecureStore)
      if (payload) {
        return {
          isAuth: true,
        };
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

      if (response.data.status_code !== 200) {
        Toast.show({
          type: "error",
          title: response?.data?.status_desc,
          message: "Failed to register. Please try again.",
        });
        return rejectWithValue(response.data);
      } else {
        // Save verify otp token to secure store
        await save("otpToken", JSON.stringify(response.data.data.token));

        Toast.show({
          type: "success",
          title: `${response.data.status_desc}`,
          message: "Registration successful",
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
    const { phone, pin } = payload;

    try {
      // Request body
      const body = JSON.stringify({ phone, pin });

      // Make request to login user
      const response = await axios.post(`${baseUrl}/auth/login`, body);

      const data = await response.data;

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Invalid credentials. Please try again!",
          message: "Either your email address or password is incorrect.",
        });
        return rejectWithValue(data);
      } else {
        Toast.show({
          type: "success",
          title: `${data.status_desc}`,
          message: "Enter OTP sent to your registered phone number",
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
      const { phone, otp, device_id } = payload;

      const body = JSON.stringify({ phone, otp, device_id });

      const response = await axios.post(`${baseUrl}/auth/verify-otp`, body);

      const data = await response.data;

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: response?.data?.status_desc,
          message: "Failed to verify OTP. Please try again.",
        });
        return rejectWithValue(response.data);
      } else {
        const authData = {
          ...data.data,
          expiresAt: Date.now() + data.data.expires_in * 1000,
        };

        // Save access token to secure store
        await save("user", JSON.stringify(authData));
        await save("userToken", JSON.stringify(data.data.access_token));
        Toast.show({
          type: "success",
          title: response?.data?.status_desc,
          message: "OTP verified successfully",
        });
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Resend OTP
export const resendPhoneOTP = createAsyncThunk(
  "auth/resendPhoneOTP",
  async (payload, { rejectWithValue }) => {
    try {
      const { phone } = payload;

      const body = JSON.stringify({ phone });

      const response = await axios.post(`${baseUrl}/auth/resend-otp`, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.data;

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Failed to verify OTP. Please try again.",
          message: `${response.data.status_desc}`,
        });
        return rejectWithValue(response.data);
      } else {
        Toast.show({
          type: "info",
          title: `Code sent to ${data?.data?.phone}`,
          message: `${data?.message}`,
        });
        return response.data;
      }
    } catch (error) {
      console.log("OTP Error:", error);
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
          title: response.data.status_desc,
          message: "Failed to change password. Please try again.",
        });
        return rejectWithValue(response.data);
      } else {
        Toast.show({
          type: "success",
          title: response.data.status_desc,
          message: "Password changed successfully",
        });
        // Clear user data from secure store
        await remove("user");
        await remove("userToken");

        return response.data;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        title: "Error",
        message:
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
        title: "Logged out successfully",
        message: "You have been logged out of your account.",
      });
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export default authSlice.reducer;
