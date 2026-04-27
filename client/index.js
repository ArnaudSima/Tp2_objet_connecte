let rectangle = document.getElementById("rectangle-container");
const displayedTemp = document.getElementById("displayed-temp");
const displayedLum = document.getElementById("displayed-lum");
const doorDist = document.getElementById("door-dist");
const manuelInput = document.getElementById("manuel-input");
const rectangleGageUnit = document.createElement("div");
rectangleGageUnit.className = "rectangle-gage-unit";
const host =
  "https://tp2objetconnecte.ambitiousplant-39792309.canadaeast.azurecontainerapps.io";
const ws = new WebSocket(
  "wss://tp2objetconnecte.ambitiousplant-39792309.canadaeast.azurecontainerapps.io",
);
var temp = 0;
var lum = 0;
var dist = 0;

const handleRectangleGage = (rectangle, rectangleGageUnit) => {
  for (let index = 0; index < 2; index++) {
    rectangle.appendChild(rectangleGageUnit.cloneNode(true));
  }
};

// const fetchData = async () => {
//   const iotHubResponse = await fetch(`${host}/api/data`, { method: "GET" });

//   const cosmoDBResponse = await fetch(`${host}/api/data`, { method: "GET" });
//   if (!cosmoDBResponse.ok) {
//     console.error(cosmoDBResponse.status);
//     return;
//   }

//   const result = await cosmoDBResponse.json();
//   const inputs = result[0]?.inputs;
//   displayedTemp.textContent = inputs.celsius;
//   displayedLum.textContent = inputs.lumens;
//   doorDist.textContent = inputs.distance;
// };

const doorCommand = async (payload) => {
  try {
    const responseCosmodb = await fetch(
      `${host}/cosmoDb/doorCommands/${payload.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!responseCosmodb.ok) {
      console.error(responseCosmodb.status);
    }

    const responseIotHub = await fetch(
      `${host}/iothub/sendDoorCommand/rasberrypi-salon`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!responseIotHub.ok) {
      console.error(responseIotHub.status);
    }
  } catch (error) {
    console.error(error);
  }
};
const setModeAuto = () =>
  doorCommand({ command: "CHANGE_MODE", mode: "AUTOMATIC" });

const setModeManuel = () =>
  doorCommand({ command: "CHANGE_MODE", mode: "MANUAL" });

const openTheDoor = () => {
  doorCommand({ command: "OPEN_DOOR" });
};

const closeTheDoor = () => {
  doorCommand({ command: "CLOSE_DOOR" });
};
const dictateDoorOpeningPercentage = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    console.log("Enter key was pressed!");
    doorCommand({
      command: "DICTATE_DOOR_OPENING_PERCENTAGE",
      isDoorDictated: true,
      percentage: manuelInput.value,
    });
  }
};

handleRectangleGage(rectangle, rectangleGageUnit);

ws.onmessage = (event) => {
  const inputs = JSON.parse(event.data);
  displayedTemp.textContent = inputs.celsius;
  displayedLum.textContent = inputs.lumens;
  doorDist.textContent = inputs.distance;
};
