import { React, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router";

function TokenExpirePopup(props) {
  const history = useHistory();
  const handleClose = () => {
    console.log("hello");
    props.clickEvent();
    history.push("/");
  }
  return (
      <Modal show={props.show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Token Expiration</Modal.Title>
        </Modal.Header>
        <Modal.Body>Taking you back to login screen</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
  );
}

export default TokenExpirePopup;