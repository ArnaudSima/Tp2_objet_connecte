let rectangle = document.getElementById("rectangle-container");
const displayedTemp = document.getElementById("displayed-temp");
const displayedLum = document.getElementById("displayed-lum");
const doorDist = document.getElementById("door-dist");
const manuelInput = document.getElementById("manuel-input");
const rectangleGageUnit = document.createElement("div");
const changeModeButton = document.getElementById("mode-btn");
const automaticDoorOpening = document.getElementById("automatic-door-opening");
const alertMessage = document.getElementById("alert-message");
const motorSpeed = document.getElementById("motor-speed");

const doorOpeningInPercentage = document.getElementById(
  "door-opening-in-percentage",
);
rectangleGageUnit.className = "rectangle-gage-unit";
const host =
  "https://tp2objetconnecte.ambitiousplant-39792309.canadaeast.azurecontainerapps.io";
const ws = new WebSocket(
  "wss://tp2objetconnecte.ambitiousplant-39792309.canadaeast.azurecontainerapps.io",
);
var temp = 0;
var lum = 0;
var dist = 0;

const handleRectangleGage = (percentage) => {
  const rectangle = document.getElementById("rectangle-container");
  rectangle.innerHTML = "";

  const filled = Math.round((parseInt(percentage) / 100) * 5);

  for (let index = 0; index < 5; index++) {
    const unit = document.createElement("div");
    unit.className = "rectangle-gage-unit";
    if (index < filled) {
      unit.classList.add("filled");
    }
    rectangle.appendChild(unit);
  }
};

const doorCommand = async (payload) => {
  try {
    const responseCosmodb = await fetch(`${host}/cosmoDb/doorCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseIotHub = await fetch(
      `${host}/iothub/sendDoorCommand/rasberrypi-salon`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    let messageFeedBack = ``;
    if (!responseCosmodb.ok || !responseIotHub.ok) {
      if (!responseCosmodb.ok) {
        console.error(responseCosmodb.status);
        messageFeedBack += `Erreur lors de l'envoie à : cosmoDb`;
      }
      if (!responseIotHub.ok) {
        console.error(responseIotHub.status);
        messageFeedBack += `, IotHub`;
      }
    } else {
      messageFeedBack += "Information envoyée avec succès!";
    }

    window.alert(messageFeedBack);
  } catch (error) {
    console.error(error);
    window.alert("Erreur inatendue!");
  }
};
let isAutomatic = false;

const changeMode = () => {
  if (isAutomatic) {
    isAutomatic = false;
    changeModeButton.textContent = "Manuel";
    doorCommand({ command: "CHANGE_MODE", mode: "MANUAL" });
  } else {
    isAutomatic = true;
    changeModeButton.textContent = "Automatique";
    doorCommand({ command: "CHANGE_MODE", mode: "AUTOMATIC" });
  }
};

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

handleRectangleGage(automaticDoorOpening.textContent);

ws.onmessage = (event) => {
  window.alert("Data received from the pi!");
  const inputs = JSON.parse(event.data);
  changeModeButton.textContent = inputs.doorMode;
  displayedTemp.textContent = inputs.temp;
  displayedLum.textContent = inputs.lum;
  doorDist.textContent = inputs.dist;
  automaticDoorOpening.textContent = inputs.automaticDoorOpeningPercentage;
  doorOpeningInPercentage.textContent = inputs.doorOpeningPercentage;
  motorSpeed.textContent = inputs.motorSpeed ?? 0;
  handleRectangleGage(inputs.doorOpeningPercentage);
  // Affiche l'alerte si le Pi en envoie une, sinon cache
  if (inputs.alert) {
    alertMessage.textContent = inputs.alert;
    alertMessage.style.display = "block";
  } else {
    alertMessage.style.display = "none";
  }
};
