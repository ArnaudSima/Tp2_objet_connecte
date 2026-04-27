import "dotenv/config";
import { createServer } from "http";
import express from "express";
import { CosmosClient } from "@azure/cosmos";
import cors from "cors";
import {
  webClientIotDevice,
  listDevices,
  registerDevice,
  sendMessage,
  deleteDevice,
} from "./iotHub.js";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());
const server = createServer(app);
const wss = new WebSocketServer({ server });

const cosmoDBEndpoint = "https://rasberrypicosmos.documents.azure.com:443/";
const client = new CosmosClient({
  endpoint: cosmoDBEndpoint,
  key: process.env.cosmodbkey,
});
const databaseName = "Tp2ObjetConnecte";
const inputContainerName = "inputs";
const doorCommandsContainerName = "door-commands";
const database = client.database(databaseName);
const inputContainer = database.container(inputContainerName);
const doorCommandsContainer = database.container(doorCommandsContainerName);

webClientIotDevice.on("message", async (msg) => {
  try {
    const data = JSON.parse(msg.data.toString());
    console.log("Donnees recues du Pi :", data);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });

    const item = {
      id: Date.now().toString(),
      temp: data.temp,
      lum: data.lum,
      dist: data.dist,
      doorOpeningPercentage: data.doorOpeningPercentage,
      automaticDoorOpeningPercentage: data.automaticDoorOpeningPercentage,
      doorMode: data.doorMode,
      motorSpeed: data.motorSpeed,
      alert: data.alert,
      createdAt: new Date().toISOString(),
    };
    await inputContainer.items.create(item);

  } catch (err) {
    console.error("Erreur traitement message Pi :", err);
  }
});

app.get("/iotHub/devices", (req, res) => {
  listDevices((err, devices) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(devices);
  });
});

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

app.post("/cosmoDb/doorCommands", async (req, res) => {
  try {
    const doorCommand = req.body;
    const command = {
      id: Date.now().toString(),
      doorCommand,
      createdAt: new Date().toISOString(),
    };
    const { resource } = await doorCommandsContainer.items.create(command);
    return res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'insertion" });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("Server running on http://localhost:3000"),
);
