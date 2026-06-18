import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import marketSlice from "./slices/marketSlice";
import withdrawSlice from "./slices/withdrawSlice";
import depositSlice from "./slices/depositSlice";
// import serviceSlice from "./slices/serviceSlice";

const Store = configureStore({
  reducer: {
    auth: authSlice,
    market: marketSlice,
    withdraw: withdrawSlice,
    deposit: depositSlice,
    // service: serviceSlice,
    // counter: counterReducer,
  },
});

export default Store;
