import { React, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Header from "./Header";
import {
  Alert,
  FormCheck,
  Spinner,
  Container,
  Row,
  Col,
  Modal,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
//import Star from "react-star-rating-component";
import Star from "./Star";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Dashboard() {
  const [rooms, setRooms] = useState({
    "Room 1": 0,
    "Room 2": 0,
    "Room 3": 0,
    "Room 4": 0,
  });

  const graphData = Object.entries(rooms).map(([key, value], index) => {
    return {
      room: key,
      occupancy: value,
      fill: `#${parseInt(
        0xaf77f9 * ((index + 1) / Object.keys(rooms).length)
      ).toString(16)}`,
    };
  });

  const [busiestRooms, setBusiestRooms] = useState([
    Object.keys(rooms).map((key, index) => {
      return { room: key, occupancy: rooms[key] };
    }),
  ]);
  console.log(busiestRooms);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [showPopup, setShowPopup] = useState(false);
  const [userNotifications, setUserNotifications] = useState({});

  console.log(selectedHour);

  const times = [
    "5 am",
    "6 am",
    "7 am",
    "8 am",
    "9 am",
    "10 am",
    "11 am",
    "12 pm",
    "1 pm",
    "2 pm",
    "3 pm",
    "4 pm",
    "5 pm",
    "6 pm",
    "7 pm",
    "8 pm",
    "9 pm",
    "10 pm",
    "11 pm",
  ];

  //const [user, setUser] = useState("");
  //const [showFavOnly, setShowFavOnly] = useState(false);
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [authError, setAuthError] = useState(false);
  const [tick, setTick] = useState(0);
  const [sorted, setSorted] = useState(false);
  const [loading, setLoading] = useState(true);

  //const rooms = ["Room 1", "Room 2", "Room 3", "Room 4"];
  const history = useHistory();

  useEffect(() => {
    sortRooms();
  }, [sorted]);

  useEffect(() => {
    handleGetFavorites();
    handleGetSettings();
    getOccupancies();
    handleGetBusiestRooms();
  }, []);

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
      //console.log(res);
      //const notifs = await res.notifications.json();
      setUserNotifications(res.notifications);
      console.log(userNotifications);
    } else {
      const res = await response.json();
      console.log(res);
      setAuthError(true);
    }
  }

  const getOccupancies = async (_) => {
    setLoading(true);
    await handleGetRecent();
    setLoading(false);
  };

  async function handleGetFavorites() {
    const token = localStorage.getItem("remember")
      ? localStorage.getItem("access")
      : sessionStorage.getItem("access");
    //console.log(token);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access: token,
      },
    };
    const response = await fetch(`/favorites/get`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      const o = res.rooms;
      //console.log(averages);
      setFavoriteRooms(o);
      //console.log(occupancies);
    } else if (response.status == 403) {
      setAuthError(true);
    }
  }

  function sortRooms() {
    let newRooms = {};
    if (sorted) {
      let sorted = Object.entries(rooms).sort((a, b) => a[1] - b[1]);
      //console.log("Sorted = " + sorted);
      for (var entry of sorted) {
        newRooms[entry[0]] = entry[1];
      }
    } else {
      newRooms = Object.keys(rooms)
        .sort()
        .reduce((obj, key) => {
          obj[key] = rooms[key];
          return obj;
        }, {});
    }
    setRooms(newRooms);
    //console.log("Sorted rooms " + newRooms);
  }

  async function handleGetRecent() {
    let newRooms = {};
    for (const [roomName, occupancy] of Object.entries(rooms)) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room: roomName,
        }),
      };
      const response = await fetch(`/process-room`, requestOptions);
      if (response.ok) {
        const res = await response.json();
        //handleChangeRooms(roomName, res.occupancy);
        //let newRooms = Object.assign({}, rooms);
        newRooms[roomName] = res.occupancy;
        //setRooms(newRooms);
        //console.log(newRooms);
        //console.log(rooms);
      } else {
        const res = await response.json();
        console.log(res);
      }
    }
    //console.log(newRooms);
    setRooms(newRooms);
  }

  async function handleAddFavorite(roomName) {
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
        room: roomName,
      }),
    };
    const response = await fetch(`/favorites/add`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      setFavoriteRooms(res.rooms);
      console.log(favoriteRooms);
    } else {
      const res = await response.json();
      console.log(res);
    }
  }

  async function handleRemoveFavorite(roomName) {
    const token = localStorage.getItem("remember")
      ? localStorage.getItem("access")
      : sessionStorage.getItem("access");
    console.log(roomName);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access: token,
      },
      body: JSON.stringify({
        room: roomName,
      }),
    };
    const response = await fetch(`/favorites/remove`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      setFavoriteRooms(res.rooms);
    }
  }

  function changeRoomFav(name) {
    if (favoriteRooms.includes(name)) {
      handleRemoveFavorite(name);
    } else {
      handleAddFavorite(name);
    }
  }

  function renderStar(item) {
    //console.log(item);
    if (!authError) {
      return (
        <Star
          room={item}
          selected={favoriteRooms.includes(item)}
          favChange={() => changeRoomFav(item)}
        />
      );
    }
  }

  function renderRooms() {
    let rowsToRender = [];
    Object.keys(rooms).forEach((item) => {
      let underThreshold =
        !authError &&
        item in userNotifications &&
        userNotifications[item] > rooms[item];

      rowsToRender.push(
        <div className="room-row" key={item}>
          <hr />
          <Link
            to={{
              pathname: "/room/" + encodeURIComponent(item),
            }}
          >
            <h3>{item}</h3>
          </Link>
          {renderStar(item)}
          <p>
            Most recent occupancy:{" "}
            <span
              style={{
                color: underThreshold ? "green" : "black",
                fontSize: underThreshold ? "larger" : "normal",
              }}
            >
              {rooms[item]}
            </span>
          </p>
          <hr />
        </div>
      );
    });
    return rowsToRender;
  }

  async function handleGetBusiestRooms() {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hour: selectedHour,
      }),
    };
    const response = await fetch(`/records/hour`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      console.log(res);
      setBusiestRooms(res.rooms);
    } else {
      const res = await response.json();
      console.log(res);
    }
  }

  function renderPopup() {
    return (
      <Modal
        show={showPopup}
        onHide={(e) => setShowPopup(false)}
        style={{ color: "black" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <b>Busiest Rooms at {times[selectedHour - 5]}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {busiestRooms?.map((entry, index) => (
            <span>
              <h3>{entry.room}</h3>
              <p>Average Occupancy: {entry.occupancy}</p>
            </span>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <DropdownButton
            title={times[selectedHour - 5]}
            variant="secondary"
            menuVariant="dark"
            defaultValue={selectedHour}
          >
            {times.map((time, index) => (
              <Dropdown.Item
                onClick={() => {
                  setSelectedHour(index + 5);
                  handleGetBusiestRooms();
                }}
              >
                {time}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <div>
      {renderPopup()}
      <Header />
      <h1> Dashboard </h1>
      {loading ? (
        <div className="fetching-loading">
          <h2>Fetching Occupancies</h2>
          <div class="dot-elastic"></div>
        </div>
      ) : (
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart
              width={"100%"}
              margin={{ top: 25, bottom: 0, right: 0, left: 0 }}
            >
              <Pie data={graphData} dataKey="occupancy" nameKey="room" label />
              <Tooltip />
              <Legend height={36} />
            </PieChart>
          </ResponsiveContainer>
          {renderRooms()}
          <Container style={{ padding: "0 45px" }}>
            <Row xs="auto">
              <Col xs="auto">
                <FormCheck
                  type="switch"
                  label={<p>Sort by Occupancy</p>}
                  onChange={() => setSorted(!sorted)}
                  checked={sorted}
                />
              </Col>
              <Col xs="auto">
                <Button
                  block
                  size="lg"
                  type="submit"
                  onClick={() => history.push("/favorites")}
                  disabled={authError}
                >
                  Show favorites only
                </Button>
              </Col>
              <Col xs="auto">
                <Button
                  variant="light"
                  onClick={() => setShowPopup(!showPopup)}
                >
                  More
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
