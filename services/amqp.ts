import amqplib from "amqplib";
import dotenv from "dotenv";

dotenv.config();

//can have multiple queues to perform multiple tasks
const QUEUE = "tasks";

let chan: amqplib.Channel;
let i = 1; //message index

(async () => {
  try {
    const conn = await amqplib.connect(process.env.CONNECTION_STRING as string);

    chan = await conn.createChannel();
    await chan.assertQueue(QUEUE, {
      durable: true, //persist this queue
    });

    setInterval(async () => {
      try {
        sendToTasks(`Message ${i++}`);
      } catch (error) {
        console.log(error);
      }
    }, 5000);
  } catch (error) {
    console.log(error);
  }
})();

export function sendToTasks(msg: string) {
  if (!chan) {
    throw new Error("Channel does not exist!");
  }

  console.log("Sending AMQP message: ", msg);

  chan.sendToQueue(QUEUE, Buffer.from(msg), { persistent: true });
}
