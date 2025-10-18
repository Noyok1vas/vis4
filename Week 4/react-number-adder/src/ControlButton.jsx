import React from 'react';
import { useDispatch } from 'react-redux';

function ControlButton({ id, label, actionType, payload, onClick }) {
  const dispatch = useDispatch();

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
    dispatch({ type: actionType, payload });
  };

  return (
    <button id={id} onClick={handleClick}>
      {label}
    </button>
  );
}

export default ControlButton;


