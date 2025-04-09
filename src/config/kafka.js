const { Kafka } = require("kafkajs");
require("dotenv").config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });

const connectKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log("Kafka Connected");
  } catch (error) {
    console.error(`Lỗi kết nối Kafka: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  kafka,
  producer,
  consumer,
  connectKafka,
};
