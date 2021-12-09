import { React, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Form, FormCheck, InputGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/fontawesome-free-solid";
import axios from "axios";

const adminSecret = "adminSecret";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginFail, setLoginFail] = useState(false);
  const [remember, setRemember] = useState(false);
  const history = useHistory();

  function validateForm() {
    return username.length > 0 && password.length > 0;
  }

  async function handleChatLogin(e) {
    e.preventDefault();
    const authHeader = {
      "Private-Key": "b35df4a0-b81b-45d0-b331-0b077b14d0bc",
    };
    try {
      await axios.put(
        "https://api.chatengine.io/users/",
        {
          username: "Admin",
          secret: adminSecret,
        },
        {
          headers: authHeader,
        }
      );
      sessionStorage.setItem("username", "Admin");
      sessionStorage.setItem("password", adminSecret);
      if (remember) {
        localStorage.setItem("username", "Admin");
        localStorage.setItem("password", adminSecret);
      }
    } catch (error) {
      console.log(error);
      //setLoginFail(true);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    };
    const response = await fetch("/admin/login/submit", requestOptions);
    if (response.ok) {
      const tokens = await response.json();
      sessionStorage.setItem("access", tokens.access_token);
      await handleChatLogin(e);
      sessionStorage.setItem("isAdmin", true);
      history.push("/chat");
    } else {
      setLoginFail(true);
      const res = await response.json();
      console.log(res);
    }
  }

  function formFailure() {
    if (loginFail) {
      return (
        <div className="error" style={{ alignContent: "center" }}>
          Username or password is incorrect
        </div>
      );
    }
  }

  // function redirectToSignup(res) {
  //   history.push("/signup");
  // }

  // function redirectForgotPassword(res) {
  //   history.push("/forgot-password");
  // }

  return (
    <div>
      <div id="Login-Panel" style={{ height: "350px" }}>
        <h1>Admin Login</h1>
        <Form onSubmit={handleLogin}>
          <Form.Group size="lg" controlId="email" className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon="envelope" />
              </InputGroup.Text>
              <Form.Control
                autoFocus
                placeholder="Username"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group size="lg" controlId="password" className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon="key" />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
          {formFailure()}
          <div id="Login-Aree">
            <Button
              id="Login-Button"
              block
              size="lg"
              type="submit"
              onClick={handleLogin}
              disabled={!validateForm()}
            >
              Log In
            </Button>
            <a href="/">Back to General Login</a>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AdminLogin;
