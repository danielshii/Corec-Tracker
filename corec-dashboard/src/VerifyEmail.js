import { React, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

function VerifyEmail() {
  const [emailCode, setEmailCode] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [error, setError] = useState();
  const history = useHistory();
  const location = useLocation();

  const email = location.email;
  const phone = location.phone;
  const password = location.password;

  console.log(email, phone, password);

  async function handleVerifySuccess(res) {
    const response = await fetch("/email/verify/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailCode: emailCode,
      }),
    });

    if (response.ok) {
      handleSendPhoneCode();
      history.push({
        pathname: "/phone/verify",
        email: email,
        password: password,
      });
    } else {
      setError(true);
      const res = await response.json();
      setErrMessage(res.message);
    }
  }

  async function handleSendPhoneCode() {
    const response = await fetch("/phone/code/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
      }),
    });
  }

  function displayError() {
    if (error) {
      return <b className="error">{errMessage}</b>;
    }
  }

  return (
    <div className="VerifyAccount">
      <h1>Verify Account</h1>
      <h2>Enter the verification code sent to your email</h2>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group size="lg" controlId="email code">
          <Form.Label>Email Verification Code</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
          />
        </Form.Group>
        <Button
          block
          size="lg"
          type="submit"
          onClick={handleVerifySuccess}
          disabled={emailCode.length == 0}
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

export default VerifyEmail;
