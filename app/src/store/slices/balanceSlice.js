import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  member: null, // { member_no, name, mobile_no }
  allBalances: [], // account_balances[]
  bosaBalances: [], // bosa_balances[]
  fosaBalances: [], // fosa_balances[]
  totalAccounts: 0,
  loading: false,
  error: null,
};

// ── GET /profile/account-balance ──────────────────────────────────────────────
export const fetchAccountBalances = createAsyncThunk(
  "balance/fetchAccountBalances",
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/profile/account-balance`, {
        method: "GET",
        headers: token.headers,
      });

      const json = await response.json();

      if (json?.status_code !== 200) {
        return rejectWithValue(json);
      }

      return json?.data;
    } catch (error) {
      return rejectWithValue({ message: error?.message ?? "Network error." });
    }
  },
);

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    clearBalanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountBalances.fulfilled, (state, action) => {
        const d = action.payload;
        state.loading = false;
        state.member = {
          member_no: d.member_no,
          name: d.name,
          mobile_no: d.mobile_no,
        };
        state.allBalances = d.account_balances ?? [];

        // state.fosaBalances = d.fosa_balances ?? [];
        // FOSA — only ORD accounts
        state.fosaBalances = (d.fosa_balances ?? []).filter(
          (a) => a.bal_code === "ORD",
        );

        // state.bosaBalances = d.bosa_balances ?? [];
        // BOSA — only SHA, DEP, RSK
        const BOSA_CODES = ["SHA", "DEP", "RSK"];
        state.bosaBalances = (d.bosa_balances ?? []).filter((a) =>
          BOSA_CODES.includes(a.bal_code),
        );

        state.totalAccounts = d.total_accounts ?? 0;
      })
      .addCase(fetchAccountBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Failed to load balances.";
      });
  },
});

export const { clearBalanceError } = balanceSlice.actions;
export default balanceSlice.reducer;
