import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Toast } from "../../components/Toast";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  depositResult: null, // { checkout_request_id, merchant_request_id, doc_no, phone, amount, account_no, status }
  depositing: false,
  error: null,
};

// ── POST /transactions/mpesa-stk ──
export const initiateDeposit = createAsyncThunk(
  "deposit/initiateDeposit",
  async (payload, { rejectWithValue }) => {
    // payload: { phone, amount, account_no, member_no, doc_no }
    try {
      const token = await tokenConfig();

      const response = await fetch(`${BASE_URL}/transactions/mpesa-stk`, {
        method: "POST",
        headers: token.headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Deposit failed",
          message: data?.message ?? "Could not initiate deposit.",
        });
        return rejectWithValue(data);
      }

      Toast.show({
        type: "success",
        title: "Deposit request sent!",
        message: data?.message,
      });

      return data?.data;
      // { checkout_request_id, merchant_request_id, doc_no, phone, amount, account_no, status }
    } catch (error) {
      const msg = error?.message ?? "Network error.";
      Toast.show({ type: "error", title: "Error", message: msg });
      return rejectWithValue({ message: msg });
    }
  },
);

// ── Slice ───
const depositSlice = createSlice({
  name: "deposit",
  initialState,
  reducers: {
    resetDeposit: (state) => {
      state.depositResult = null;
      state.error = null;
    },
    clearDepositError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateDeposit.pending, (state) => {
        state.depositing = true;
        state.error = null;
        state.depositResult = null;
      })
      .addCase(initiateDeposit.fulfilled, (state, action) => {
        state.depositing = false;
        state.depositResult = action.payload;
      })
      .addCase(initiateDeposit.rejected, (state, action) => {
        state.depositing = false;
        state.error = action.payload?.message ?? "Deposit failed.";
      });
  },
});

export const { resetDeposit, clearDepositError } = depositSlice.actions;
export default depositSlice.reducer;
