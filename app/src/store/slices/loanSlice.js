import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Toast } from "../../components/Toast";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  // Products
  loanProducts: [],
  loadingProducts: false,

  // Apply
  applyResult: null, // { success, application_no, description }
  applying: false,

  // Submit
  submitResult: null, // { success, loan_no, description }
  submitting: false,

  error: null,
};

// ── GET /loans/products-fosa ──
export const fetchFosaProducts = createAsyncThunk(
  "loan/fetchFosaProducts",
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/loans/products-fosa`, {
        method: "GET",
        headers: token.headers,
      });
      const json = await response.json();
      if (json?.status_code !== 200) return rejectWithValue(json);
      return json?.data?.loan_products ?? [];
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── POST /loans/apply ──
export const applyLoan = createAsyncThunk(
  "loan/applyLoan",
  async (payload, { rejectWithValue }) => {
    // payload: { loan_type, loan_amount, repayment_period, basic_pay,
    //            allowances, deductions, loan_purpose, house_allowances, transport_allowances }
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/loans/apply`, {
        method: "POST",
        headers: token.headers,
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (json?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Application failed",
          message: json?.message ?? "Could not apply for loan.",
        });
        return rejectWithValue(json);
      }
      return json?.data; // { success, application_no, description }
    } catch (e) {
      Toast.show({
        type: "error",
        title: "Error",
        message: e?.message ?? "Network error.",
      });
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── POST /loans/submit ──
export const submitLoan = createAsyncThunk(
  "loan/submitLoan",
  async ({ loan_no }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/loans/submit`, {
        method: "POST",
        headers: token.headers,
        body: JSON.stringify({ loan_no: String(loan_no) }),
      });
      const json = await response.json();
      if (json?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Submit failed",
          message: json?.message ?? "Could not submit loan.",
        });
        return rejectWithValue(json);
      }
      Toast.show({
        type: "success",
        title: "Loan submitted!",
        message: json?.message,
      });
      return json?.data; // { success, loan_no, description }
    } catch (e) {
      Toast.show({
        type: "error",
        title: "Error",
        message: e?.message ?? "Network error.",
      });
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── Slice ──
const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    resetLoan: (state) => {
      state.applyResult = null;
      state.submitResult = null;
      state.error = null;
    },
    clearLoanError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFosaProducts
      .addCase(fetchFosaProducts.pending, (state) => {
        state.loadingProducts = true;
        state.error = null;
      })
      .addCase(fetchFosaProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.loanProducts = action.payload;
      })
      .addCase(fetchFosaProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error =
          action.payload?.message ?? "Failed to load loan products.";
      })

      // applyLoan
      .addCase(applyLoan.pending, (state) => {
        state.applying = true;
        state.applyResult = null;
        state.error = null;
      })
      .addCase(applyLoan.fulfilled, (state, action) => {
        state.applying = false;
        state.applyResult = action.payload;
      })
      .addCase(applyLoan.rejected, (state, action) => {
        state.applying = false;
        state.error = action.payload?.message ?? "Loan application failed.";
      })

      // submitLoan
      .addCase(submitLoan.pending, (state) => {
        state.submitting = true;
        state.submitResult = null;
        state.error = null;
      })
      .addCase(submitLoan.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitResult = action.payload;
      })
      .addCase(submitLoan.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message ?? "Loan submission failed.";
      });
  },
});

export const { resetLoan, clearLoanError } = loanSlice.actions;
export default loanSlice.reducer;
