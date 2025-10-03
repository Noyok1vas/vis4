let history = [];

function updateHistory() {
	let historyContent = '';

	for (var i = 0; i < history.length; i++){
		historyContent += "<li>" + history[i] + "</li>";
 	}

 	document.querySelector('#historyList').innerHTML = historyContent;
}