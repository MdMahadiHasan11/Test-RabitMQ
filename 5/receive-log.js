const amqp = require("amqplib");

const args = process.argv.slice(2);
if (args.length == 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
  process.exit(1);
}

async function receiveLog() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "direct_log";

    await channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    const q = await channel.assertQueue("", {
      exclusive: true,
    });

    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      q.queue,
    );

    args.forEach((severity) => {
      channel.bindQueue(q.queue, exchange, severity);
    });

    channel.consume(
      q.queue,
      (msg) => {
        console.log(
          " [x] %s: '%s'",
          msg.fields.routingKey,
          msg.content.toString(),
        );
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
