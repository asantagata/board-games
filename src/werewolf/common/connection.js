import context, { cardShuffleRandomKey } from "./context.js";
import { handleMessageAsClient, sendMessageAsClient } from "../client/clientMessaging.js";
import { handleMessageAsServer, sendMessageAsServer } from "../server/serverMessaging.js";
import { ConfigObject } from "@server/configUtils.js";

const browserId = 
localStorage.getItem('browserId') ??
(() => {
    const UID = Array.from({length: 16}, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join('');
    localStorage.setItem('browserId', UID);
    return UID;
})();

const client = context.side !== "HOME" && new Ably.Realtime({ key: cardShuffleRandomKey, clientId: browserId });

export const Statuses = {
    NOT_CONNECTED: 0,
    CONNECTED: 1,
    ATTEMPTING_SUBSCRIBE: 2,
    SUBSCRIBED: 3,
    ATTEMPTING_JOIN: 4,
    ADMITTED: 5
};

export const MessageTypes = {
    JOIN_ROOM: "JOIN_ROOM",
    COMPLETE_PHASE: "COMPLETE_PHASE",
    ADMIT_PLAYER_TO_ROOM: "ADMIT_PLAYER_TO_ROOM",
    START_PHASE: "START_PHASE",
    PLAYER_REJOINED_DURING_PHASE: "PLAYER_REJOINED_DURING_PHASE",
    END_GAME: "END_GAME",
    CLOSE_ROOM: "CLOSE_ROOM",
    KICK_PLAYER: "KICK_PLAYER"
}

/**
 * A connection to an Ably realtime instance & channel
 * @typedef {Object} Connection
 * @property {string} browserId The browser's UID
 * @property {Object} client The Ably client
 * @property {number} status Ably client status
 * @property {string?} channelName The channel's name
 * @property {Object?} channel The channel
 * @property {() => Promise} subscribe Subscribes to the channel at channelName
 * @property {(messageType: string, ...params: any[]) => Promise} sendMessage Sends a message to the channel at channelName
 * @property {(message: Object) => Promise} sendMessageInternal Sends a message to the channel at channelName (for internal use)
 */

/** @type {Connection} */
const connection = {
    client,
    browserId,
    channelName: null,
    channel: null,
    status: Statuses.NOT_CONNECTED,
    subscribe: async () => {
        connection.status = Statuses.ATTEMPTING_SUBSCRIBE;
        connection.channel = connection.client.channels.get(connection.channelName);
        await connection.channel.subscribe(message => {
            if (context.side === "CLIENT") {
                handleMessageAsClient(message.data);
            } else {
                handleMessageAsServer(message.data);
            }
        });
        connection.status = Statuses.SUBSCRIBED;
    },
    sendMessage: async (messageType, ...params) => {
        if (connection < Statuses.SUBSCRIBED) throw new Error("Tried to send message as client without room connection");
        if (!connection.channel) throw new Error("Tried to send message with null channel");
        if (context.side === "CLIENT") {
            await sendMessageAsClient(messageType, ...params);
        } else {
            await sendMessageAsServer(messageType, ...params);
        }
    },
    sendMessageInternal: async (message) => {
        return await connection.channel.publish({data: message});
    }
}

client.connection?.once('connected').then(async () => {
    connection.status = Statuses.CONNECTED;
    context.rerender();
    if (context.side === "SERVER") {
        connection.channelName = Array.from({length: 4}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join('');
        await connection.subscribe();
        context.config = new ConfigObject;
        context.rerender();
    }
});

export default connection;