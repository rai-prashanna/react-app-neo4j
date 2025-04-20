// ChildA.jsx
import React from "react";

function ChildA({ sendData }) {
  const handleClick = () => {
    sendData("Hello from ChildA!");
  };

  return <button onClick={handleClick}>Send to ChildB</button>;
}

export default ChildA;
