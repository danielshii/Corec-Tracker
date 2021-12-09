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
  ReferenceLine,
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
  FormCheck,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/fontawesome-free-solid";

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
  const [stdDevs, setStdDevs] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [todaysMin, setTodaysMin] = useState(0);
  const [todaysMax, setTodaysMax] = useState(0);
  const [todaysAverage, setTodaysAverage] = useState(0);
  const [averages, setAverages] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [forecastDay, setForecastDay] = useState(0);
  const [forecastTime, setForecastTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [weekBoundaries, setWeekBoundaries] = useState([0, 6]);
  const updateInterval = 10;
  const [weekIndex, setWeekIndex] = useState(-1);
  const [graphsLoading, setGraphsLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);
  const [sum, setSum] = useState(0);
  const [timeAmt, setTimeAmt] = useState(0);
  const [showAdvButton, setShowAdvButton] = useState(true);
  const [displayPopup, setDisplayPopup] = useState(false);
  const [dayStats, setDayStats] = useState(null);
  const [dayStatsSTD, setDayStatsSTD] = useState();
  const [timeBoundaries, setTimeBoundaries] = useState([0, 18]);
  const [graphLines, setGraphLines] = useState(
    new Array(7).fill(undefined).map(() => true)
  );
  //const [weekIndex, setWeekIndex] = useState(-1);

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

  // useEffect(() => {
  //   getAdvStatsSettings();
  // }, []);

  // async function getAdvStatsSettings() {
  //   const token = localStorage.getItem("remember")
  //     ? localStorage.getItem("access")
  //     : sessionStorage.getItem("access");
  //   const requestOptions = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       access: token,
  //     },
  //   };
  //   const response = await fetch("/settings/get", requestOptions);
  //   if (response.ok) {
  //     const res = await response.json();
  //     //setShowAdvButton(res.advStats);
  //   } else {
  //     const res = await response.json();
  //     console.log(res);
  //   }
  // }

  // useEffect(() => {
  //   if (dayStats) {
  //     let stdVal = [0, 0, 0, 0, 0, 0, 0];
  //     for (let i = 0; i < graphData.length; i++) {
  //       let t = graphData[i];
  //       stdVal[0] += (t.Mon - dayStats[0].avg) ** 2; //Sunday
  //       stdVal[1] += (t.Tue - dayStats[1].avg) ** 2; //Monday
  //       stdVal[2] += (t.Wed - dayStats[2].avg) ** 2; //Tuesday
  //       stdVal[3] += (t.Thu - dayStats[3].avg) ** 2; //Wednesday
  //       stdVal[4] += (t.Fri - dayStats[4].avg) ** 2; //Thursday
  //       stdVal[5] += (t.Sat - dayStats[5].avg) ** 2; //Friday
  //       stdVal[6] += (t.Sun - dayStats[6].avg) ** 2; //Saturday
  //     }
  //     let counter = timeAmt / 7;
  //     for (let i = 0; i < stdVal.length; i++) {
  //       stdVal[i] = Math.sqrt(stdVal[i] / counter).toFixed(2);
  //     }
  //     setDayStatsSTD(stdVal);
  //     console.log(stdVal);
  //   }
  // }, [dayStats]);

  // useEffect(() => {
  //   let tempMon = 0;
  //   let tempTue = 0;
  //   let tempWed = 0;
  //   let tempThu = 0;
  //   let tempFri = 0;
  //   let tempSat = 0;
  //   let tempSun = 0;
  //   let dayTempData = [];
  //   let counter = timeAmt / 7;
  //   for (let i = 0; i < graphData.length; i++) {
  //     let t = graphData[i];
  //     tempMon += t.Mon;
  //     tempTue += t.Tue;
  //     tempWed += t.Wed;
  //     tempThu += t.Thu;
  //     tempFri += t.Fri;
  //     tempSat += t.Sat;
  //     tempSun += t.Sun;
  //   }
  //   dayTempData.push({
  //     day: "Sun",
  //     avg: (tempSun / counter).toFixed(2),
  //   });
  //   dayTempData.push({
  //     day: "Mon",
  //     avg: (tempMon / counter).toFixed(2),
  //   });
  //   dayTempData.push({
  //     day: "Tue",
  //     avg: (tempTue / counter).toFixed(2),
  //   });
  //   dayTempData.push({
  //     day: "Wed",
  //     avg: (tempWed / counter).toFixed(2),
  //   });
  //   dayTempData.push({
  //     day: "Thu",
  //     avg: (tempThu / counter).toFixed(2),
  //   });
  //   dayTempData.push({
  //     day: "Fri",
  //     avg: (tempFri / counter).toFixed(2),
  //   });
  //   dayTempData.push({
  //     day: "Sat",
  //     avg: (tempSat / counter).toFixed(2),
  //   });
  //   console.log(dayTempData);
  //   setDayStats(dayTempData);
  // }, [sum, timeAmt]);

  // useEffect(() => {
  //   let tempSum = 0;
  //   let counter = 0;
  //   for (let i = 0; i < graphData.length; i++) {
  //     let t = graphData[i];
  //     tempSum += t.Mon + t.Tue + t.Wed + t.Thu + t.Fri + t.Sat + t.Sun;
  //     counter += 7;
  //   }
  //   setSum(tempSum);
  //   setTimeAmt(counter);
  // }, [graphData]);

  useEffect(() => {
    let interval = null;
    //console.log(tick);
    interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    handleGetLiveOccupancy();
    updateOccupancies();
  }, [tick, roomName]);

  useEffect(() => {
    updateWeeklyOccupancies();
  }, [weekIndex, weekBoundaries, roomName]);

  async function getAdvancedStatistics() {
    //setCardLoading(true);
    //console.log("fetching advanced stats...");
    //await sleep(10000);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: roomName,
      }),
    };
    const response = await fetch(`/records/advanced`, requestOptions);
    if (response.ok) {
      const res = await response.json();
      setMaxOccupancies(res.maximums);
      setMinOccupancies(res.minimums);
      setAverages(res.averages);
      setTodaysMax(res.todaysMax);
      setTodaysMin(res.todaysMin);
      setStdDevs(res.stdDevs);
      setTodaysAverage(res.todaysAverage);
    } else {
      const err = await response.json();
      console.log(err);
    }
    setCardLoading(false);
  }

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
      await getAdvancedStatistics(occupancies);
      //console.log(o);
    }
    setLoading(false);
    setGraphsLoading(false);
  }

  // async function getAdvancedStatistics(occupancies) {
  //   let o = occupancies[0].map((_, colIndex) =>
  //     occupancies.map((row) => row[colIndex])
  //   );
  //   setAverages(
  //     o.map((day, index) =>
  //       (day.reduce((a, b) => a + b, 0) / day.length).toFixed(2)
  //     )
  //   );
  //   setMinOccupancies(o.map((day, index) => Math.min(...day)));
  //   //console.log(minOccupancies);
  //   setMaxOccupancies(o.map((day, index) => Math.max(...day)));
  //   setCardLoading(false);
  // }

  async function updateWeeklyOccupancies() {
    if (weekIndex < 0) {
      // setWeeklyOccupancies(
      //   occupancies.map((day, index) =>
      //     (day.reduce((a, b) => a + b, 0) / day.length).toFixed(2)
      //   )
      // );
      setWeeklyOccupancies(averages);
      return;
    }
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
      const occ = res.occupancies;
      // console.log(averages);
      setWeeklyOccupancies(occ);
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
    if (liveOccupancy >= todaysMax) {
      fontColor = "textGreen";
    } else if (liveOccupancy <= todaysMin) {
      fontColor = "textRed";
    } else {
      fontColor = "textBlack";
    }
    return (
      <Card border="primary" id="RoomDataCard">
        <Card.Header>
          <span style={{ color: "black" }}>{date}</span>
        </Card.Header>
        <Card.Body>
          <Card.Text className={fontColor}>{renderCardText()}</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  function renderCardText() {
    if (cardLoading) {
      return <Spinner animation="border" className="textBlack vCenter" />;
    } else {
      return (
        <div>
          Current: {liveOccupancy}
          <Spinner variant="danger" animation="grow" size="sm" />
          <br />
          Max: {todaysMax} <br />
          Min: {todaysMin} <br />
          Average: {todaysAverage} <br />
          {showMoreRender()}
        </div>
      );
    }
  }

  function showMoreRender() {
    if (showAdvButton) {
      return <Button onClick={() => setDisplayPopup(true)}>Show More</Button>;
    }
  }

  function renderDataPopup() {
    return (
      <Modal show={displayPopup} onHide={() => setDisplayPopup(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <span style={{ color: "black" }}>
              Weekly Average + Standard Deviation
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderTablePopup()}</Modal.Body>
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
        <tbody>{renderTablePopupRows()}</tbody>
      </Table>
    );
  }

  function renderTablePopupRows() {
    let tData = [];
    for (let i = 0; i < days.length; i++) {
      tData.push(
        <tr>
          <td>{days[i]}</td>
          <td>{averages[i]}</td>
          <td>{stdDevs[i]}</td>
          <td>{getCompareToday(i)}</td>
        </tr>
      );
    }
    return tData;
  }

  function getCompareToday(index) {
    var curr = new Date(); // get current date
    var day = curr.getDay();
    // console.log(day);
    // console.log(dayStats);
    if (index == day) {
      return <p>---</p>;
    } else {
      if (todaysAverage < averages[index]) {
        return <FontAwesomeIcon icon="arrow-up" style={{ color: "green" }} />;
      } else if (todaysAverage == averages[index]) {
        return <FontAwesomeIcon icon="equals" style={{ color: "blue" }} />;
      } else {
        return <FontAwesomeIcon icon="arrow-down" style={{ color: "red" }} />;
      }
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
              <Spinner
                animation="border"
                size="lg"
                variant="primary"
                className="gCenter"
              />
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

  function renderTimeFilter() {
    return (
      <div>
        <select
          value={timeBoundaries[0]}
          defaultValue={timeBoundaries[0]}
          class="form-select"
          aria-label="Default select example"
          onChange={(e) => {
            e.preventDefault();
            setTimeBoundaries([parseInt(e.target.value), timeBoundaries[1]]);
          }}
        >
          {times.map((day, index) => {
            return (
              <option value={index} disabled={index >= timeBoundaries[1]}>
                {day}
              </option>
            );
          })}
        </select>
        <select
          value={timeBoundaries[1]}
          defaultValue={timeBoundaries[1]}
          class="form-select"
          aria-label="Default select example"
          onChange={(e) => {
            e.preventDefault();
            setTimeBoundaries([timeBoundaries[0], parseInt(e.target.value)]);
          }}
        >
          {times.map((day, index) => {
            return (
              <option value={index} disabled={index <= timeBoundaries[0]}>
                {day}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  function renderWeekFilter() {
    return (
      <div>
        <select
          value={weekBoundaries[0]}
          defaultValue={weekBoundaries[0]}
          class="form-select"
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
          value={weekBoundaries[1]}
          defaultValue={weekBoundaries[1]}
          class="form-select"
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
    );
  }

  function renderWeekSelection() {
    return (
      <div>
        <select
          onChange={(e) => {
            e.preventDefault();
            setWeekIndex(parseInt(e.target.value));
            //console.log(weekIndex);
          }}
        >
          <option value={-1}>All Weeks</option>
          {[0, 1, 2].map((week, index) => {
            return <option value={week}>Week of {getSunday(index)}</option>;
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
              <Accordion.Header>View By Time</Accordion.Header>
              <Accordion.Body>
                {renderTimeFilter()}
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    width={900}
                    height={300}
                    data={graphData.slice(
                      timeBoundaries[0],
                      timeBoundaries[1] + 1
                    )}
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
                    <Legend height={36} />
                    {days.map(
                      (day, index) =>
                        graphLines[index] && (
                          <Line
                            type="monotoneX"
                            dataKey={day}
                            stroke="#8884d8"
                            activeDot={{ r: 5 }}
                            stroke={chartColors[index]}
                          />
                        )
                    )}
                  </LineChart>
                </ResponsiveContainer>
                {renderGraphLineSelection()}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>View By Day</Accordion.Header>
              <Accordion.Body>
                {renderWeekFilter()}
                {renderWeekSelection()}
                <ResponsiveContainer height={400}>
                  <LineChart
                    width={900}
                    height={300}
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
                    <ReferenceLine
                      y={
                        weeklyOccupancies.reduce(
                          (partial_sum, a) => partial_sum + a,
                          0
                        ) / weeklyOccupancies.length
                      }
                      label="Average"
                      stroke="red"
                      strokeDasharray="3 3"
                      isFront={true}
                    />
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
        const weeklyAverages = averages.map((value, index) => {
          return {
            day: days[index],
            occupancy: value,
          };
        });
        return (
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>View By Time</Accordion.Header>
              <Accordion.Body>
                {renderTimeFilter()}
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    width={900}
                    height={300}
                    data={graphData.slice(
                      timeBoundaries[0],
                      timeBoundaries[1] + 1
                    )}
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
                    <Legend height={"36%"} />
                    {days.map(
                      (day, index) =>
                        graphLines[index] && (
                          <Bar dataKey={day} fill={chartColors[index]}></Bar>
                        )
                    )}
                  </BarChart>
                </ResponsiveContainer>
                {renderGraphLineSelection()}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>View By Day</Accordion.Header>
              <Accordion.Body>
                {renderWeekFilter()}
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    width={900}
                    height={300}
                    data={weeklyAverages.slice(
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
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend height={36} />
                    <Bar dataKey="occupancy" fill="#557799"></Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        );
      default:
        return <h1>NA</h1>;
    }
  }

  function renderGraphLineSelection() {
    return (
      <div>
        <Container>
          <Row>
            {days.map((day, index) => (
              <Col>
                <FormCheck
                  label={<p style={{ color: "black" }}>{day}</p>}
                  onChange={() => {
                    let newArr = [...graphLines];
                    newArr[index] = !newArr[index];
                    setGraphLines(newArr);
                  }}
                  checked={graphLines[index]}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    );
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
      <Accordion style={{ marginTop: "30px", marginBottom: "15px" }}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>View Advanced Stats</Accordion.Header>
          <Accordion.Body>
            {cardLoading ? (
              <Spinner animation="border" className="textBlack vCenter" />
            ) : (
              <div style={{ color: "black" }}>
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
                  busiest day while <b>{days[indexOfSmallest(averages)]}</b> is
                  the least busiest day
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
                  <b className="space">
                    {occupancies[forecastTime][forecastDay]}
                  </b>
                  people
                </div>
              </div>
            )}
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
      <Container style={{ margin: "-5px" }}>
        <Row xs={2}>
          <Col>
            <div style={{ width: "65vw" }}>
              <span className="vertical">
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
            </div>
          </Col>
          <Col>{displayMoreStats()}</Col>
        </Row>
      </Container>

      {displayAdvancedStats()}
      {/* <GoogleLogout
        clientId={cID}
        buttonText="Logout"
        onLogoutSuccess={logout}
      /> */}
      <div className="center">
        <i>Occupancy statistics are updated every {updateInterval} seconds</i>{" "}
        {/* <span>{renderLoading()}</span> */}
      </div>
    </div>
  );
}

export default Roompage;
