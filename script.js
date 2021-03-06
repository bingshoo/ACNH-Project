var showTimeInterval;
var currentDate = new Date();
var allFish = [];
var allBugs = [];
var fishData;
var bugData;
var bugFishTable;
var fishTableEntries;

// needs to make sure this finishes loading first 
fetch('https://acnhapi.com/v1/fish/')
    .then(response => response.json())
    .then(data => allFish = Object.values(data));

fetch('https://acnhapi.com/v1/bugs/')
    .then(response => response.json())
    .then(data => allBugs = Object.values(data))
    .catch(error => {
        console.log("Error with grabbing bug data");
        // alert("Reload the page");
    });

document.addEventListener("DOMContentLoaded", () => {
    showTime();
    // onchange working but maybe remove the button
    bugFishTable = document.querySelector('#bug-fish-table');
    fishTableEntries = bugFishTable.querySelector('tbody');
    document.querySelector("#time-travel-form").onchange = timeTravel;
    document.querySelector("#fish-toggle").onclick = displayCatchable;
    document.querySelector("#bug-toggle").onclick = displayCatchable;
    document.querySelector("#northern-hemisphere").onclick = displayCatchable;
    document.querySelector("#southern-hemisphere").onclick = displayCatchable;
    document.querySelector("#current-time-submit").onclick = () => {
        currentDate = new Date();
        clearInterval(showTimeInterval);
        showTimeInterval = setInterval(showTime, 500);
        alert(`Welcome back to the present!`)
    };
    showTimeInterval = setInterval(showTime, 500);
});

// need to fix time not updating properly 
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
        showTimeInterval = setInterval(showTime, 500);
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
            if (i === 0) {
                let name = bugFish[attributes[i]];
                let fixedName = name.replace(/_/g, " ");
                newContent = document.createTextNode(fixedName);
            } else {
                newContent = document.createTextNode(bugFish[attributes[i]]);
            }
        } else {
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
        return (calculateAvailability(item, isNorthernHemisphere));
    }
    return false;

}

function checkTime(timeIntervalString) {
    let timeIntervalArray = timeIntervalString.includes(" to ") ? timeIntervalString.split(" to ") : timeIntervalString.split(" - ");
    let firstTime = timeIntervalArray[0];
    let secondTime = timeIntervalArray[1];
    let possibleStartTime;
    let possibleEndTime;

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

    // find better way to do this 
    let newHours = new Array(24);
    if(possibleStartTime < possibleEndTime) {
        for (var i = 0; i < 24; i++) {
            if (i >= possibleStartTime && i < possibleEndTime) {
                newHours[i] = true;
            } else {
                newHours[i] = false;
            }
        }
    } else {
        for (var i = 0; i < 24; i++) {
            if (i <= possibleStartTime && i > possibleEndTime) {
                newHours[i] = false;
            } else {
                newHours[i] = true;
            }
        }
    }
    let currentHour = currentDate.getHours();
    return newHours[currentHour];
}

function calculateAvailability(item, isNorthernHemisphere) {
    // should parse month and time then compare with currentDate
    let availableMonths = isNorthernHemisphere? item.availability["month-array-northern"] : item.availability["month-array-southern"]; 
    if(item["file-name"] === "king_salmon" || item["file-name"] === "salmon") {
        availableMonths = isNorthernHemisphere? [parseInt(item.availability["month-northern"])] : [parseInt(item.availability["month-southern"])]; 
    }
    if (!availableMonths.includes(currentDate.getMonth() + 1)) {
        return false;
    }
    if (item.availability.isAllDay) {
        return true;
    }
    return checkTime(item.availability.time)
}
