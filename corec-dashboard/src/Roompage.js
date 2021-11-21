import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  CartesianGrid,
  Bar,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import Header from "./Header";
import {
  Col,
  Row,
  Spinner,
  Accordion,
  Dropdown,
  DropdownButton,
  Container,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Card from 'react-bootstrap/Card';
import Button from "react-bootstrap/Button";
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';


const cID =
  "608867787381-cvgulq19nomsanr5b3ho6i2kr1ikocbs.apps.googleusercontent.com";

function Roompage() {
  const [occupancies, setOccupancies] = useState(
    [...new Array(19)].map(() => [0, 0, 0, 0, 0, 0, 0])
  );

  const [weeklyOccupancies, setWeeklyOccupancies] = useState([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [maxOccupancies, setMaxOccupancies] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [minOccupancies, setMinOccupancies] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [averages, setAverages] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [forecastDay, setForecastDay] = useState(0);
  const [forecastTime, setForecastTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [weekBoundaries, setWeekBoundaries] = useState([0, 6]);
  const updateInterval = 10;
  const [weekIndex, setWeekIndex] = useState(0);
  const [graphsLoading, setGraphsLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);
  const [sum, setSum] = useState(0);
  const [timeAmt, setTimeAmt] = useState(0);
  const [displayPopup, setDisplayPopup] = useState(false);
  const [dayStats, setDayStats] = useState(null);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartColors = [
    "#F00000",
    "#ff7605",
    "#ffcf24",
    "#00e016",
    "#005de0",
    "#7800e0",
    "#e00056",
  ];

  const [liveOccupancy, setLiveOccupancy] = useState(0);

  //we probably need to have separate graphs for each room
  const [graphs, setGraphs] = useState([]);

  const { roomName } = useParams();

  // function convertTo12HourTime(hour) {
  //   let time = "";
  //   if (hour < 12) {
  //     return `${hour} AM`;
  //   } else {
  //     return `${hour % 12} PM`;
  //   }
  // }

  function createData(t, index) {
    return {
      time: t,
      [days[0]]: occupancies[index][0],
      [days[1]]: occupancies[index][1],
      [days[2]]: occupancies[index][2],
      [days[3]]: occupancies[index][3],
      [days[4]]: occupancies[index][4],
      [days[5]]: occupancies[index][5],
      [days[6]]: occupancies[index][6],
    };
  }

  function createWeeklyData(index) {
    return {
      day: days[index],
      occupancy: weeklyOccupancies[index],
    };
  }

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

  const graphData = times.map((element, index) => createData(element, index));

  const weeklyGraphData = weeklyOccupancies.map((element, index) =>
    createWeeklyData(index)
  );

  useEffect(() => {
    let tempMon = 0;
    let tempTue = 0;
    let tempWed = 0;
    let tempThu = 0;
    let tempFri = 0;
    let tempSat = 0;
    let tempSun = 0;
    let dayTempData = [];
    let counter = timeAmt / 7;
    for (let i = 0; i < graphData.length; i++) {
      let t = graphData[i];
      tempMon += t.Mon;
      tempTue += t.Tue;
      tempWed += t.Wed;
      tempThu += t.Thu;
      tempFri += t.Fri;
      tempSat += t.Sat;
      tempSun += t.Sun;
    }
    dayTempData.push({
      'day': 'Mon',
      'avg':  (tempMon / counter).toFixed(2)
    });
    dayTempData.push({
      'day': 'Tue',
      'avg':  (tempTue / counter).toFixed(2)
    });
    dayTempData.push({
      'day': 'Wed',
      'avg':  (tempWed / counter).toFixed(2)
    });
    dayTempData.push({
      'day': 'Thu',
      'avg':  (tempThu / counter).toFixed(2)
    });
    dayTempData.push({
      'day': 'Fri',
      'avg':  (tempFri / counter).toFixed(2)
    });
    dayTempData.push({
      'day': 'Sat',
      'avg':  (tempSat / counter).toFixed(2)
    });
    dayTempData.push({
      'day': 'Sun',
      'avg':  (tempSun / counter).toFixed(2)
    });
    console.log(dayTempData);
    setDayStats(dayTempData);
  }, [sum, timeAmt]);

  useEffect(() => {
    let tempSum = 0;
    let counter = 0;
    for (let i = 0; i < graphData.length; i++) {
      let t = graphData[i];
      tempSum += t.Mon + t.Tue + t.Wed + t.Thu + t.Fri + t.Sat + t.Sun;
      counter += 7;
    }
    setSum(tempSum);
    setTimeAmt(counter);
  }, [graphData]);

  useEffect(() => {
    let interval = null;
    //console.log(tick);
    interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    updateOccupancies();
    handleGetLiveOccupancy();
  }, [tick, roomName]);

  useEffect(() => {
    updateWeeklyOccupancies();
  }, [weekIndex, weekBoundaries, roomName]);

  // async function getAdvancedStatistics() {
  //   //console.log("fetching advanced stats...");
  //   //await sleep(10000);
  //   const requestOptions = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       room: roomName,
  //     }),
  //   };
  //   const response = await fetch(`/records/advanced`, requestOptions);
  //   if (response.ok) {
  //     const res = await response.json();
  //     setMaxOccupancies(res.maximums);
  //     setMinOccupancies(res.minimums);
  //     setAverages(res.averages);
  //   }
  // }

  async function updateOccupancies() {
    //console.log("fetching graph data...");
    //await sleep(10000);
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: roomName,
      }),
    };
    const response = await fetch(`/records/get`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      const o = res.occupancies;
      setOccupancies(o);
      getAdvancedStatistics(occupancies);
      //console.log(o);
    }
    setLoading(false);
    setGraphsLoading(false);
  }

  function getAdvancedStatistics(occupancies) {
    let o = occupancies[0].map((_, colIndex) =>
      occupancies.map((row) => row[colIndex])
    );
    setAverages(
      o.map((day, index) =>
        (day.reduce((a, b) => a + b, 0) / day.length).toFixed(2)
      )
    );
    setMinOccupancies(o.map((day, index) => Math.min(...day)));
    //console.log(minOccupancies);
    setMaxOccupancies(o.map((day, index) => Math.max(...day)));
    setCardLoading(false);
  }

  async function updateWeeklyOccupancies() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: roomName,
        week: weekIndex,
      }),
    };
    const response = await fetch("/records/week", requestOptions);
    if (response.ok) {
      const res = await response.json();
      const averages = res.occupancies;
      // console.log(averages);
      setWeeklyOccupancies(averages);
    }
  }

  async function handleGetLiveOccupancy() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: roomName,
      }),
    };
    const response = await fetch(`/process-room`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      const occupancy = res.occupancy;
      //console.log(averages);
      setLiveOccupancy(occupancy);
      //console.log(occupancy);
    }
  }

  function getSunday(index) {
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    // first.setDate(first. - 7 * index);
    var firstday = new Date(curr.setDate(first - 7 * index));

    return `${firstday.getMonth() + 1}/${firstday.getDate().toString()}`;
  }

  function displayMoreStats() {
    var curr = new Date();
    let month = curr.getMonth() + 1;
    let day = curr.getDate();
    let year = curr.getFullYear();
    let date = month + "/" + day + "/" + year;
    let fontColor = "";
    if (liveOccupancy >= maxOccupancies[curr.getDay()]) {
      fontColor = "textGreen";
    }
    else if (liveOccupancy <= minOccupancies[curr.getDay()]) {
      fontColor = "textRed";
    }
    else {
      fontColor = "textBlack"
    }
    return (
      <Card border="primary" id="RoomDataCard">
      <Card.Header>{date}</Card.Header>
      <Card.Body>
        <Card.Text className={fontColor}>
          {renderCardText()}
        </Card.Text>
      </Card.Body>
      </Card>
    );
  }
  
  function renderCardText() {
    if (cardLoading) {
      return <Spinner animation="border" className="textBlack vCenter"/>
    }
    else {
      var curr = new Date();
      return (
        <div>
          Current: {liveOccupancy} {" "} 
          <Spinner variant="danger" animation="grow" size="sm" />
          <br />
          Max: {maxOccupancies[curr.getDay()]} <br />
          Min: {minOccupancies[curr.getDay()]} <br />
          <Button onClick={() => setDisplayPopup(true)}>Show More</Button> 
        </div>
      )
    }
  }

  function renderDataPopup() {
    return (
        <Modal show={displayPopup} onHide={() => setDisplayPopup(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Weekly Avg + Std Dev</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderTablePopup()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDisplayPopup(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function renderTablePopup() {
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Day</th>
            <th>Average</th>
            <th>Standard Deviation</th>
            <th>Compare to Today</th>
          </tr>
        </thead>
        <tbody>
          {renderTablePopupRows()}
        </tbody>
      </Table>
    )
  }

  function renderTablePopupRows() {
    if (dayStats) {
      let tData = [];
      for (let i = 0; i < dayStats.length; i++) {
        tData.push(
          <tr>
            <td>{dayStats[i].day}</td>
            <td>{dayStats[i].avg}</td>
            <td>test</td>
            <td>123</td>
          </tr>
        );
      }
      return tData;
    }
  }

  function renderLoading() {
    if (loading) {
      return <Spinner animation="border" size="sm" />;
    }
  }

  function renderGraphsLoading() {
    if (loading) {
      return (
        <Container>
          {/* <Row>
            <h3>
              <i>Loading Graphs...</i>
            </h3>
          </Row> */}
          <Row>
            <div className="center">
              <Spinner animation="border" size="lg" variant="primary" className="gCenter"/>
            </div>
          </Row>
        </Container>
      );
    }
  }

  function updateBoundaries(index, value) {
    let newBoundaries = [...weekBoundaries];
    newBoundaries[index] = value;
    setWeekBoundaries(newBoundaries);
  }

  function renderFilterOption() {
    return (
      <div>
        <div className="dayRange">
        <select
          defaultValue={0}
          className="form-select filterSelect"
          aria-label="Default select example"
          onChange={(e) => {
            e.preventDefault();
            updateBoundaries(0, parseInt(e.target.value));
            console.log(e.target.value, weekBoundaries);
          }}
        >
          {days.map((day, index) => {
            return (
              <option value={index} disabled={index >= weekBoundaries[1]}>
                {day}
              </option>
            );
          })}
        </select>
        <select
          defaultValue={6}
          className="form-select filterSelect"
          aria-label="Default select example"
          onChange={(e) => {
            e.preventDefault();
            updateBoundaries(1, parseInt(e.target.value));
            console.log(e.target.value, weekBoundaries);
          }}
        >
          {days.map((day, index) => {
            return (
              <option value={index} disabled={index <= weekBoundaries[0]}>
                {day}
              </option>
            );
          })}
        </select>
        </div>
        <select onChange={(e) => setWeekIndex(parseInt(e.target.value))}>
          {[0, 1, 2].map((week, index) => {
            return <option value={index}>Week of {getSunday(index)}</option>;
          })}
        </select>
      </div>
    );
  }

  function renderChart(chart) {
    if (graphsLoading) {
      return renderGraphsLoading();
    }
    switch (chart) {
      case "Line Graph":
        return (
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>View by time</Accordion.Header>
              <Accordion.Body>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    // width={1200}
                    // height={300}
                    data={graphData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={sum / timeAmt} label="Avg" stroke="red" strokeDasharray="3 3" isFront={true}/>
                    <Legend height={36} />
                    {days.map((day, index) => (
                      <Line
                        type="monotoneX"
                        dataKey={day}
                        stroke="#8884d8"
                        activeDot={{ r: 5 }}
                        stroke={chartColors[index]}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>View by day</Accordion.Header>
              <Accordion.Body>
                {renderFilterOption()}
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    // width={1200}
                    // height={300}
                    data={weeklyGraphData.slice(
                      weekBoundaries[0],
                      weekBoundaries[1] + 1
                    )}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend height={36} />
                    <Line dataKey="occupancy" type="monotoneX" />
                  </LineChart>
                </ResponsiveContainer>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        );
        break;
      case "Bar Chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              // width={1200}
              // height={300}
              data={graphData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend height={36} />
              {days.map((day, index) => (
                <Bar dataKey={day} fill={chartColors[index]}></Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return <h1>NA</h1>;
    }
  }

  function indexOfSmallest(a) {
    var lowest = 0;
    for (var i = 1; i < a.length; i++) {
      if (a[i] < a[lowest]) lowest = i;
    }
    return lowest;
  }

  function indexOfLargest(a) {
    var highest = 0;
    for (var i = 1; i < a.length; i++) {
      if (a[i] > a[highest]) highest = i;
    }
    return highest;
  }

  function displayAdvancedStats() {
    return (
      <Accordion style={{marginTop: '30px', marginBottom: "15px"}}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>View Advanced Stats</Accordion.Header>
          <Accordion.Body>
            {days.map((day, index) => (
              <p>
                The average occupancy on <b>{day}</b> is around{" "}
                <b>{averages[index]}</b> people with a max occupancy of{" "}
                <b>{maxOccupancies[index]}</b> people and a minimum of{" "}
                <b>{minOccupancies[index]}</b> people
              </p>
            ))}
            <p>
              It seems like <b>{days[indexOfLargest(averages)]}</b> is the
              busiest day while <b>{days[indexOfSmallest(averages)]}</b> is the
              least busiest day
            </p>
            <div className="flexAlign">
              The predicted occupancy for
              <DropdownButton
                title={days[forecastDay]}
                size="sm"
                variant="secondary"
                className="space"
                menuVariant="dark"
                drop="up"
              >
                {days.map((day, index) => (
                  <Dropdown.Item onClick={() => setForecastDay(index)}>
                    {day}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
              at
              <DropdownButton
                title={times[forecastTime]}
                size="sm"
                variant="secondary"
                className="space"
                menuVariant="dark"
                drop="up"
              >
                {times.map((time, index) => (
                  <Dropdown.Item onClick={() => setForecastTime(index)}>
                    {time}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
              is
              <b className="space">{occupancies[forecastTime][forecastDay]}</b>
              people
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  }

  return (
    <div className="vertical">
      {renderDataPopup()}
      <Header />
      <h1 className="center">{roomName}</h1>
      <h2 className="center">
        {/* <Col>
          Live Occupancy: <b>{liveOccupancy}</b>{" "}
          <Spinner variant="danger" animation="grow" size="sm" />
        </Col> */}
      </h2>
      <div className="flexSpace">
        <span className="vertical" style={{width: '80%'}}>
          <Tabs
            id="chart tabs"
            defaultActiveKey="Line Graph"
            // onSelect={(k) => {
            //   setChartType(k);
            //   console.log(chartType);
            // }}
          >
            {["Line Graph", "Bar Chart"].map((element, index) => (
              <Tab eventKey={element} title={element}>
                {renderChart(element)}
                {/* <h1>{element}</h1> */}
              </Tab>
            ))}
          </Tabs>
        </span>
        {displayMoreStats()}
        {/* {renderChart(0)}
        {renderChart(1)} */}
      </div>
      {displayAdvancedStats()}
      {/* <GoogleLogout
        clientId={cID}
        buttonText="Logout"
        onLogoutSuccess={logout}
      /> */}
      <div className="center">
        <i>Occupancy statistics are updated every {updateInterval} seconds</i> {" "}
        {/* <span>{renderLoading()}</span> */}
      </div>
    </div>
  );
}

export default Roompage;
