import { React, useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { useHistory } from "react-router";

function Header() {
  const history = useHistory();

  function signOut() {
    fetch("/logout")
      .then((res) => res.json())
      .then((response) => {
        if (response.message) {
          console.log(response);
        }
      });
  }
  const rooms = [1, 2, 3, 4];

  function redirectToRoom(event, roomNumber) {
    event.preventDefault();
    history.push(`/room/${roomNumber}`);
  }

  return (
    <Navbar bg="light" variant="light">
      <Container>
        <Navbar.Brand href="#home">Corec-Tracker</Navbar.Brand>
        <Nav className="core-nav">
          <Nav.Link href="/dashboard">Home</Nav.Link>
          {/* <Nav.Link href="/">Settings</Nav.Link> */}
          <Nav.Link href="/">
            <span onClick={signOut}>Logout</span>
          </Nav.Link>
          {rooms.map((roomNumber, index) => (
            <Nav.Link href="/">
              <span onClick={(e) => redirectToRoom(e, roomNumber)}>
                Room {roomNumber}
              </span>
            </Nav.Link>
          ))}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;
