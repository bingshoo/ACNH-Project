var showTimeInterval;
var currentDate = new Date();
var allFish = [];
var allBugs = [];
var fishData;
var bugData;
var bugFishTable;

document.addEventListener("DOMContentLoaded", () => {
    showTime();
    // onchange working but maybe remove the button
    bugFishTable = document.querySelector('#bug-fish-table');
    document.querySelector("#time-travel-form").onchange = timeTravel;
    document.querySelector("#fish-toggle").onclick = displayCatchable;
    document.querySelector("#bug-toggle").onclick = displayCatchable;
    document.querySelector("#current-time-submit").onclick = () => {
        currentDate = new Date();
        clearInterval(showTimeInterval);
        showTimeInterval = setInterval(showTime, 1000);
        alert(`Welcome back to the present!`)
    };
    showTimeInterval = setInterval(showTime, 1000);

    // needs to make sure this finishes loading first 
    for(var fishID = 1; fishID <= 80; fishID++) {
        fetch('http://acnhapi.com/v1/fish/' + fishID)
        .then(response => response.json())
        .then(data => allFish.push(data));
    }


    fetch('http://acnhapi.com/v1/bugs/')
        .then(response => response.json())
        .then(data => bugData = data);
});

function showTime() {
    var hour = currentDate.getHours();
    var minute = currentDate.getMinutes();
    let displayHour = (hour < 9) ? "0" + currentDate.getHours():currentDate.getHours();
    var displayMinute = (minute < 9) ? "0" + currentDate.getMinutes():currentDate.getMinutes();
    document.getElementById("currDateTime").innerHTML = `${currentDate.toDateString()} ${displayHour}:${displayMinute}`;
    document.getElementById("currDateTime").textContent = `${currentDate.toDateString()} ${displayHour}:${displayMinute}`;
}

function timeTravel() {
    // bug here when there is no date selected on the datetime
    try {
        // sets the Date to the user selected date and reset the interval 
        const travelDateTime = document.querySelector("#time-travler-datetime");
        currentDate = new Date(travelDateTime.value); 
        alert(`Welcome to ${currentDate.toDateString()}`);
        clearInterval(showTimeInterval);
        showTimeInterval = setInterval(showTime, 1000);
    } catch (e) {
        alert(`Insert a date to travel to!`);
    }
    // alert(`Welcome to ${currentDate.toDateString()}`);
    // clearInterval(showTimeInterval);
    // showTimeInterval = setInterval(showTime, 1000);
    console.log("trying to time travel!");
    return false;
}

function displayCatchable() {
    const isFishSelected = document.querySelector("#fish-toggle").checked;
    const isBugSelected = document.querySelector("#bug-toggle").checked;
    let isNorthernHemisphere = document.querySelector("#northern-hemisphere").checked;

    console.log(`fish? ${isFishSelected} bug? ${isBugSelected} northern? ${isNorthernHemisphere} southern? ${!isNorthernHemisphere}`);
    let fishTableEntries = bugFishTable.querySelector('tbody');
    for(let fish of allFish) {
        let newRow = fishTableEntries.insertRow();
        let attributes = ['file-name', 'price', 'shadow', 'icon_uri', 'image_uri']
        let newContent;
        for(let i= 0; i<5; i++) {
            let newCell = newRow.insertCell(i);
            if (i < 3) {
                newContent = document.createTextNode(fish[attributes[i]]);
            } else {
                // TODO need to fix the images 
                let imageNode = document.createElement('img');
                imageNode.src = fish[attributes[i]];
                imageNode.alt = attributes[i];
                newContent = imageNode;
            }
            newCell.append(newContent);
        }
    }
}

