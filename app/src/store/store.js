import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
// import packageSlice from "./slices/packageSlice";
// import juniorSlice from "./slices/juniorSlice";
// import counterReducer from "./slices/counterSlice";
// import serviceSlice from "./slices/serviceSlice";

const Store = configureStore({
  reducer: {
    auth: authSlice,
    // package: packageSlice,
    // junior: juniorSlice,
    // service: serviceSlice,
    // counter: counterReducer,
  },
});

export default Store;
