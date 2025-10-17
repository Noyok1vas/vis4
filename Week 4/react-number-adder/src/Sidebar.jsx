// Sidebar.jsx
import "./Sidebar.css";
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

function Sidebar() {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.count);
  const history = useSelector((state) => state.history);

  const totalMessage =
    count > 0 ? "The total is positive."
    : count < 0 ? "The total is negative."
    : "The total is zero.";

  const { additions, subtractions } = history.reduce(
    (acc, item) => {
      if (item === "RESET") return acc;
      if (typeof item === "number") {
        if (item > 0) acc.additions += 1;
        if (item < 0) acc.subtractions += 1;
      }
      return acc;
    },
    { additions: 0, subtractions: 0 }
  );

  return (
    <aside id="sidebar">
      <h3>RESULT</h3>
      <p id="resultId">{count}</p>
      <p id="totalMessage">{totalMessage}</p>

      <h3>SUMMARY</h3>
      <p id="summary">
        Total additions: {additions}<br />
        Total subtractions: {subtractions}
      </p>

      <h3>HISTORY</h3>
      <ul id="historyList">
        {history.map((item, i) => (
          <li
            key={i}
            onClick={() => dispatch({ type: 'UPDATE_HISTORY', payload: i })}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;