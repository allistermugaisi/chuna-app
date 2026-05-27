import React, { use, useEffect } from "react";
import { Provider } from "react-redux";
import RootStack from "./src/stacks/RootStack";
import Store from "./src/store/store";

const App = () => {
  return (
    <Provider store={Store}>
      <RootStack />
    </Provider>
  );
};

export default App;
