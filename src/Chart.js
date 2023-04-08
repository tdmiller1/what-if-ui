import React, { useState } from "react";
import { useQuery } from "react-query";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function dateFormat(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
export default function Chart() {
  const lastYear = new Date("01/01/2020");
  const [ticker, setTicker] = useState("SPY");
  const [amount, setAmount] = useState(500);
  const [startDate, setStartDate] = useState(lastYear);
  const [endDate, setEndDate] = useState(new Date());
  const [form, setForm] = useState({ ticker, startDate, endDate, amount });

  function handleSubmit() {
    setForm({
      amount,
      ticker,
      startDate,
      endDate,
    });
  }

  return (
    <>
      <div
        style={{
          marginTop: 32,
          marginBottom: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <label for="ticker">Ticker Symbol</label>
        <input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <label for="amount">Contribution Amount</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <label for="startDate">Start Date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
        <label for="endDate">End Date</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button style={{ marginTop: 32 }} onClick={() => handleSubmit()}>
          Submit
        </button>
      </div>
      <MoreChart {...form} />
      <StockChart {...form} />
    </>
  );
}

const MoreChart = ({ ticker, amount, startDate, endDate }) => {
  const { data, isLoading } = useQuery(
    ["data", ticker, amount, startDate, endDate],
    async () => {
      const response = await fetch(
        `${
          process.env.REACT_APP_BACKEND
        }/data?ticker=${ticker}&amount=${amount}&startDate=${dateFormat(
          new Date(startDate)
        )}&endDate=${dateFormat(new Date(endDate))}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }
  );
  if (isLoading) {
    return "LOADING";
  }
  const options = {
    title: {
      text: "",
    },
    xAxis: {
      type: "datetime",
    },
    series: [
      {
        name: "Contribution Amount",
        data: data?.payments?.map((item, index) => {
          return [
            new Date(item.timestamp).getTime() / 1000,
            item.runningContributionAmount,
          ];
        }),
      },
      {
        name: "Portfolio Balance",
        data: data?.payments?.map((item, index) => [
          new Date(item.timestamp).getTime() / 1000,
          item.runningBalance,
        ]),
      },
    ],
  };

  return (
    <>
      <h1>What if</h1>
      <p>
        You invested <span style={{ color: "green" }}>${amount}</span> in{" "}
        <span style={{ color: "blue" }}>{ticker}</span> every month starting on{" "}
        {!new Date(startDate) ? "" : new Date(startDate)?.toLocaleDateString()}{" "}
        You would have saved{" "}
        <span style={{ color: "green" }}>
          ${data?.balance?.toLocaleString()}
        </span>
      </p>
      <h2>Portfolio Data</h2>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
};

const StockChart = ({ ticker, startDate, endDate }) => {
  const { data, isLoading } = useQuery(
    ["stock", ticker, startDate, endDate],
    async () => {
      const response = await fetch(
        `${
          process.env.REACT_APP_BACKEND
        }/stock?ticker=${ticker}&startDate=${dateFormat(
          new Date(startDate)
        )}&endDate=${dateFormat(new Date(endDate))}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    }
  );
  if (isLoading) {
    return "LOADING";
  }
  const options = {
    title: {
      text: ticker,
    },
    xAxis: {
      type: "datetime",
    },
    series: [
      {
        name: "Price",
        data:
          data !== undefined &&
          Object.entries(data?.chartData).map((entry) => {
            return [parseFloat(entry[0]), entry[1]];
          }),
      },
    ],
  };

  return (
    <>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
};
