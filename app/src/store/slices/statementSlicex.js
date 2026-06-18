import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  // Mini statement
  miniStatement: [], // stm_list[]
  miniMember: null, // { member_no, name }
  loadingMini: false,

  // Full statement
  fullStatement: [], // base_report[]
  loadingFull: false,

  error: null,
};

// ── GET /profile/mini-statement ───────────────────────────────────────────────
export const fetchMiniStatement = createAsyncThunk(
  "statement/fetchMiniStatement",
  async (_, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const response = await fetch(`${BASE_URL}/profile/mini-statement`, {
        method: "GET",
        headers: token.headers,
      });
      const json = await response.json();
      // console.log(json);
      if (json?.status_code !== 200) return rejectWithValue(json);
      return json?.data;
      // { member_no, name, statement: { stm_list[] } }
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// ── GET /transactions/member-statement ────────────────────────────────────────
export const fetchFullStatement = createAsyncThunk(
  "statement/fetchFullStatement",
  async ({ date_from, date_to, doc_no = "" }, { rejectWithValue }) => {
    try {
      const token = await tokenConfig();
      const url = `${BASE_URL}/transactions/member-statement?date_from=${date_from}&date_to=${date_to}&doc_no=${doc_no}`;
      const response = await fetch(url, {
        method: "GET",
        headers: token.headers,
      });
      const json = await response.json();
      if (json?.status_code !== 200) return rejectWithValue(json);
      return json?.data?.base_report ?? [];
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

const statementSlice = createSlice({
  name: "statement",
  initialState,
  reducers: {
    clearStatementError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Mini
      .addCase(fetchMiniStatement.pending, (state) => {
        state.loadingMini = true;
        state.error = null;
      })
      .addCase(fetchMiniStatement.fulfilled, (state, action) => {
        state.loadingMini = false;
        state.miniMember = {
          member_no: action.payload.member_no,
          name: action.payload.name,
        };
        state.miniStatement = action.payload.statement?.stm_list ?? [];
      })
      .addCase(fetchMiniStatement.rejected, (state, action) => {
        state.loadingMini = false;
        state.error = action.payload?.message ?? "Failed to load statement.";
      })

      // Full
      .addCase(fetchFullStatement.pending, (state) => {
        state.loadingFull = true;
        state.error = null;
      })
      .addCase(fetchFullStatement.fulfilled, (state, action) => {
        state.loadingFull = false;
        state.fullStatement = action.payload;
      })
      .addCase(fetchFullStatement.rejected, (state, action) => {
        state.loadingFull = false;
        state.error = action.payload?.message ?? "Failed to load statement.";
      });
  },
});

export const { clearStatementError } = statementSlice.actions;
export default statementSlice.reducer;
