// MainContent.jsx
import "./MainContent.css";
import React from 'react';
import { useDispatch } from 'react-redux';

function MainContent() {
  const dispatch = useDispatch();

  const handleRemove2 = () => dispatch({ type: 'REMOVE_2' });
  const handleRemove1 = () => dispatch({ type: 'REMOVE_1' });
  const handleReset   = () => dispatch({ type: 'RESET' }); 
  const handleAdd1    = () => dispatch({ type: 'ADD_1' });
  const handleAdd2    = () => dispatch({ type: 'ADD_2' });

  return (
    <main className="MainContent">
      <h3>Control Center</h3>

      <div className="controls-block">
        <div className="controls">
          <button id="buttonMinus2" onClick={() => { 
            console.log("-2"); handleRemove2(); 
          }}>-2</button>
          <button id="buttonMinus1" onClick={() => { 
            console.log("-1"); handleRemove1(); 
          }}>-1</button>
          <button id="buttonReset"  onClick={() => { 
            console.log("Reset"); handleReset(); 
          }}>Reset</button>
          <button id="buttonPlus1"  onClick={() => { 
            console.log("+1"); handleAdd1(); 
          }}>+1</button>
          <button id="buttonPlus2"  onClick={() => { 
            console.log("+2"); handleAdd2(); 
          }}>+2</button>
        </div>

        <div className="clear-container">
          <button
            id="buttonClearAll"
            onClick={() => dispatch({ type: 'CLEAR_ALL' })}
          >
            Clear History & Results
          </button>
        </div>
      </div>
    </main>
  );
}

export default MainContent;