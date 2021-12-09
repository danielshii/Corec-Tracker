import { React, useState } from "react";
import { useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

function Signup(props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const history = useHistory();

  function validateForm() {
    return email.length > 0 && password.length > 0 && name.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  async function handleSignupSuccess(res) {
    if (password !== passwordConfirm) {
      setError(true);
      setErrMessage("Passwords do not match!");
      return;
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
        phone: phone,
      }),
    };
    const response = await fetch("/signup/submit", requestOptions);
    //console.log(json);
    if (response.status === 200) {
      history.push({
        pathname: "/email/verify",
        email: email,
        phone: phone,
        password: password,
      });
    } else {
      setError(true);
      const x = await response.json();
      console.log(x.message);
      setErrMessage(x.message);
    }
    //setLogIn();
  }

  function displayError() {
    if (error) {
      return <b style={{ color: "red" }}>{errMessage}</b>;
    }
  }

  return (
    <div className="margins">
      <h1>Sign Up</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="phone">
          <PhoneInput
            defaultCountry="US"
            placeholder="Phone Number"
            value={phone}
            onChange={setPhone}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </Form.Group>
        <Button
          block
          size="lg"
          type="submit"
          onClick={handleSignupSuccess}
          disabled={!validateForm()}
        >
          Sign Up
        </Button>
        <Button size="lg" variant="secondary" onClick={() => history.push("/")}>
          Back
        </Button>
      </Form>
      {displayError()}
    </div>
  );
}

export default Signup;
