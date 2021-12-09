import { Alert } from "react-bootstrap";
import React from "react";

function NotLoggedIn() {
  return (
    <div>
      <Alert dismissible={false} key={0} variant="danger">
        <Alert.Heading>Oops! It seems like you're not logged in.</Alert.Heading>
        <p>
          You can <Alert.Link href="/">log in</Alert.Link> if you already have
          an account or{" "}
          <Alert.Link href="/signup">create an account</Alert.Link>.
        </p>
      </Alert>
    </div>
  );
}

export default NotLoggedIn;
