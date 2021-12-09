import {React, useEffect} from "react";
import {Route, Redirect} from "react-router-dom";
import "./App.css";

function RedirectLogin(props) {
  useEffect(() => {
    
  });
  async function checkToken() {
    if (!localStorage.getItem('access')) return false;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: localStorage.getItem("access")
      }),
    };
    alert(localStorage.getItem('access'));
    let response = await fetch("/auth", requestOptions);
    response = await response.json();
    alert(response.status);
    return response.status == 'success';
  }
  return (
    !checkToken()
    ? <Redirect to="/dashboard"/>
    : <Route {...props}/>
  );
}

export default RedirectLogin;