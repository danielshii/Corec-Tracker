import { React, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { sendMessage, isTyping } from "react-chat-engine";

const MessageForm = (props) => {
  const [message, setMessage] = useState("");
  const { chatId, creds } = props;

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length > 0) {
      sendMessage(creds, chatId, { text });
      setMessage("");
    }
  };

  const handleUpload = (e) => {
    sendMessage(creds, chatId, { files: e.target.files, text: "" });
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    isTyping(props, chatId);
  };

  return (
    <Container>
      <Row>
        <Col xs={10}>
          <form className="message-form" onSubmit={handleSubmit}>
            <input
              className="message-input"
              placeholder="Type Your Message..."
              value={message}
              onChange={handleChange}
            />
          </form>
          <label htmlFor="upload-button">
            <span className="image-button">Upload Image</span>
          </label>
          <input
            type="file"
            multiple={false}
            id="upload-button"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </Col>
        <Col>
          <Button type="submit" onClick={handleSubmit}>
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default MessageForm;
