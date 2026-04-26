import iotHub from "azure-iothub";
import iotDevice from "azure-iot-device-amqp";
import { Message } from "azure-iothub/dist/common-core/message.js";
import { WebSocketServer } from "ws";

console.log("Connecting to iot...");
console.log("test3");
console.log(process.env.cosmodbkey);
const iotHubRegistry = iotHub.Registry.fromConnectionString(
  process.env.iothubconnectionstring,
);
const iotHubClient = iotHub.Client.fromConnectionString(
  process.env.iothubconnectionstring,
);

export const webClientIotDevice = iotDevice.clientFromConnectionString(
  process.env.iothubwebclientconnectionstring,
);
console.log("Connected to iot hub");
await webClientIotDevice.open();

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
