import { React, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import CryptoJS from "crypto-js";

const secretKey = "not so secret key";

function VerifyPhone() {
  const [phoneCode, setPhoneCode] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [error, setError] = useState();
  const history = useHistory();
  const location = useLocation();

  const password = location.password;
  const email = location.email;

  async function handleChatLogin() {
    const encryptedSecret = CryptoJS.AES.encrypt(
      password,
      secretKey
    ).toString();
    sessionStorage.setItem("username", email);
    sessionStorage.setItem("password", encryptedSecret);
    const authHeader = {
      "Private-Key": "b35df4a0-b81b-45d0-b331-0b077b14d0bc",
    };
    try {
      const user = await axios.put(
        "https://api.chatengine.io/users/",
        {
          username: email,
          secret: password,
        },
        {
          headers: authHeader,
        }
      );
      localStorage.setItem("chat user ID", user.data.id);
    } catch (error) {
      console.log(error);
      //setLoginFail(true);
    }
  }

  async function handleVerifySuccess(res) {
    const response = await fetch("/phone/verify/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneCode: phoneCode,
      }),
    });

    if (response.ok) {
      const tokens = await response.json();
      sessionStorage.setItem("access", tokens.access_token);
      sessionStorage.setItem("refresh", tokens.refresh_token);
      handleChatLogin();
      history.push("/dashboard");
    } else {
      setError(true);
      const res = await response.json();
      setErrMessage(res.message);
    }
  }

  function displayError() {
    if (error) {
      return <b className="error">{errMessage}</b>;
    }
  }

  return (
    <div className="VerifyAccount">
      <h1>Verify Account</h1>
      <h2>Enter the verification code sent to your phone number</h2>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group size="lg" controlId="email code">
          <Form.Label>Phone Verification Code</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
          />
        </Form.Group>
        <Button
          block
          size="lg"
          type="submit"
          onClick={handleVerifySuccess}
          disabled={phoneCode.length == 0}
        >
          Verify
        </Button>
        <Button variant="secondary" onClick={() => history.push("/signup")}>
          Back
        </Button>
        {displayError()}
      </Form>
    </div>
  );
}

export default VerifyPhone;
