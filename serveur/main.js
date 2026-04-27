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
app.use(cors()); // pour permettre les requêtes depuis ton front
app.use(express.json());

const server = createServer(app);
console.log("Creating WebSocket server...");
const wss = new WebSocketServer({ server });

console.log("WebSocket server listening...");
webClientIotDevice.on("message", async (msg) => {
  try {
    const data = JSON.parse(msg.data.toString());
    webClientIotDevice.complete(msg);

    const item = {
      id: Date.now().toString(),
      temp: data.temp,
      lum: data.lum,
      dist: data.dist,
      createdAt: new Date().toISOString(),
    };

    await inputContainer.items.create(item);
    wss.clients.forEach((ws) => ws.send(JSON.stringify(data)));
  } catch (err) {
    console.error(err);
  }
});

//CosmoDB
const cosmoDBEndpoint = "https://rasberrypicosmos.documents.azure.com:443/";
console.log("Connecting to cosmodb...");
const client = new CosmosClient({
  endpoint: cosmoDBEndpoint,
  key: process.env.cosmodbkey,
});
console.log("Connected to cosmo db");
const databaseName = "Tp2ObjetConnecte";
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

app.post("/cosmoDb/doorCommands", async (req, res) => {
  try {
    console.log(req.body);
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
