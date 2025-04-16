const { consumer } = require("../config/kafka");
const certificateService = require("../services/certificate.service");

/**
 * Khởi tạo consumer cho topic 'course-completed'
 */
const initCourseCompletedConsumer = async () => {
  try {
    // Đăng ký consumer cho topic 'course-completed'
    await consumer.subscribe({
      topic: "course-completed",
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          console.log(
            `Received message from topic: ${topic}, partition: ${partition}`
          );

          // Parse dữ liệu từ message
          const messageData = JSON.parse(message.value.toString());
          console.log("Message data:", messageData);

          // Xử lý dữ liệu và tạo chứng chỉ
          await processCourseCompletedEvent(messageData);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });

    console.log("Course completed consumer initialized successfully");
  } catch (error) {
    console.error(
      `Error initializing course completed consumer: ${error.message}`
    );
  }
};

/**
 * Xử lý sự kiện hoàn thành khóa học và tạo chứng chỉ
 * @param {Object} eventData - Dữ liệu sự kiện hoàn thành khóa học
 */
const processCourseCompletedEvent = async (eventData) => {
  try {
    // Xác thực dữ liệu đầu vào
    const requiredFields = ["studentId", "courseId", "template"];
    for (const field of requiredFields) {
      if (!eventData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    // Xử lý tạo chứng chỉ
    await certificateService.processCourseCompletion(eventData);
    // checkVaoDay();

    console.log(
      `Certificate processed for student: ${eventData.studentName}, course: ${eventData.courseName}`
    );
  } catch (error) {
    console.error(`Error processing course completion: ${error.message}`);
  }
};

const checkVaoDay = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  console.log(`Today's date is: ${formattedDate}`);
};

module.exports = {
  initCourseCompletedConsumer,
};
