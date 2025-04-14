const app = require("./app");
const connectDB = require("./config/mongo");
const { connectKafka } = require("./config/kafka");
const {
  initCourseCompletedConsumer,
} = require("./consumers/courseCompleted.consumer");
require("dotenv").config();

// Xử lý sự kiện kết thúc không mong muốn
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

// Khởi động server
const startServer = async () => {
  try {
    // Kết nối MongoDB
    await connectDB();

    // Kết nối Kafka
    // await connectKafka();

    // Khởi tạo Kafka consumer
    // await initCourseCompletedConsumer();

    // Khởi động server
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(
        `Server đang chạy trên cổng ${PORT} trong môi trường ${process.env.NODE_ENV}`
      );
    });
  } catch (error) {
    console.error(`Lỗi khi khởi động server: ${error.message}`);
    process.exit(1);
  }
};

// Khởi động ứng dụng
startServer();
