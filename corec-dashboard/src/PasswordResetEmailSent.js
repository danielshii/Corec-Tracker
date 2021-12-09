import {React, useState} from "react";
import { useHistory } from "react-router";
import { Button } from "react-bootstrap";


function PasswordResetEmailSent() {
    const history = useHistory();

    function redirectToLogin(res) {
        history.push('/');
    }

    return (
        <div className="margins">
            <h1>
                A link to reset your password was sent to your email.
            </h1>
            <Button onClick={redirectToLogin}>
                Back to Login
            </Button>
        </div>
    )
}

export default PasswordResetEmailSent