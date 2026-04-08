const amqp = require("amqplib");

async function worker() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = "task_queue";

    await channel.assertQueue(queue, {
      durable: false,
    });

    channel.prefetch(1);
    console.log(`[*] Waiting for message in %s. To exit press CTRL+C`, queue);

    channel.consume(
      queue,
      (msg) => {
        const exit = process.argv.slice(2).join(" ");

        console.log("Exit", exit);
        if (exit === "exit") {
          console.log("Exiting...");
          process.exit(0);
        }
        const secs = msg.content.toString().split(".").length - 1;
        console.log(
          ` [x] Received ${msg.content.toString()} in ${secs} seconds`,
        );

        setTimeout(() => {
          console.log(" [x] Done");
          channel.ack(msg);
        }, secs * 1000);
      },
      {
        noAck: false,
      },
    );
  } catch (error) {
    console.log(error);
  }
}

worker();
