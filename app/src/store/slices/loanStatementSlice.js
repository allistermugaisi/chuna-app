import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tokenConfig } from "./authSlice";

const BASE_URL = "https://chus.tililtech.com";

const initialState = {
  runningLoans: [],
  guaranteedLoans: [],

  loanStatement: null,
  repaymentSchedule: null,

  loadingRunningLoans: false,
  loadingGuaranteedLoans: false,
  loadingLoanStatement: false,
  loadingRepaymentSchedule: false,

  error: null,
};

const buildUrl = (path, params = {}) => {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};

const readList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.loans)) return data.loans;
  if (Array.isArray(data?.loan_list)) return data.loan_list;
  if (Array.isArray(data?.guaranteed)) return data.guaranteed;
  if (Array.isArray(data?.guaranteed_loans)) return data.guaranteed_loans;
  if (Array.isArray(data?.list)) return data.list;
  return [];
};

const readReport = (data) => data?.base_report ?? data?.report ?? null;

const fetchJson = async (url) => {
  const token = await tokenConfig();
  const response = await fetch(url, {
    method: "GET",
    headers: token.headers,
  });
  const json = await response.json();

  if (json?.status_code !== 200) throw json;
  return json?.data;
};

// GET /loans/running
export const fetchRunningLoans = createAsyncThunk(
  "loanStatement/fetchRunningLoans",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchJson(buildUrl("/loans/running"));
      return readList(data);
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// GET /loans/guaranteed?doc_no=
export const fetchGuaranteedLoans = createAsyncThunk(
  "loanStatement/fetchGuaranteedLoans",
  async ({ doc_no = "" } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchJson(buildUrl("/loans/guaranteed", { doc_no }));
      return readList(data);
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// GET /loans/statement?doc_no=&loan_no=
export const fetchLoanStatement = createAsyncThunk(
  "loanStatement/fetchLoanStatement",
  async ({ doc_no = "", loan_no }, { rejectWithValue }) => {
    try {
      if (!loan_no) {
        return rejectWithValue({ message: "Loan number is required." });
      }

      const data = await fetchJson(
        buildUrl("/loans/statement", { doc_no, loan_no }),
      );
      return readReport(data);
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

// GET /loans/repayment-schedule?doc_no=&loan_no=
export const fetchRepaymentSchedule = createAsyncThunk(
  "loanStatement/fetchRepaymentSchedule",
  async ({ doc_no = "", loan_no }, { rejectWithValue }) => {
    try {
      if (!loan_no) {
        return rejectWithValue({ message: "Loan number is required." });
      }

      const data = await fetchJson(
        buildUrl("/loans/repayment-schedule", { doc_no, loan_no }),
      );
      return readReport(data);
    } catch (e) {
      return rejectWithValue({ message: e?.message ?? "Network error." });
    }
  },
);

const loanStatementSlice = createSlice({
  name: "loanStatement",
  initialState,
  reducers: {
    clearLoanStatementError: (state) => {
      state.error = null;
    },
    clearLoanReports: (state) => {
      state.loanStatement = null;
      state.repaymentSchedule = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRunningLoans.pending, (state) => {
        state.loadingRunningLoans = true;
        state.error = null;
      })
      .addCase(fetchRunningLoans.fulfilled, (state, action) => {
        state.loadingRunningLoans = false;
        state.runningLoans = action.payload;
      })
      .addCase(fetchRunningLoans.rejected, (state, action) => {
        state.loadingRunningLoans = false;
        state.error =
          action.payload?.message ?? "Failed to load running loans.";
      })

      .addCase(fetchGuaranteedLoans.pending, (state) => {
        state.loadingGuaranteedLoans = true;
        state.error = null;
      })
      .addCase(fetchGuaranteedLoans.fulfilled, (state, action) => {
        state.loadingGuaranteedLoans = false;
        state.guaranteedLoans = action.payload;
      })
      .addCase(fetchGuaranteedLoans.rejected, (state, action) => {
        state.loadingGuaranteedLoans = false;
        state.error =
          action.payload?.message ?? "Failed to load guaranteed loans.";
      })

      .addCase(fetchLoanStatement.pending, (state) => {
        state.loadingLoanStatement = true;
        state.loanStatement = null;
        state.error = null;
      })
      .addCase(fetchLoanStatement.fulfilled, (state, action) => {
        state.loadingLoanStatement = false;
        state.loanStatement = action.payload;
      })
      .addCase(fetchLoanStatement.rejected, (state, action) => {
        state.loadingLoanStatement = false;
        state.error =
          action.payload?.message ?? "Failed to load loan statement.";
      })

      .addCase(fetchRepaymentSchedule.pending, (state) => {
        state.loadingRepaymentSchedule = true;
        state.repaymentSchedule = null;
        state.error = null;
      })
      .addCase(fetchRepaymentSchedule.fulfilled, (state, action) => {
        state.loadingRepaymentSchedule = false;
        state.repaymentSchedule = action.payload;
      })
      .addCase(fetchRepaymentSchedule.rejected, (state, action) => {
        state.loadingRepaymentSchedule = false;
        state.error =
          action.payload?.message ?? "Failed to load repayment schedule.";
      });
  },
});

export const { clearLoanStatementError, clearLoanReports } =
  loanStatementSlice.actions;
export default loanStatementSlice.reducer;
