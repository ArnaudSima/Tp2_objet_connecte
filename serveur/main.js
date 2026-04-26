import "dotenv/config";
import express from "express";
import { CosmosClient } from "@azure/cosmos";
import cors from "cors";
import {
  listDevices,
  registerDevice,
  sendMessage,
  deleteDevice,
} from "./iotHub.js";
const app = express();
app.use(cors()); // pour permettre les requêtes depuis ton front
app.use(express.json());

//CosmoDB
const cosmoDBEndpoint = "https://2267339.documents.azure.com/";
const client = new CosmosClient({
  endpoint: cosmoDBEndpoint,
  key: process.env.COSMO_DB_KEY,
});
const databaseName = "tp_final_object_connecte_db";
const inputContainerName = "inputs";
const doorCommandsContainerName = "door-commands";
const database = client.database(databaseName);
const inputContainer = database.container(inputContainerName);
const doorCommandsContainer = database.container(doorCommandsContainerName);

//iotHub
app.get("/iotHub/devices", (req, res) => {
  listDevices((err, devices) => {
    console.log("Fetching all devices...");
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(devices);
  });
});

//send message
app.put("/iotHub/sendDoorCommand/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const messageJson = req.body;
  const messageString = JSON.stringify(messageJson);

  console.log("Sending message to raspberry pi...");
  sendMessage(deviceId, messageString, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200);
  });
  console.log("Message sent");

  res.status(200).json({ message: "message sent" });
});
//Cosmodb
app.get("/cosmoDb/data", async (req, res) => {
  try {
    const { resources: items } = await inputContainer.items
      .query("SELECT * FROM c")
      .fetchAll();
    return res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

app.post("/cosmoDb/doorCommands/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const { command, isDoorDictated } = req.body;

    if (isDoorDictated) {
      await makeTheDoorManual("1", "CHANGE_MODE");
    }

    const { resource: existing } = await doorCommandsContainer
      .item(id, command)
      .read();

    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = {
      ...existing,
      ...req.body,
      id,
      command,
      updatedAt: new Date().toISOString(),
    };

    console.log(updated);
    const { resource } = await doorCommandsContainer
      .item(id, command)
      .replace(updated);

    return res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'insertion" });
  }
});

//cosmoDb method
const makeTheDoorManual = async (id, command) => {
  const { resource: existing } = await doorCommandsContainer
    .item(id, command)
    .read();

  const updateItem = {
    mode: "MANUAL",
  };
  const updated = {
    ...existing,
    ...updateItem,
    id,
    command,
    updatedAt: new Date().toISOString(),
  };
  const { resource } = await doorCommandsContainer
    .item(id, command)
    .replace(updated);
  console.log(resource);
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server running on http://localhost:3000"));
