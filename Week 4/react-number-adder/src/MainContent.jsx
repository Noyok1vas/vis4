// mainContent.jsx
import "./MainContent.css";
import React from 'react';
import { useDispatch } from 'react-redux';
import ControlButton from './ControlButton';

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
          <ControlButton id="buttonMinus2" label="-2" actionType="REMOVE_2" onClick={() => console.log("-2")} />
          <ControlButton id="buttonMinus1" label="-1" actionType="REMOVE_1" onClick={() => console.log("-1")} />
          <ControlButton id="buttonReset"  label="Reset" actionType="RESET" onClick={() => console.log("Reset")} />
          <ControlButton id="buttonPlus1"  label="+1" actionType="ADD_1" onClick={() => console.log("+1")} />
          <ControlButton id="buttonPlus2"  label="+2" actionType="ADD_2" onClick={() => console.log("+2")} />
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