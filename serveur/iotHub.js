import iotHub from "azure-iothub";
import iotDevice from "azure-iot-device-amqp";
import { Message } from "azure-iothub/dist/common-core/message.js";
import { WebSocketServer } from "ws";

console.log("Connecting to iot...");
console.log(process.env.IOTHUBCONNECTIONSTRING);
const iotHubRegistry = iotHub.Registry.fromConnectionString(
  process.env.IOTHUBCONNECTIONSTRING,
);
const iotHubClient = iotHub.Client.fromConnectionString(
  process.env.IOTHUBCONNECTIONSTRING,
);

const wss = new WebSocketServer({ port: 3001 });
console.log("Web socket listening on port 3031");

const webClientIotDevice = iotDevice.clientFromConnectionString(
  process.env.IOTHUBWEBCLIENTCONNECTIONSTRING,
);
console.log("Connected to iot hub");
await webClientIotDevice.open();

console.log("Web socket listening on port 3031");

webClientIotDevice.on("message", (msg) => {
  const data = msg.data.toString();
  webClientIotDevice.complete(msg);
  wss.clients.forEach((ws) => ws.send(data));
});

export function listDevices(callback) {
  iotHubRegistry.list(callback);
}

export function registerDevice(deviceId, callback) {
  iotHubRegistry.create({ deviceId }, callback);
}

export function sendMessage(deviceId, message, callback) {
  const msg = new Message(message);
  iotHubClient.send(deviceId, msg, callback);
}

export function deleteDevice(deviceId, callback) {
  iotHubRegistry.delete(deviceId, (err) => {
    callback(err, { deleted: deviceId });
  });
}
