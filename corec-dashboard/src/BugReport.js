import { React, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Header from "./Header";
import { Alert, Spinner, Form } from "react-bootstrap";
import NotLoggedIn from "./NotLoggedIn";

const MAX_LENGTH = 200;

function BugReport() {
  const [bug, setBug] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [bugSent, setBugSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    authenticate();
  }, []);

  async function authenticate() {
    const token = localStorage.getItem("remember")
      ? localStorage.getItem("access")
      : sessionStorage.getItem("access");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access: token,
      },
    };
    const response = await fetch("/auth", requestOptions);
    if (response.ok) {
      setLoggedIn(true);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    const token = localStorage.getItem("remember")
      ? localStorage.getItem("access")
      : sessionStorage.getItem("access");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access: token,
      },
      body: JSON.stringify({
        bug: bug,
      }),
    };
    const response = await fetch("/report/send", requestOptions);
    if (response.ok) {
      setLoading(false);
      setBugSent(true);
    } else {
      const err = await response.json();
      setErrMessage(err.message);
      setBugSent(false);
    }
    setLoading(false);
  }

  return (
    <div>
      <Header />
      {loggedIn ? (
        <div>
          <h1>Send a Report</h1>
          <Form.Control
            placeholder="Describe your issue"
            value={bug}
            as="textarea"
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) setBug(e.target.value);
            }}
          />
          <p>
            {bug.length}/{MAX_LENGTH}
          </p>
          {errMessage.length > 0 && (
            <p style={{ color: "red" }}>{errMessage}</p>
          )}
          {bugSent && <p style={{ color: "green" }}>Report sent</p>}
          <Button
            disabled={bug.length == 0}
            type="submit"
            onClick={handleSubmit}
          >
            Submit Report
          </Button>
          {loading && <Spinner animation="border" />}
        </div>
      ) : (
        <NotLoggedIn />
      )}
    </div>
  );
}

export default BugReport;
