import * as dotenv from 'dotenv';
import input from "input";
import { TelegramClient } from "telegram";
import { NewMessageEvent } from "telegram/events";
import { StringSession } from "telegram/sessions";

dotenv.config();

const apiId = process.env.TELEGRAM_APP_ID ?? '0';
const apiHash = process.env.TELEGRAM_APP_HASH ?? '';
const phoneNumber = process.env.PHONE ?? '';;

let sessionKey = "";
const stringSession = new StringSession(sessionKey); // fill this later with the value from session.save()

const client = new TelegramClient(stringSession, parseInt(apiId), apiHash, {
  connectionRetries: 5,
  useWSS: false
});

async function disconnect() {
  await client.disconnect();
}

async function connect() {
  // await client.connect();
  await client.start({
    phoneNumber: phoneNumber,
    phoneCode: async () => await input.text("Code ?"),
    onError: (err) => console.log(err)
  });
  console.log(client.session.save()); // Save this string to avoid logging in again
  const me = await client.getMe();
  // console.log(me);
}

async function eventPrint(event: NewMessageEvent) {
  if (client) {
    const message = event.message;

    // Checks if it's a private message (from user or bot)
    if (event.isPrivate) {
      // prints sender id
      console.log(message.senderId);
      const sender = await message.getSender();
      if (sender) {
        console.log("sender is", sender);
        await client.sendMessage(sender, {
          message: `hi your id is ${message.senderId}`
        });
      }
    }
  }
}

async function main() {
  if (client.connected) await disconnect();
  if (!client.connected) await connect();

  // adds an event handler for new messages
  // client.addEventHandler(eventPrint, new NewMessage({}));

  if (client.connected) disconnect();
}

main();
