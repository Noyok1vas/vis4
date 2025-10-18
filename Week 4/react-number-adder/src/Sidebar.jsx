//sidebar.jsx
import "./Sidebar.css";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

function Sidebar() {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.count);
  const history = useSelector((state) => state.history);

  const [summary, setSummary] = useState({ additions: 0, subtractions: 0 });

  useEffect(() => {
    const newSummary = history.reduce(
      (acc, item) => {
        if (item === "RESET") return acc;
        const num = Number(item); 
        if (!isNaN(num)) {
          if (num > 0) acc.additions += 1;
          if (num < 0) acc.subtractions += 1;
        }
        return acc;
      },
      { additions: 0, subtractions: 0 }
    );

    setSummary(newSummary);
  }, [history]); 

  const totalMessage =
    count > 0
      ? "The total is positive."
      : count < 0
      ? "The total is negative."
      : "The total is zero.";

  return (
    <aside id="sidebar">
      <h3>RESULT</h3>
      <p id="resultId">{count}</p>
      <p id="totalMessage">{totalMessage}</p>

      <h3>SUMMARY</h3>
      <p id="summary">
        Total additions: {summary.additions}<br />
        Total subtractions: {summary.subtractions}
      </p>

      <h3>HISTORY</h3>
      <ul id="historyList">
        {history.map((item, i) => (
          <li
            key={i}
            onClick={() => dispatch({ type: "UPDATE_HISTORY", payload: i })}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;