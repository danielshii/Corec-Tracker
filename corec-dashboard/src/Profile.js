import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button, Form, Alert, InputGroup, Modal } from "react-bootstrap";
import PhoneInput from "react-phone-number-input";
import "rc-slider/assets/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NotLoggedIn from "./NotLoggedIn";
import Header from "./Header";
import axios from "axios";

function Profile() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordDelete, setPasswordDelete] = useState("");
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const history = useHistory();

  function formatPhoneNumber(phoneNumber) {
    let formattedString = phoneNumber.substring(2);
    formattedString =
      formattedString.substring(0, 3) +
      "-" +
      formattedString.substring(3, 6) +
      "-" +
      formattedString.substring(6);
    return formattedString;
  }

  useEffect(() => {
    handleGetProfile();
  }, []);

  async function handleGetProfile() {
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
    const response = await fetch("/user/info", requestOptions);
    if (response.ok) {
      const res = await response.json();
      setEmail(res.email);
      setPhone(res.phone);
    } else {
      const err = await response.json();
      console.log(err);
      setAuthError(true);
    }
  }

  async function handleSendEmailCode() {
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
        email: newEmail,
      }),
    };
    const response = await fetch("/email/send-code", requestOptions);
    if (response.ok) {
      setEmailCodeSent(true);
      setEmailError("");
    } else {
      const err = await response.json();
      console.log(err);
      setEmailError(err.message);
    }
  }

  async function handleSendPhoneCode() {
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
        phone: newPhone,
      }),
    };
    const response = await fetch("/phone/send-code", requestOptions);
    if (response.ok) {
      setPhoneCodeSent(true);
      setPhoneError("");
    } else {
      const err = await response.json();
      console.log(err);
      setPhoneError(err.message);
    }
  }

  async function handleVerifyEmail() {
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
        newEmail: newEmail,
        oldEmail: email,
        code: emailCode,
      }),
    };
    const response = await fetch("/email/update/verify", requestOptions);
    if (response.ok) {
      window.location.reload(false);
    } else {
      const err = await response.json();
      console.log(err);
      setEmailError(err.message);
    }
  }

  async function handleVerifyPhone() {
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
        phone: newPhone,
        code: phoneCode,
      }),
    };
    const response = await fetch("/phone/update/verify", requestOptions);
    if (response.ok) {
      window.location.reload(false);
    } else {
      const err = await response.json();
      setPhoneError(err.message);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== passwordConfirm) {
      setPasswordChangeError("Passwords don't match!");
    } else {
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
          password: password,
          newPassword: newPassword,
        }),
      };
      const response = await fetch("/account/password/update", requestOptions);
      if (response.ok) {
        setPasswordChangeSuccess(true);
      } else {
        const err = await response.json();
        setPasswordChangeError(err.message);
      }
    }
  }

  async function deleteChatAccount() {
    const authHeader = {
      "Private-Key": "b35df4a0-b81b-45d0-b331-0b077b14d0bc",
    };
    try {
      const id = localStorage.getItem("chat user ID");
      await axios.delete(`https://api.chatengine.io/users/${id}/`, {
        headers: authHeader,
      });
    } catch (error) {
      console.log(error);
      //setLoginFail(true);
    }
  }

  async function handleDeleteAccount() {
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
        password: passwordDelete,
      }),
    };
    const response = await fetch("/account/delete", requestOptions);
    if (response.ok) {
      deleteChatAccount();
      localStorage.clear();
      sessionStorage.clear();
      history.push("/");
    } else {
      const err = await response.json();
      setDeleteError(err.message);
    }
  }

  const changeEmail = (
    <span>
      <p>Change Email</p>
      <InputGroup>
        <Form.Control
          autoFocus
          type="email"
          placeholder="New Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Button disabled={newEmail.length == 0} onClick={handleSendEmailCode}>
          Update
        </Button>
      </InputGroup>
    </span>
  );

  const changePhone = (
    <span>
      <p>Change Phone Number</p>
      <InputGroup>
        <PhoneInput
          defaultCountry="US"
          placeholder="Phone Number"
          value={newPhone}
          onChange={setNewPhone}
        />
        <Button //disabled={newPhone.length == 0}
          onClick={handleSendPhoneCode}
        >
          Update
        </Button>
      </InputGroup>
    </span>
  );

  const verifyEmail = (
    <span>
      <p>Verification Code</p>
      <InputGroup>
        <Form.Control
          autoFocus
          placeholder="Verification Code"
          value={emailCode}
          onChange={(e) => setEmailCode(e.target.value)}
        />
        <Button disabled={emailCode.length == 0} onClick={handleVerifyEmail}>
          Verify
        </Button>
      </InputGroup>
    </span>
  );

  const verifyPhone = (
    <span>
      <p>Verification Code</p>
      <InputGroup>
        <Form.Control
          autoFocus
          placeholder="Verification Code"
          value={phoneCode}
          onChange={(e) => setPhoneCode(e.target.value)}
        />
        <Button disabled={phoneCode.length == 0} onClick={handleVerifyPhone}>
          Verify
        </Button>
      </InputGroup>
    </span>
  );

  const changePassword = (
    <span>
      <p>Change Password</p>
      <InputGroup>
        <Form.Control
          autoFocus
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Form.Control
          autoFocus
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Form.Control
          autoFocus
          type="password"
          placeholder="Confirm New Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        <Button
          disabled={
            password.length == 0 &&
            newPassword.length == 0 &&
            passwordConfirm.length == 0
          }
          onClick={handleChangePassword}
        >
          Update Password
        </Button>
      </InputGroup>
      {passwordChangeError.length > 0 && (
        <p className="error">{passwordChangeError}</p>
      )}
    </span>
  );

  const deleteAcc = (
    <span>
      <p>Password</p>
      <InputGroup>
        <Form.Control
          autoFocus
          type="password"
          placeholder="Password"
          value={passwordDelete}
          onChange={(e) => setPasswordDelete(e.target.value)}
        />
        <Button
          variant="danger"
          disabled={passwordDelete.length == 0}
          onClick={handleDeleteAccount}
        >
          Delete Account
        </Button>
      </InputGroup>
    </span>
  );

  return authError ? (
    <NotLoggedIn />
  ) : (
    <div>
      <Modal
        show={passwordChangeSuccess}
        onHide={() => setPasswordChangeSuccess(false)}
      >
        <Modal.Header closeButton>Password Updated</Modal.Header>
      </Modal>
      <Header />
      <hr />
      <h1>
        <b>Profile</b>
      </h1>
      <p>
        Email: <b>{email}</b>
      </p>
      {emailCodeSent ? verifyEmail : changeEmail}
      {emailError.length > 0 && <div className="error">{emailError}</div>}
      <hr />
      <p>
        Phone Number: <b>{formatPhoneNumber(phone)}</b>
      </p>
      {phoneCodeSent ? verifyPhone : changePhone}
      <hr />
      {changePassword}
      <hr />
      <Button variant="danger" onClick={() => setDeleteAccount(true)}>
        Delete Account
      </Button>

      {deleteAccount ? deleteAcc : ""}
      {deleteError.length > 0 && <div className="error">{deleteError}</div>}
    </div>
  );
}

export default Profile;
