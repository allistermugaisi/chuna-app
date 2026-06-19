import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import marketSlice from "./slices/marketSlice";
import withdrawSlice from "./slices/withdrawSlice";
import depositSlice from "./slices/depositSlice";
import balanceSlice from "./slices/balanceSlice";
import statementSlice from "./slices/statementSlice";
import transferSlice from "./slices/transferSlice";
import loanSlice from "./slices/loanSlice";
import loanStatementSlice from "./slices/loanStatementSlice";

const Store = configureStore({
  reducer: {
    loan: loanSlice,
    auth: authSlice,
    market: marketSlice,
    balance: balanceSlice,
    deposit: depositSlice,
    withdraw: withdrawSlice,
    transfer: transferSlice,
    statement: statementSlice,
    loanStatement: loanStatementSlice,
  },
});

export default Store;
