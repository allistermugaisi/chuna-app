import React, { use, useEffect } from "react";
import { Provider as StoreProvider } from "react-redux";
import RootStack from "./src/stacks/RootStack";

const App = () => {
  return <RootStack />;
};

export default App;
