import { React, useState, useEffect } from "react";
import { Route, Redirect, useHistory } from "react-router-dom";
import NotLoggedIn from "./NotLoggedIn";
import Header from "./Header";
import "./App.css";

function PrivateRoute({ ...props }) {
  const { component, path } = props;
  const [authenticated, setAuthenticated] = useState(false);

  async function authenticate() {
    const token = localStorage.getItem("remember")
      ? localStorage.getItem("access")
      : sessionStorage.getItem("access");
    //console.log(token);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access: token,
      },
    };
    const response = await fetch(`/auth`, requestOptions);
    setAuthenticated(response.ok);
  }

  useEffect(() => {
    authenticate();
  }, []);

  return authenticated ? (
    <Route exact path={path} component={component} />
  ) : (
    <div>
      <Header />
      <NotLoggedIn />
    </div>
  );
}

export default PrivateRoute;
