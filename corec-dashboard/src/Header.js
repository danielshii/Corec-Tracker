import { React, useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useHistory } from "react-router";

function Header() {
  const history = useHistory();
  const [loggedIn, setLoggedIn] = useState(false);
  const admin = sessionStorage.getItem("isAdmin");

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

  async function signOut() {
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
    const response = await fetch(`/logout`, requestOptions);
    if (response.ok) {
      //console.log(averages);
      //console.log(occupancies);
      localStorage.clear();
      sessionStorage.clear();
      setLoggedIn(false);
      history.push("/");
    }
  }
  const rooms = ["Room 1", "Room 2", "Room 3", "Room 4"];

  function redirectToRoom(room) {
    history.push(`/room/${encodeURIComponent(room)}`);
  }

  function redirectToSettings() {
    history.push("/settings");
  }

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <div className="header">
      <Navbar bg="light" variant="light">
        <Container>
          <Navbar.Brand href="/dashboard">
            <b>Corec Tracker</b>
          </Navbar.Brand>
          <Nav className="core-nav">
            {!admin && <Nav.Link href="/dashboard">Home</Nav.Link>}
            {!loggedIn && <Nav.Link href="/">Log In</Nav.Link>}
            {loggedIn && !admin && (
              <Nav.Link href="/chat">Chat with an Admin</Nav.Link>
            )}
            {!loggedIn && <Nav.Link href="/signup">Sign Up</Nav.Link>}
            {(loggedIn || admin) && (
              <Nav.Link>
                <span onClick={() => signOut()}>Log Out</span>
              </Nav.Link>
            )}
            {loggedIn && !admin ? (
              <Nav.Link href="/profile">Profile</Nav.Link>
            ) : (
              ""
            )}
            {!admin && (
              <Nav.Link href="/settings">
                <span>Settings</span>
              </Nav.Link>
            )}
            {loggedIn && !admin && (
              <Nav.Link href="/report">Report a Bug</Nav.Link>
            )}
            <DropdownButton title="Rooms">
              {rooms.map((room, index) => (
                <Dropdown.Item href={`/room/${encodeURIComponent(room)}`}>
                  <span>{room}</span>
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
