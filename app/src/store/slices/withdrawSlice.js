import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Toast } from "../../components/Toast";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  // Step 1 – initiate
  otpData: null, // { otp_required, phone, amount, account_no, doc_no, expires_in, sms_sent }
  initiating: false,

  // Step 2 – verify
  withdrawResult: null, // { doc_no, account_no, amount, transaction_date }
  verifying: false,

  // Withdrawable accounts
  accounts: [],
  loadingAccounts: false,

  error: null,
};

// ── GET /profile/withdrawable-accounts ──
export const fetchWithdrawableAccounts = createAsyncThunk(
  "withdraw/fetchWithdrawableAccounts",
  async ({ account_no, mobile_no }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const url = `${BASE_URL}/profile/withdrawable-accounts?account_no=${account_no}&mobile_no=${mobile_no}`;

      const response = await fetch(url, {
        method: "GET",
        headers: token.headers,
      });

      const data = await response.json();
      console.log(data);

      if (data?.status_code !== 200) {
        return rejectWithValue(data);
      }

      return data?.data;
    } catch (error) {
      return rejectWithValue({ message: error?.message ?? "Network error." });
    }
  },
);

// ── POST /transactions/withdraw-mpesa ──
export const initiateWithdraw = createAsyncThunk(
  "withdraw/initiateWithdraw",
  async (payload, { rejectWithValue }) => {
    // payload: { account_no, amount, doc_no, transaction_date, app_type }
    try {
      const token = await tokenConfig();

      const response = await fetch(`${BASE_URL}/transactions/withdraw-mpesa`, {
        method: "POST",
        headers: token.headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Withdrawal failed",
          message: data?.message ?? "Could not initiate withdrawal.",
        });
        return rejectWithValue(data);
      }

      return data?.data; // { otp_required, phone, amount, account_no, doc_no, expires_in, sms_sent }
    } catch (error) {
      Toast.show({
        type: "error",
        title: "Error",
        message: error?.message ?? "Network error.",
      });
      return rejectWithValue({ message: error?.message ?? "Network error." });
    }
  },
);

// ── POST /transactions/withdraw-mpesa/verify ──
export const verifyWithdraw = createAsyncThunk(
  "withdraw/verifyWithdraw",
  async ({ otp }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();

      const response = await fetch(
        `${BASE_URL}/transactions/withdraw-mpesa/verify`,
        {
          method: "POST",
          headers: token.headers,
          body: JSON.stringify({ otp }),
        },
      );

      const data = await response.json();

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Verification failed",
          message: data?.message ?? "Invalid OTP. Please try again.",
        });
        return rejectWithValue(data);
      }

      Toast.show({
        type: "success",
        title: "Withdrawal successful!",
        message: data?.message ?? "Your funds are on their way.",
      });

      return data?.data; // { doc_no, account_no, amount, transaction_date }
    } catch (error) {
      Toast.show({
        type: "error",
        title: "Error",
        message: error?.message ?? "Network error.",
      });
      return rejectWithValue({ message: error?.message ?? "Network error." });
    }
  },
);

// ── Slice ──
const withdrawSlice = createSlice({
  name: "withdraw",
  initialState,
  reducers: {
    resetWithdraw: (state) => {
      state.otpData = null;
      state.withdrawResult = null;
      state.error = null;
    },
    clearWithdrawError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWithdrawableAccounts
      .addCase(fetchWithdrawableAccounts.pending, (state) => {
        state.loadingAccounts = true;
        state.error = null;
      })
      .addCase(fetchWithdrawableAccounts.fulfilled, (state, action) => {
        state.loadingAccounts = false;
        state.accounts = action.payload ?? [];
      })
      .addCase(fetchWithdrawableAccounts.rejected, (state, action) => {
        state.loadingAccounts = false;
        state.error = action.payload?.message ?? "Failed to load accounts.";
      })

      // initiateWithdraw
      .addCase(initiateWithdraw.pending, (state) => {
        state.initiating = true;
        state.error = null;
        state.otpData = null;
      })
      .addCase(initiateWithdraw.fulfilled, (state, action) => {
        state.initiating = false;
        state.otpData = action.payload;
      })
      .addCase(initiateWithdraw.rejected, (state, action) => {
        state.initiating = false;
        state.error = action.payload?.message ?? "Withdrawal failed.";
      })

      // verifyWithdraw
      .addCase(verifyWithdraw.pending, (state) => {
        state.verifying = true;
        state.error = null;
      })
      .addCase(verifyWithdraw.fulfilled, (state, action) => {
        state.verifying = false;
        state.withdrawResult = action.payload;
        state.otpData = null; // clear OTP session
      })
      .addCase(verifyWithdraw.rejected, (state, action) => {
        state.verifying = false;
        state.error = action.payload?.message ?? "Verification failed.";
      });
  },
});

export const { resetWithdraw, clearWithdrawError } = withdrawSlice.actions;
export default withdrawSlice.reducer;
