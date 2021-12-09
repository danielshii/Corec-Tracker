import { React, useCallback, useState, useEffect } from "react";
import { FormCheck } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";
import Roompage from "./Roompage";
import Dashboard from "./Dashboard";
import Signup from "./Signup";
import VerifyEmail from "./VerifyEmail";
import VerifyPhone from "./VerifyPhone";
import ForgotPassword from "./ForgotPassword";
import PasswordResetEmailSent from "./PasswordResetEmailSent";
import ResetPassword from "./ResetPassword";
import Settings from "./Settings";
import Favorites from "./Favorites";
import Profile from "./Profile";
import Chat from "./Chat";
import AdminLogin from "./AdminLogin";
import BugReport from "./BugReport";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./GlobalStyles";
import { lightTheme, darkTheme } from "./Themes";
import { themeToggler } from "./ThemeToggler";
//import 'font-awesome/css/font-awesome.min.css';
function App() {
  const [log, setLog] = useState(false);
  const [theme, setTheme] = useState("light");
  const [autoToggle, setAutoToggle] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("autoToggle") == null) {
      console.log("test");
      localStorage.setItem("autoToggle", true);
    }
    setAutoToggle(localStorage.getItem("autoToggle"));
    // console.log(autoToggle);
    if (localStorage.getItem("autoToggle")) {
      console.log("changing");
      if (new Date().getHours() >= 18 || new Date().getHours() < 6) {
        setTheme("dark");
      }
    }
  }, [autoToggle]);

  const logIn = useCallback(() => {
    console.log("logged in!");
    setLog(true);
  });
  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <>
        <GlobalStyles />
        <Router>
          <div className="margin">
            <Switch>
              <Route
                exact
                path="/"
                render={(props) => <Login setLogIn={logIn} />}
              />
              <Route
                path="/signup"
                render={(props) => <Signup setLogIn={logIn} />}
              />
              <Route exact path="/admin/login" component={AdminLogin} />
              <Route exact path="/email/verify">
                <VerifyEmail />
              </Route>
              <Route exact path="/phone/verify">
                <VerifyPhone />
              </Route>
              <Route exact path="/email-sent">
                <PasswordResetEmailSent />
              </Route>
              <Route exact path="/forgot-password">
                <ForgotPassword />
              </Route>
              <Route exact path="/password/reset/:token">
                <ResetPassword />
              </Route>
              {/* <Route exact path="/settings">
            <Settings />
          </Route> */}
              <PrivateRoute component={Settings} path="/settings" />
              {/* <PrivateRoute isLoggedIn={log} path="/dashboard" component={Dashboard} /> */}
              <Route exact path="/dashboard" component={Dashboard} />
              <Route exact path="/room/:roomName" component={Roompage} />
              <PrivateRoute path="/favorites" component={Favorites} />
              <Route exact path="/chat" component={Chat} />
              <PrivateRoute path="/report" component={BugReport} />
              <PrivateRoute path="/profile" component={Profile} />
            </Switch>
          </div>
        </Router>
        <div style={{ marginTop: "3px" }}>
          <FormCheck
            type="switch"
            label={<h3 styles={{ color: "black" }}>Dark Mode</h3>}
            onChange={() => {
              setTheme(themeToggler(theme));
            }}
            checked={theme === "dark"}
          />
          <FormCheck
            type="switch"
            label={
              <p styles={{ color: "black" }}>Automatically Toggle Dark Mode</p>
            }
            onChange={(e) => {
              //e.preventDefault();
              // localStorage.setItem("autoToggle", !localStorage.getItem("autoToggle"));
              // setAutoToggle(localStorage.getItem("autoToggle") === true);

              localStorage.setItem("autoToggle", !autoToggle);
              setAutoToggle(!autoToggle);
              console.log(autoToggle);
            }}
            checked={autoToggle}
          />
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
