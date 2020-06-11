var showTimeInterval;
var currentDate = new Date();
var allFish = [];
var allBugs = [];
var fishData;
var bugData;
var bugFishTable;
var fishTableEntries;

// needs to make sure this finishes loading first 
for(var fishID = 1; fishID <= 80; fishID++) {
    fetch('http://acnhapi.com/v1/fish/' + fishID)
    .then(response => response.json())
    .then(data => allFish.push(data));
}

for(var bugID = 1; bugID <= 80; bugID++) {
    fetch('http://acnhapi.com/v1/bugs/' + bugID)
    .then(response => response.json())
    .then(data => allBugs.push(data))
    .catch(error => {
        console.log("Error with grabbing bug data");
        // alert("Reload the page");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    showTime();
    // onchange working but maybe remove the button
    bugFishTable = document.querySelector('#bug-fish-table');
    fishTableEntries = bugFishTable.querySelector('tbody');
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
    fishTableEntries.innerHTML = "";
    if (isFishSelected)
        display(allFish);

    if (isBugSelected)
        display(allBugs);
}

function display(collection) {
    for(let element of collection) {
        if(isAvailable(element)) {
            insertIntoBugFishTable(element);
        }
    }
    console.log(collection.length);
}

function insertIntoBugFishTable(bugFish) {
    let newRow = fishTableEntries.insertRow();
    let attributes = ['file-name', 'price', 'icon_uri']
    let newContent;
    for(let i= 0; i<3; i++) {
        let newCell = newRow.insertCell(i);
        if (i < 2) {
            newContent = document.createTextNode(bugFish[attributes[i]]);
        } else {
            // TODO need to fix the images 
            let imageNode = document.createElement('img');
            imageNode.src = bugFish[attributes[i]];
            imageNode.alt = attributes[i];
            newContent = imageNode;
        }
        newCell.append(newContent);
    }
}

// checks whether fish or bug is available depending on current time 
function isAvailable(item) {
    let isNorthernHemisphere = document.querySelector("#northern-hemisphere").checked;
    if (item.availability.isAllDay && item.availability.isAllYear)
        return true;

    if (item.availability.isAllYear) {
        return (checkTime(item.availability.time));
    } else {
        return (calculateAvailability(item.availability, isNorthernHemisphere));
    }
    // TODO need to fix
    return false;

}

function checkTime(timeIntervalString) {
    let timeIntervalArray = timeIntervalString.split(" - ");
    let firstTime = timeIntervalArray[0];
    let secondTime = timeIntervalArray[1];
    let possibleStartTime;
    let possibleEndTime;
    let startTime;
    let endTime;

    // will need to deal with times with multiple intervals
    // bugs data is bugging out on this includes pm but fish are working fine
    if(firstTime.includes("pm")) {
        let temp = parseInt(firstTime.replace("pm", ""));
        possibleStartTime = temp + 12;
    } else {
        possibleStartTime = parseInt(firstTime.replace("am", ""));
    }

    if(secondTime.includes("pm")) {
        let temp = parseInt(secondTime.replace("pm", ""));
        possibleEndTime = temp + 12;
    } else {
        possibleEndTime = parseInt(secondTime.replace("am", ""));
    }

    startTime = Math.min(possibleStartTime, possibleEndTime);
    endTime = Math.max(possibleStartTime, possibleEndTime);
    // need to fix newHours
    let newHours = new Array(24);
    for (var i = 0; i < 24; i++) {
        if (i >= startTime && i < endTime) {
            newHours[i] = true;
        } else {
            newHours[i] = false;
        }
    }

    let currentHour = currentDate.getHours();
    return newHours[currentHour];
}

function calculateAvailability(availability, isNorthernHemisphere) {
    // should parse month and time then compare with currentDate
    let availableMonths = isNorthernHemisphere? availability["month-array-northern"] : availability["month-array-southern"]; 
    if (!availableMonths.includes(currentDate.getMonth + 1)) {
        return false;
    }
    if (availability.isAllDay) {
        return true;
    }
    return checkTime(availability.time)
}
