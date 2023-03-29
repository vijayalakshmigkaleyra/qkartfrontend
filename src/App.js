import Login from "./components/Login";
import {Route,Switch} from "react-router-dom";
import Register from "./components/Register";
import Products from "./components/Products";

import Checkout from "./components/Checkout";

import ipConfig from "./ipConfig.json";
import Thanks from "./components/Thanks";

export const config = {
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (
    <div className="App">
      {
        <Switch>
          <Route exact path="/">
            <Products />
          </Route>
          <Route exact path="/Register">
            <Register />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/checkout">
            <Checkout/>
          </Route>
          <Route exact path="/thanks">
            <Thanks/>
          </Route>
        </Switch>
      }
    </div>
  );
}

export default App;
