import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  FormCheck,
  Alert,
  Dropdown,
  DropdownButton,
  ButtonGroup,
  Modal,
} from "react-bootstrap";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NotLoggedIn from "./NotLoggedIn";
import Header from "./Header";
import Popup from "./Popup";

import RangeSlider from "rsuite/RangeSlider";
//import Slider from "rsuite/Slider"

function Settings() {
  const [emailsOn, setEmailsOn] = useState(true);
  const [smsOn, setSmsOn] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [disableEndTime, setDisableEndTime] = useState(true);
  const [startTime, setStartTime] = useState("Start Time");
  const [endTime, setEndTime] = useState("End Time");
  const [startTimeIndex, setStartTimeIndex] = useState(0);
  const [timeBoundaries, setTimeBoundaries] = useState([5, 24]);
  //const Slider = require("rc-slider");
  //const sliderWithTooltip = Slider.createSliderWithTooltip;
  const [notificationSettings, setNotificationSettings] = useState([
    {
      room: "Room 1",
      on: true,
      threshold: 10,
    },
    {
      room: "Room 2",
      on: true,
      threshold: 10,
    },
    {
      room: "Room 3",
      on: true,
      threshold: 10,
    },
    {
      room: "Room 4",
      on: true,
      threshold: 10,
    },
  ]);

  const timeFrame = [
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];

  function toggleRoom(roomName) {
    const roomNumber = parseInt(roomName.substring(5));
    let newSettings = [...notificationSettings];
    newSettings[roomNumber - 1].on = !newSettings[roomNumber - 1].on;
    setNotificationSettings(newSettings);
    console.log(
      "Toggled " + roomName + " to " + notificationSettings[roomNumber - 1].on
    );
    console.log(notificationSettings);
  }

  function changeThreshold(roomName, threshold) {
    let t = parseInt(threshold);
    const roomNumber = parseInt(roomName.substring(5));
    let newSettings = [...notificationSettings];
    newSettings[roomNumber - 1].threshold = t;
    setNotificationSettings(newSettings);
  }

  let renderNotifications = notificationSettings.map((notification) => {
    return (
      <div style={{ "margin-bottom": 40 }}>
        <FormCheck
          type="switch"
          label={notification.room}
          onChange={() => {
            toggleRoom(notification.room);
          }}
          checked={notification.on}
          disabled={!emailsOn && !smsOn}
        />

        <label>
          <div className="rowC">
            <p>
              Threshold:
              <b>{notification.threshold}</b>
            </p>
            <Slider
              defaultValue={notification.threshold}
              value={notification.threshold}
              onChange={(e) => changeThreshold(notification.room, e)}
              disabled={!notification.on || (!emailsOn && !smsOn)}
            />
          </div>
        </label>
      </div>
    );
  });

  async function handleSubmitNotifications() {
    let notifications = {};
    const token = localStorage.getItem("remember")
      ? localStorage.getItem("access")
      : sessionStorage.getItem("access");
    notificationSettings.forEach((notification) => {
      if (notification.on) {
        notifications[notification.room] = notification.threshold;
      }
    });
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access: token,
      },
      body: JSON.stringify({
        notifications: notifications,
        emailNotifications: emailsOn,
        smsNotifications: smsOn,
        startTime: timeBoundaries[0],
        endTime: timeBoundaries[1],
      }),
    };
    const response = await fetch(
      "/settings/notifications/update",
      requestOptions
    );
    if (!response.ok) {
      setAuthError(true);
      const res = await response.json();
      console.log(res);
      console.log("can't do that!");
    } else {
      setSettingsSaved(true);
    }
  }

  async function handleGetSettings() {
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
    const response = await fetch("/settings/get", requestOptions);
    if (response.ok) {
      //setAuthError(false);
      const res = await response.json();
      setEmailsOn(res.emailNotifications);
      setSmsOn(res.smsNotifications);
      let newNotifications = [...notificationSettings];
      newNotifications.forEach((setting) => {
        setting.on = setting.room in res.notifications;
        setting.threshold = res.notifications[setting.room];
      });
      setNotificationSettings(newNotifications);
      if ("startTime" in res && "endTime" in res) {
        console.log(res.startTime);
        const newBoundaries = [res.startTime, res.endTime];
        setStartTime(convertTo12HourTime(res.startTime));
        setTimeBoundaries([, timeBoundaries[1]]);
        setTimeBoundaries(newBoundaries);
      }
    } else {
      const res = await response.json();
      console.log(res);
      setAuthError(true);
    }
  }

  useEffect(() => {
    handleGetSettings();
  }, []);

  function displayError() {
    return <NotLoggedIn />;
  }

  function displaySettings() {
    return (
      <div>
        {/* {displayError()} */}
        <h1>
          <b>Settings</b>
        </h1>

        <FormCheck
          type="switch"
          label={<h4>Email Notifications</h4>}
          onChange={() => setEmailsOn(!emailsOn)}
          checked={emailsOn}
        />
        <FormCheck
          type="switch"
          label={<h4>SMS Notifications</h4>}
          onChange={() => setSmsOn(!smsOn)}
          checked={smsOn}
        />
        <hr />
        <p>
          <b>Receive notifications for...</b>
        </p>
        {renderNotifications}
        <hr />
        {renderTimeSlider()}
        <hr />
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleSubmitNotifications();
          }}
        >
          Save
        </Button>
      </div>
    );
  }

  function convertTo12HourTime(hour) {
    let timeString = "";
    if (hour == 24) {
      return `12 AM`;
    }
    if (hour < 12) {
      timeString = `${hour} AM`;
    } else {
      hour = hour % 12;
      if (hour == 0) {
        return `12 PM`;
      }
      timeString = `${hour % 12} PM`;
    }
    return timeString;
  }

  const { createSliderWithTooltip } = Slider;
  const Range = createSliderWithTooltip(Slider.Range);

  function renderTimeSlider() {
    return (
      <div
        className="range-slider"
        style={{ margin: "30px", marginBottom: "50px" }}
      >
        <p>
          <b>Receive notifications from</b>
        </p>
        <Range
          marks={{
            5: `5 AM`,
            24: convertTo12HourTime(24),
          }}
          min={5}
          max={24}
          defaultValue={timeBoundaries}
          tipFormatter={(value) => convertTo12HourTime(value)}
          tipProps={{
            placement: "top",
            visible: true,
          }}
          onAfterChange={(e) => setTimeBoundaries(e)}
          disabled={!emailsOn && !smsOn}
        />
      </div>
    );
  }
  const [buttonPopup, setButtonPopup] = useState(false);
  return (
    <div>
      {settingsSaved && (
        <Modal show={settingsSaved} onHide={() => setSettingsSaved(false)}>
          <Modal.Header closeButton>Settings Saved</Modal.Header>
        </Modal>
      )}
      <Header />
      <div className="settings">{displaySettings()}</div>
    </div>
  );
}

export default Settings;
