import "./navbar.css";
import React, { useState } from 'react';
 
//const header = "This is a Navbar";

//let myStyle = {
//	color: "red",
//	backgroundColor: "green"
//};

function Navbar(props) {
	//return <h1 style={myStyle}>{props.headerTitle}</h1>;
	

	// var count = 12;
	const [count, setCount] =useState(12);

	return (
		<div>
			<h1 className="NavbarTitle">{props.headerTitle}</h1>
			<p>Total: {count}</p>
			
			<button onClick={() => {
				setCount(count + 1);
				console.log("Add 1");
				}}>Add 1</button>

			<button onClick={() => {
				setCount(count - 1);
				console.log("Remove 1");
				}}>Remove 1</button>
			
			<button onClick={() => setCount(0)}>Reset</button>
		</div>
	);
}

export default Navbar;