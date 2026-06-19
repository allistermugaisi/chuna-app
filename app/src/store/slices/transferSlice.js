import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Toast } from "../../components/Toast";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  // Source accounts
  sourceAccounts: null,
  loadingSource: false,

  // Destination accounts
  destAccounts: null,
  loadingDest: false,

  // Member validation (external transfer)
  validatedMember: null, // { member_no, member_name, mobile_no, fosa_accounts[], total_accounts }
  validating: false,

  // Transfer results
  transferResult: null,
  transferring: false,

  error: null,
};

// ── GET /profile/source-accounts ───
export const fetchSourceAccounts = createAsyncThunk(
  "transfer/fetchSourceAccounts",
  async ({ account_no, mobile_no }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const url = `${BASE_URL}/profile/source-accounts?account_no=${account_no}&mobile_no=${mobile_no}`;
      const response = await fetch(url, {
        method: "GET",
        headers: token.headers,
      });
      const json = await response.json();
      if (json?.status_code !== 200) return rejectWithValue(json);
      return json?.data;
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── GET /profile/destination-accounts ───
export const fetchDestAccounts = createAsyncThunk(
  "transfer/fetchDestAccounts",
  async ({ account_no, mobile_no }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const url = `${BASE_URL}/profile/destination-accounts?account_no=${account_no}&mobile_no=${mobile_no}`;
      const response = await fetch(url, {
        method: "GET",
        headers: token.headers,
      });
      const json = await response.json();
      if (json?.status_code !== 200) return rejectWithValue(json);
      return json?.data;
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── POST /member/validate ───
export const validateMember = createAsyncThunk(
  "transfer/validateMember",
  async ({ member_no }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/member/validate`, {
        method: "POST",
        headers: token.headers,
        body: JSON.stringify({ member_no }),
      });
      const json = await response.json();
      if (json?.status_code !== 200) {
        return rejectWithValue(json);
      }
      return json?.data;
      // { member_no, member_name, mobile_no, fosa_accounts[], total_accounts }
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── POST /transactions/transfer-to-bosa (FOSA → BOSA, internal only) ───
export const transferToBosa = createAsyncThunk(
  "transfer/transferToBosa",
  async (payload, { rejectWithValue }) => {
    // payload: { source_account_no, bosa_account, amount, doc_no, app_type }
    try {
      const token = await tokenConfig();
      const response = await fetch(
        `${BASE_URL}/transactions/transfer-to-bosa`,
        {
          method: "POST",
          headers: token.headers,
          body: JSON.stringify(payload),
        },
      );
      const json = await response.json();
      if (json?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Transfer failed",
          message: json?.message ?? "Could not complete transfer.",
        });
        return rejectWithValue(json);
      }
      Toast.show({
        type: "success",
        title: "Transfer successful!",
        message: json?.message,
      });
      return json?.data; // { doc_no, source_account_no, bosa_account, amount, status }
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

// ── POST /transactions/transfer (FOSA → FOSA internal or external) ───
export const transferFosa = createAsyncThunk(
  "transfer/transferFosa",
  async (payload, { rejectWithValue }) => {
    // payload: { source_account_no, destination_account, amount, doc_no, app_type }
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/transactions/transfer`, {
        method: "POST",
        headers: token.headers,
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (json?.status_code !== 200) {
        Toast.show({
          type: "error",
          title: "Transfer failed",
          message: json?.message ?? "Could not complete transfer.",
        });
        return rejectWithValue(json);
      }
      Toast.show({
        type: "success",
        title: "Transfer initiated!",
        message: json?.message,
      });
      return json?.data; // { status, description }
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
const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    resetTransfer: (state) => {
      state.transferResult = null;
      state.error = null;
    },
    clearTransferError: (state) => {
      state.error = null;
    },
    clearValidatedMember: (state) => {
      state.validatedMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSourceAccounts
      .addCase(fetchSourceAccounts.pending, (state) => {
        state.loadingSource = true;
        state.error = null;
      })
      .addCase(fetchSourceAccounts.fulfilled, (state, action) => {
        state.loadingSource = false;
        state.sourceAccounts = action.payload;
      })
      .addCase(fetchSourceAccounts.rejected, (state, action) => {
        state.loadingSource = false;
        state.error =
          action.payload?.message ?? "Failed to load source accounts.";
      })

      // fetchDestAccounts
      .addCase(fetchDestAccounts.pending, (state) => {
        state.loadingDest = true;
        state.error = null;
      })
      .addCase(fetchDestAccounts.fulfilled, (state, action) => {
        state.loadingDest = false;
        state.destAccounts = action.payload;
      })
      .addCase(fetchDestAccounts.rejected, (state, action) => {
        state.loadingDest = false;
        state.error =
          action.payload?.message ?? "Failed to load destination accounts.";
      })

      // validateMember
      .addCase(validateMember.pending, (state) => {
        state.validating = true;
        state.validatedMember = null;
        state.error = null;
      })
      .addCase(validateMember.fulfilled, (state, action) => {
        state.validating = false;
        state.validatedMember = action.payload;
      })
      .addCase(validateMember.rejected, (state, action) => {
        state.validating = false;
        state.validatedMember = null;
        state.error = action.payload?.message ?? "Member not found.";
      })

      // transferToBosa
      .addCase(transferToBosa.pending, (state) => {
        state.transferring = true;
        state.error = null;
        state.transferResult = null;
      })
      .addCase(transferToBosa.fulfilled, (state, action) => {
        state.transferring = false;
        state.transferResult = action.payload;
      })
      .addCase(transferToBosa.rejected, (state, action) => {
        state.transferring = false;
        state.error = action.payload?.message ?? "Transfer failed.";
      })

      // transferFosa
      .addCase(transferFosa.pending, (state) => {
        state.transferring = true;
        state.error = null;
        state.transferResult = null;
      })
      .addCase(transferFosa.fulfilled, (state, action) => {
        state.transferring = false;
        state.transferResult = action.payload;
      })
      .addCase(transferFosa.rejected, (state, action) => {
        state.transferring = false;
        state.error = action.payload?.message ?? "Transfer failed.";
      });
  },
});

export const { resetTransfer, clearTransferError, clearValidatedMember } =
  transferSlice.actions;
export default transferSlice.reducer;
