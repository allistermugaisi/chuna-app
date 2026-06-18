import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import marketSlice from "./slices/marketSlice";
import withdrawSlice from "./slices/withdrawSlice";
import depositSlice from "./slices/depositSlice";
import balanceSlice from "./slices/balanceSlice";
import statementSlice from "./slices/statementSlice";

const Store = configureStore({
  reducer: {
    auth: authSlice,
    market: marketSlice,
    withdraw: withdrawSlice,
    deposit: depositSlice,
    balance: balanceSlice,
    statement: statementSlice,
  },
});

export default Store;
