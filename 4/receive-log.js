const amqp = require("amqplib");

async function receiveLog() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "log";

    await channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    const q = await channel.assertQueue("", {
      exclusive: true,
    });

    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      q.queue,
    );

    channel.bindQueue(q.queue, exchange, "");

    channel.consume(
      q.queue,
      (msg) => {
        console.log(" [x] %s", msg.content.toString());
      },
      {
        noAck: true,
      },
    );
  } catch (error) {
    console.log(error);
  }
}

receiveLog();
